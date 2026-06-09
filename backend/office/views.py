from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import HasOfficeAccess
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from office.serializers import OfficeItemSerializer, OfficeCategorySerializer, OfficeTransactionSerializer
from office.models import OfficeItem, OfficeCategory, OfficeTransaction
from core.models import StockAdjustmentReason


# ============================================
# OFFICE ITEM VIEWS
# ============================================

# Returns all office items or creates a new one.
# GET  /api/office/  - lists the full inventory.
# POST /api/office/  - creates a new item record, automatically setting created_by.
class OfficeItemListCreate(generics.ListCreateAPIView):
    serializer_class = OfficeItemSerializer
    permission_classes = [HasOfficeAccess]
    queryset = OfficeItem.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
        else:
            print(serializer.errors)


# Deletes a specific office item by ID.
# DELETE /api/office/delete/{id}/
class OfficeItemDelete(generics.DestroyAPIView):
    serializer_class = OfficeItemSerializer
    permission_classes = [HasOfficeAccess]
    queryset = OfficeItem.objects.all()


# Handles manual stock adjustments from the admin stock adjust modal.
# PATCH /api/office/update-stock/{id}/
#
# action must be 'take' (reduce stock) or 'return' (add stock).
# A reason is required for all adjustments.
# Every successful adjustment writes an OfficeTransaction for the audit trail.
@api_view(['PATCH'])
@permission_classes([HasOfficeAccess])
def update_office_item_stock(request, pk):
    try:
        item = OfficeItem.objects.get(pk=pk)
    except OfficeItem.DoesNotExist:
        return Response(
            {"error": "Office item not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    action = request.data.get('action')
    quantity = request.data.get('quantity')
    reason_id = request.data.get('reason')
    notes = request.data.get('notes', '')

    if not action or not quantity:
        return Response(
            {"error": "Action and quantity required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        quantity = int(quantity)
    except ValueError:
        return Response(
            {"error": "Invalid quantity"},
            status=status.HTTP_400_BAD_REQUEST
        )

    stock_before = item.qty_stock

    if action == 'take':
        if item.qty_stock < quantity:
            return Response(
                {"error": f"Insufficient stock. Only {item.qty_stock} available."},
                status=status.HTTP_400_BAD_REQUEST
            )
        item.qty_stock -= quantity

    elif action == 'return':
        item.qty_stock += quantity

    else:
        return Response(
            {"error": "Invalid action. Use 'take' or 'return'"},
            status=status.HTTP_400_BAD_REQUEST
        )

    stock_after = item.qty_stock
    item.updated_by = request.user
    item.save()

    if not reason_id:
        return Response(
            {"error": "A reason is required for stock adjustments."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        reason = StockAdjustmentReason.objects.get(id=reason_id)
    except StockAdjustmentReason.DoesNotExist:
        return Response(
            {"error": "Invalid reason ID."},
            status=status.HTTP_400_BAD_REQUEST
        )

    OfficeTransaction.objects.create(
        item=item,
        transaction_type=action,
        quantity=quantity,
        reason=reason,
        notes=notes,
        created_by=request.user,
        stock_before=stock_before,
        stock_after=stock_after
    )

    return Response({
        "message": "Stock updated successfully",
        "new_stock": item.qty_stock
    }, status=status.HTTP_200_OK)


# Updates office item product information.
# PATCH /api/office/update/{id}/
# partial=True means only the fields included in the request are updated.
@api_view(['PATCH'])
@permission_classes([HasOfficeAccess])
def update_office_item(request, pk):
    try:
        item = OfficeItem.objects.get(pk=pk)
    except OfficeItem.DoesNotExist:
        return Response(
            {"error": "Office item not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = OfficeItemSerializer(item, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save(updated_by=request.user)
        return Response({
            "message": "Item updated successfully",
            "item": serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# OFFICE TRANSACTION VIEWS
# ============================================

# Returns the full transaction history for a single office item, ordered newest first.
# GET /api/office/{pk}/transactions/
class OfficeTransactionListView(generics.ListAPIView):
    serializer_class = OfficeTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OfficeTransaction.objects.filter(
            item__pk=self.kwargs["pk"]
        ).order_by("-created_at")


# ============================================
# OFFICE CATEGORY VIEWS
# ============================================

# Returns all office categories for dropdown population.
# GET /api/office/categories/
class OfficeCategoryList(generics.ListAPIView):
    serializer_class = OfficeCategorySerializer
    permission_classes = [HasOfficeAccess]
    queryset = OfficeCategory.objects.all()
