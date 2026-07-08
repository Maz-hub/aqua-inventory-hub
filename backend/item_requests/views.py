import logging
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from .models import ItemRequest, ItemRequestItem
from .serializers import ItemRequestSerializer, ItemRequestItemSerializer, DepartmentSerializer
from accounts.permissions import HasRequestsAccess
from core.models import Department
from gifts.models import Gift, InventoryTransaction
from apparel.models import ApparelVariant, ApparelTransaction
from office.models import OfficeItem, OfficeTransaction
from miscellaneous.models import MiscellaneousItem, MiscellaneousTransaction

logger = logging.getLogger(__name__)


# ============================================
# DEPARTMENT VIEWS
# ============================================

# Returns all departments for the request form dropdown.
# GET /api/requests/departments/
# Accessible to all authenticated users so the form can be populated.
class DepartmentList(generics.ListAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    queryset = Department.objects.all()


# ============================================
# ITEM REQUEST VIEWS
# ============================================

# Lists requests or creates a new one.
# GET  /api/requests/  - admins see all requests; regular users see only their own.
# POST /api/requests/  - any authenticated user can create a request.
#                        requested_by and status='draft' are set automatically.
class ItemRequestListCreate(generics.ListCreateAPIView):
    serializer_class = ItemRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.groups.filter(name='admin').exists():
            return ItemRequest.objects.all()
        return ItemRequest.objects.filter(requested_by=user)

    def perform_create(self, serializer):
        serializer.save(
            requested_by=self.request.user,
            status='draft'
        )


# Retrieves, updates, or deletes a single request.
# GET    /api/requests/{id}/  - admins can view any request; users can only view their own.
# PATCH  /api/requests/{id}/  - used to save admin notes; updated_by is recorded automatically.
# DELETE /api/requests/{id}/  - intended for admin use to remove a request entirely.
class ItemRequestDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.groups.filter(name='admin').exists():
            return ItemRequest.objects.all()
        return ItemRequest.objects.filter(requested_by=user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


# Moves a Draft request to Pending and deducts stock for all line items.
# PATCH /api/requests/{id}/submit/
#
# Only the requester can submit their own request.
# Stock check runs as all-or-nothing BEFORE any deductions: if any item
# has insufficient stock, the whole submission is rejected with a clear error.
# This prevents partial deductions where some items succeed and others fail.
# Once all checks pass, stock is deducted for each item and a transaction
# record is written (gift or apparel) with notes referencing the request ID.
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def submit_request(request, pk):
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
        elif item.item_type == 'office':
            try:
                office_item = OfficeItem.objects.get(pk=item.item_id)
            except OfficeItem.DoesNotExist:
                return Response(
                    {"error": f"Office item #{item.item_id} no longer exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if item.quantity_requested > office_item.qty_stock:
                return Response(
                    {"error": f"Only {office_item.qty_stock} units available for {office_item.item_name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif item.item_type == 'miscellaneous':
            try:
                misc_item = MiscellaneousItem.objects.get(pk=item.item_id)
            except MiscellaneousItem.DoesNotExist:
                return Response(
                    {"error": f"Miscellaneous item #{item.item_id} no longer exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if item.quantity_requested > misc_item.qty_stock:
                return Response(
                    {"error": f"Only {misc_item.qty_stock} units available for {misc_item.item_name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

    # --- Deduct stock and record transactions ---
    # items_summary collects one line of plain text per item, reused below to
    # build the body of the notification emails.
    items_summary = []
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
            # Big category is the top-level inventory type (Gifts/Apparel/Office);
            # small category is the specific category within that inventory (e.g. Pins).
            line = f"• x{item.quantity_requested} - {gift.product_name} > Gifts / {gift.category.name}"
            if item.notes:
                line += f"\n  Note: {item.notes}"
            items_summary.append(line)
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
            item_name = (
                f"{variant.product.product_name} — "
                f"{variant.size.size_value} {variant.color.color_name}"
            )
            line = f"• x{item.quantity_requested} - {item_name} > Apparel / {variant.product.category.name}"
            if item.notes:
                line += f"\n  Note: {item.notes}"
            items_summary.append(line)
        elif item.item_type == 'office':
            office_item = OfficeItem.objects.get(pk=item.item_id)
            stock_before = office_item.qty_stock
            office_item.qty_stock -= item.quantity_requested
            office_item.save()
            OfficeTransaction.objects.create(
                item=office_item,
                transaction_type='take',
                quantity=item.quantity_requested,
                created_by=request.user,
                stock_before=stock_before,
                stock_after=office_item.qty_stock,
                notes=f'Request #{item_request.id}',
            )
            line = f"• x{item.quantity_requested} - {office_item.item_name} > Office / {office_item.category.name}"
            if item.notes:
                line += f"\n  Note: {item.notes}"
            items_summary.append(line)
        elif item.item_type == 'miscellaneous':
            misc_item = MiscellaneousItem.objects.get(pk=item.item_id)
            stock_before = misc_item.qty_stock
            misc_item.qty_stock -= item.quantity_requested
            misc_item.save()
            MiscellaneousTransaction.objects.create(
                item=misc_item,
                transaction_type='take',
                quantity=item.quantity_requested,
                created_by=request.user,
                stock_before=stock_before,
                stock_after=misc_item.qty_stock,
                notes=f'Request #{item_request.id}',
            )
            line = f"• x{item.quantity_requested} - {misc_item.item_name} > Miscellaneous / {misc_item.category.name}"
            if item.notes:
                line += f"\n  Note: {item.notes}"
            items_summary.append(line)

    item_request.status = 'pending'
    item_request.save()

    # --- Email notifications ---
    # Two emails are sent: one to the inventory team so they know a new
    # request needs preparing, and one to the requester confirming submission.
    # Email is a nice-to-have here, not a core requirement of submitting a
    # request, so any failure (bad SMTP config, network issue, etc.) is caught
    # and logged rather than allowed to break the response to the user.
    try:
        requester_name = item_request.requested_by.get_full_name() or item_request.requested_by.username
        items_text = "\n".join(items_summary)
        # Notes are optional, so show 'None' instead of leaving a blank line
        notes_text = item_request.notes if item_request.notes else 'None'

        # Email to the inventory team about the new request
        send_mail(
            subject=f"New request from {requester_name}",
            message=(
                f"A new item request has been submitted.\n\n"
                f"Requester: {requester_name}\n"
                f"Department: {item_request.department.name}\n"
                f"Reason: {item_request.reason.reason_name}\n"
                f"Date needed: {item_request.date_needed}\n"
                f"Notes: {notes_text}\n\n"
                f"Items requested:\n{items_text}"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['inventory@worldaquatics.com'],
        )

        # Confirmation email back to the requester
        send_mail(
            subject="Your item request has been submitted",
            message=(
                f"Hi {requester_name},\n\n"
                f"Your request has been submitted successfully and is now pending preparation.\n\n"
                f"Department: {item_request.department.name}\n"
                f"Reason: {item_request.reason.reason_name}\n"
                f"Date needed: {item_request.date_needed}\n"
                f"Notes: {notes_text}\n\n"
                f"Items requested:\n{items_text}"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[item_request.requested_by.email],
        )
    except Exception as e:
        # Never let an email failure block a successful request submission
        logger.error(f"Failed to send request notification emails for request #{item_request.id}: {e}")

    return Response(
        {"message": "Request submitted successfully.", "status": "pending"},
        status=status.HTTP_200_OK
    )


# Cancels a Pending request and restores stock for all line items.
# PATCH /api/requests/{id}/cancel/
#
# Both the original requester and any admin can cancel.
# Only Pending requests can be cancelled. Draft requests haven't deducted
# stock yet and should be deleted instead.
# Stock is restored item by item. If a product or variant was deleted after
# the request was submitted, that item is skipped silently rather than
# blocking the cancellation of the whole request.
# A 'return' transaction is written for each item successfully restored,
# with notes referencing the request ID.
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cancel_request(request, pk):
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
        elif item.item_type == 'office':
            try:
                office_item = OfficeItem.objects.get(pk=item.item_id)
                stock_before = office_item.qty_stock
                office_item.qty_stock += item.quantity_requested
                office_item.save()
                OfficeTransaction.objects.create(
                    item=office_item,
                    transaction_type='return',
                    quantity=item.quantity_requested,
                    created_by=request.user,
                    stock_before=stock_before,
                    stock_after=office_item.qty_stock,
                    notes=f'Request #{item_request.id}',
                )
            except OfficeItem.DoesNotExist:
                pass  # Item deleted after submission — skip stock restore
        elif item.item_type == 'miscellaneous':
            try:
                misc_item = MiscellaneousItem.objects.get(pk=item.item_id)
                stock_before = misc_item.qty_stock
                misc_item.qty_stock += item.quantity_requested
                misc_item.save()
                MiscellaneousTransaction.objects.create(
                    item=misc_item,
                    transaction_type='return',
                    quantity=item.quantity_requested,
                    created_by=request.user,
                    stock_before=stock_before,
                    stock_after=misc_item.qty_stock,
                    notes=f'Request #{item_request.id}',
                )
            except MiscellaneousItem.DoesNotExist:
                pass  # Item deleted after submission — skip stock restore

    item_request.status = 'cancelled'
    item_request.updated_by = request.user
    item_request.save()

    return Response(
        {"message": "Request cancelled and stock restored.", "status": "cancelled"},
        status=status.HTTP_200_OK
    )


# Allows admin to move a request to any status in the workflow.
# PATCH /api/requests/{id}/status/
# This is a direct status override, separate from the submit and cancel flows
# which also handle stock. This view only changes the status field.
# Requires IsAdminUser permission.
@api_view(['PATCH'])
@permission_classes([HasRequestsAccess])
def update_request_status(request, pk):
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

# Adds a new line item to an existing request.
# POST /api/requests/{id}/items/add/
# Only the request owner or an admin can add items.
# No status restriction is enforced here, allowing admins to add items
# to requests that are already in progress.
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_item_to_request(request, pk):
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


# Updates or removes a single line item from a request.
# PATCH  /api/requests/{id}/items/{item_id}/  - updates fields on the line item.
# DELETE /api/requests/{id}/items/{item_id}/  - removes the line item entirely.
#
# Admins can modify items regardless of request status.
# Regular users can only modify items on their own requests while still in Draft.
# Note: this endpoint does NOT adjust stock. Stock is only touched during
# submit, cancel, and confirm operations.
@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_request_item(request, pk, item_pk):
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


# Admin sets or adjusts quantity_confirmed on a single line item.
# PATCH /api/requests/{id}/items/{item_id}/confirm/
# Requires IsAdminUser permission.
#
# Stock is reconciled against the previously deducted quantity:
#   previously_deducted = quantity_confirmed (if already set) or quantity_requested
#   diff = new_qty - previously_deducted
#
# If diff > 0: more stock is needed, deducted immediately (blocked if insufficient).
# If diff < 0: excess stock is returned and a 'return' transaction is written.
# If diff = 0: quantity_confirmed is updated but no stock movement occurs.
#
# This design allows admins to re-confirm a quantity multiple times
# and always get the correct net stock movement.
@api_view(['PATCH'])
@permission_classes([HasRequestsAccess])
def confirm_request_item(request, pk, item_pk):
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

        elif item.item_type == 'office':
            try:
                office_item = OfficeItem.objects.get(pk=item.item_id)
            except OfficeItem.DoesNotExist:
                return Response(
                    {"error": f"Office item #{item.item_id} no longer exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if diff > 0 and office_item.qty_stock < diff:
                return Response(
                    {"error": f"Only {office_item.qty_stock} units available for {office_item.item_name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            stock_before = office_item.qty_stock
            office_item.qty_stock -= diff
            office_item.save()
            OfficeTransaction.objects.create(
                item=office_item,
                transaction_type='return' if diff < 0 else 'take',
                quantity=abs(diff),
                created_by=request.user,
                stock_before=stock_before,
                stock_after=office_item.qty_stock,
            )

        elif item.item_type == 'miscellaneous':
            try:
                misc_item = MiscellaneousItem.objects.get(pk=item.item_id)
            except MiscellaneousItem.DoesNotExist:
                return Response(
                    {"error": f"Miscellaneous item #{item.item_id} no longer exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if diff > 0 and misc_item.qty_stock < diff:
                return Response(
                    {"error": f"Only {misc_item.qty_stock} units available for {misc_item.item_name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            stock_before = misc_item.qty_stock
            misc_item.qty_stock -= diff
            misc_item.save()
            MiscellaneousTransaction.objects.create(
                item=misc_item,
                transaction_type='return' if diff < 0 else 'take',
                quantity=abs(diff),
                created_by=request.user,
                stock_before=stock_before,
                stock_after=misc_item.qty_stock,
            )

    item.quantity_confirmed = new_qty
    item.save()

    return Response(
        {"message": "Quantity confirmed and stock adjusted.", "quantity_confirmed": new_qty},
        status=status.HTTP_200_OK
    )
