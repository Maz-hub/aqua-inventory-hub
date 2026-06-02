from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ItemRequest, ItemRequestItem
from .serializers import ItemRequestSerializer, ItemRequestItemSerializer, DepartmentSerializer
from accounts.permissions import IsAdminUser
from core.models import Department
from gifts.models import Gift, InventoryTransaction
from apparel.models import ApparelVariant, ApparelTransaction


# ============================================
# DEPARTMENT VIEWS
# ============================================

class DepartmentList(generics.ListAPIView):
    """
    Returns all departments for dropdown population.
    GET /api/requests/departments/
    Accessible to all authenticated users.
    """
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    queryset = Department.objects.all()


# ============================================
# ITEM REQUEST VIEWS
# ============================================

class ItemRequestListCreate(generics.ListCreateAPIView):
    """
    GET  /api/requests/          → Admin sees ALL requests
    POST /api/requests/          → Any user creates a new request
    """
    serializer_class = ItemRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Admin sees all requests.
        Regular users only see their own requests.
        """
        user = self.request.user
        if user.is_superuser or user.groups.filter(name='admin').exists():
            return ItemRequest.objects.all()
        return ItemRequest.objects.filter(requested_by=user)

    def perform_create(self, serializer):
        """
        Automatically sets the requester to the logged-in user.
        New requests always start as Draft.
        """
        serializer.save(
            requested_by=self.request.user,
            status='draft'
        )


class ItemRequestDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/requests/<id>/  → View request details
    PATCH  /api/requests/<id>/  → Update request
    DELETE /api/requests/<id>/  → Delete request (admin only)
    """
    serializer_class = ItemRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Admin can access any request.
        Regular users can only access their own.
        """
        user = self.request.user
        if user.is_superuser or user.groups.filter(name='admin').exists():
            return ItemRequest.objects.all()
        return ItemRequest.objects.filter(requested_by=user)

    def perform_update(self, serializer):
        """
        Records who last updated the request.
        """
        serializer.save(updated_by=self.request.user)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def submit_request(request, pk):
    """
    Moves a Draft request to Pending status.
    PATCH /api/requests/<id>/submit/
    Checks stock for all line items, deducts stock, creates transaction
    records, then sets status to pending.
    """
    item_request = get_object_or_404(ItemRequest, pk=pk)

    if item_request.requested_by != request.user:
        return Response(
            {"error": "You can only submit your own requests."},
            status=status.HTTP_403_FORBIDDEN
        )

    if item_request.status != 'draft':
        return Response(
            {"error": "Only draft requests can be submitted."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Stock availability check (all-or-nothing before any deduction) ---
    for item in item_request.items.all():
        if item.item_type == 'gift':
            try:
                gift = Gift.objects.get(pk=item.item_id)
            except Gift.DoesNotExist:
                return Response(
                    {"error": f"Gift #{item.item_id} no longer exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if item.quantity_requested > gift.qty_stock:
                return Response(
                    {"error": f"Only {gift.qty_stock} units available for {gift.product_name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif item.item_type == 'apparel':
            try:
                variant = ApparelVariant.objects.get(pk=item.item_id)
            except ApparelVariant.DoesNotExist:
                return Response(
                    {"error": f"Apparel variant #{item.item_id} no longer exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item_name = (
                f"{variant.product.product_name} — "
                f"{variant.size.size_value} {variant.color.color_name}"
            )
            if item.quantity_requested > variant.qty_stock:
                return Response(
                    {"error": f"Only {variant.qty_stock} units available for {item_name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

    # --- Deduct stock and record transactions ---
    for item in item_request.items.all():
        if item.item_type == 'gift':
            gift = Gift.objects.get(pk=item.item_id)
            stock_before = gift.qty_stock
            gift.qty_stock -= item.quantity_requested
            gift.save()
            InventoryTransaction.objects.create(
                gift=gift,
                transaction_type='take',
                quantity=item.quantity_requested,
                created_by=request.user,
                stock_before=stock_before,
                stock_after=gift.qty_stock,
                notes=f'Request #{item_request.id}',
            )
        elif item.item_type == 'apparel':
            variant = ApparelVariant.objects.get(pk=item.item_id)
            stock_before = variant.qty_stock
            variant.qty_stock -= item.quantity_requested
            variant.save()
            ApparelTransaction.objects.create(
                variant=variant,
                transaction_type='take',
                quantity=item.quantity_requested,
                created_by=request.user,
                stock_before=stock_before,
                stock_after=variant.qty_stock,
                notes=f'Request #{item_request.id}',
            )

    item_request.status = 'pending'
    item_request.save()

    return Response(
        {"message": "Request submitted successfully.", "status": "pending"},
        status=status.HTTP_200_OK
    )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cancel_request(request, pk):
    """
    Cancels a Pending request and restores stock.
    PATCH /api/requests/<id>/cancel/
    Only the requester or an admin can cancel. Only pending requests
    can be cancelled (draft requests should just be deleted).
    """
    item_request = get_object_or_404(ItemRequest, pk=pk)

    is_admin = (
        request.user.is_superuser or
        request.user.groups.filter(name='admin').exists()
    )

    if item_request.requested_by != request.user and not is_admin:
        return Response(
            {"error": "You can only cancel your own requests."},
            status=status.HTTP_403_FORBIDDEN
        )

    if item_request.status != 'pending':
        return Response(
            {"error": "Only pending requests can be cancelled."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Restore stock and record return transactions ---
    for item in item_request.items.all():
        if item.item_type == 'gift':
            try:
                gift = Gift.objects.get(pk=item.item_id)
                stock_before = gift.qty_stock
                gift.qty_stock += item.quantity_requested
                gift.save()
                InventoryTransaction.objects.create(
                    gift=gift,
                    transaction_type='return',
                    quantity=item.quantity_requested,
                    created_by=request.user,
                    stock_before=stock_before,
                    stock_after=gift.qty_stock,
                    notes=f'Request #{item_request.id}',
                )
            except Gift.DoesNotExist:
                pass  # Item deleted after submission — skip stock restore
        elif item.item_type == 'apparel':
            try:
                variant = ApparelVariant.objects.get(pk=item.item_id)
                stock_before = variant.qty_stock
                variant.qty_stock += item.quantity_requested
                variant.save()
                ApparelTransaction.objects.create(
                    variant=variant,
                    transaction_type='return',
                    quantity=item.quantity_requested,
                    created_by=request.user,
                    stock_before=stock_before,
                    stock_after=variant.qty_stock,
                    notes=f'Request #{item_request.id}',
                )
            except ApparelVariant.DoesNotExist:
                pass  # Variant deleted after submission — skip stock restore

    item_request.status = 'cancelled'
    item_request.updated_by = request.user
    item_request.save()

    return Response(
        {"message": "Request cancelled and stock restored.", "status": "cancelled"},
        status=status.HTTP_200_OK
    )


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_request_status(request, pk):
    """
    Admin updates request status through the workflow.
    PATCH /api/requests/<id>/status/
    Only admin can change status (except submit which is done by requester).
    """
    item_request = get_object_or_404(ItemRequest, pk=pk)
    new_status = request.data.get('status')

    valid_statuses = ['draft', 'pending', 'in_preparation', 'ready', 'completed', 'cancelled']

    if new_status not in valid_statuses:
        return Response(
            {"error": f"Invalid status. Choose from: {valid_statuses}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    item_request.status = new_status
    item_request.updated_by = request.user
    item_request.save()

    return Response(
        {"message": f"Status updated to {new_status}."},
        status=status.HTTP_200_OK
    )


# ============================================
# ITEM REQUEST LINE ITEMS
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_item_to_request(request, pk):
    """
    Adds a line item to an existing Draft request.
    POST /api/requests/<id>/items/add/
    Only works on Draft requests.
    """
    item_request = get_object_or_404(ItemRequest, pk=pk)

    # Only owner or admin can add items
    if item_request.requested_by != request.user:
        if not (request.user.is_superuser or
                request.user.groups.filter(name='admin').exists()):
            return Response(
                {"error": "You can only modify your own requests."},
                status=status.HTTP_403_FORBIDDEN
            )

    serializer = ItemRequestItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(request=item_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_request_item(request, pk, item_pk):
    """
    PATCH  /api/requests/<id>/items/<item_id>/  → Update a line item
    DELETE /api/requests/<id>/items/<item_id>/  → Remove a line item
    Admin can modify at any status.
    Requester can only modify their own Draft requests.
    """
    item_request = get_object_or_404(ItemRequest, pk=pk)
    item = get_object_or_404(ItemRequestItem, pk=item_pk, request=item_request)

    is_admin = request.user.is_superuser or \
               request.user.groups.filter(name='admin').exists()

    # Non-admin can only modify their own draft requests
    if not is_admin:
        if item_request.requested_by != request.user:
            return Response(
                {"error": "You can only modify your own requests."},
                status=status.HTTP_403_FORBIDDEN
            )
        if item_request.status != 'draft':
            return Response(
                {"error": "You can only modify draft requests."},
                status=status.HTTP_400_BAD_REQUEST
            )

    if request.method == 'DELETE':
        item.delete()
        return Response(
            {"message": "Item removed from request."},
            status=status.HTTP_204_NO_CONTENT
        )

    serializer = ItemRequestItemSerializer(item, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def confirm_request_item(request, pk, item_pk):
    """
    Admin sets or updates quantity_confirmed on a line item.
    PATCH /api/requests/<id>/items/<item_id>/confirm/
    Reconciles stock against the previously deducted quantity:
      - new qty < old qty → return the difference to stock
      - new qty > old qty → deduct the difference (400 if insufficient)
      - no change         → just save, no stock movement
    """
    item_request = get_object_or_404(ItemRequest, pk=pk)
    item = get_object_or_404(ItemRequestItem, pk=item_pk, request=item_request)

    new_qty = request.data.get('quantity_confirmed')
    if new_qty is None:
        return Response(
            {"error": "quantity_confirmed is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        new_qty = int(new_qty)
        if new_qty < 0:
            raise ValueError
    except (ValueError, TypeError):
        return Response(
            {"error": "quantity_confirmed must be a non-negative integer."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Previously deducted: use existing confirmed qty if already set, else original requested qty
    previously_deducted = (
        item.quantity_confirmed if item.quantity_confirmed is not None
        else item.quantity_requested
    )
    diff = new_qty - previously_deducted  # positive → need more stock; negative → return excess

    if diff != 0:
        if item.item_type == 'gift':
            try:
                gift = Gift.objects.get(pk=item.item_id)
            except Gift.DoesNotExist:
                return Response(
                    {"error": f"Gift #{item.item_id} no longer exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if diff > 0 and gift.qty_stock < diff:
                return Response(
                    {"error": f"Only {gift.qty_stock} units available for {gift.product_name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            stock_before = gift.qty_stock
            gift.qty_stock -= diff  # negative diff adds stock back, positive deducts
            gift.save()
            InventoryTransaction.objects.create(
                gift=gift,
                transaction_type='return' if diff < 0 else 'take',
                quantity=abs(diff),
                created_by=request.user,
                stock_before=stock_before,
                stock_after=gift.qty_stock,
            )

        elif item.item_type == 'apparel':
            try:
                variant = ApparelVariant.objects.get(pk=item.item_id)
            except ApparelVariant.DoesNotExist:
                return Response(
                    {"error": f"Apparel variant #{item.item_id} no longer exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if diff > 0 and variant.qty_stock < diff:
                item_name = (
                    f"{variant.product.product_name} — "
                    f"{variant.size.size_value} {variant.color.color_name}"
                )
                return Response(
                    {"error": f"Only {variant.qty_stock} units available for {item_name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            stock_before = variant.qty_stock
            variant.qty_stock -= diff
            variant.save()
            ApparelTransaction.objects.create(
                variant=variant,
                transaction_type='return' if diff < 0 else 'take',
                quantity=abs(diff),
                created_by=request.user,
                stock_before=stock_before,
                stock_after=variant.qty_stock,
            )

    item.quantity_confirmed = new_qty
    item.save()

    return Response(
        {"message": "Quantity confirmed and stock adjusted.", "quantity_confirmed": new_qty},
        status=status.HTTP_200_OK
    )
