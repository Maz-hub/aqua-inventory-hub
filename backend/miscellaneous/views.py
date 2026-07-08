from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import HasMiscellaneousAccess
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from miscellaneous.serializers import MiscellaneousItemSerializer, MiscellaneousCategorySerializer, MiscellaneousTransactionSerializer
from miscellaneous.models import MiscellaneousItem, MiscellaneousCategory, MiscellaneousTransaction
from core.models import StockAdjustmentReason


# ============================================
# MISCELLANEOUS ITEM VIEWS
# ============================================

# Returns all miscellaneous items or creates a new one.
# GET  /api/miscellaneous/  - lists the full inventory.
# POST /api/miscellaneous/  - creates a new item record, automatically setting created_by.
class MiscellaneousItemListCreate(generics.ListCreateAPIView):
    serializer_class = MiscellaneousItemSerializer
    permission_classes = [HasMiscellaneousAccess]
    queryset = MiscellaneousItem.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
        else:
            print(serializer.errors)


# Deletes a specific miscellaneous item by ID.
# DELETE /api/miscellaneous/delete/{id}/
class MiscellaneousItemDelete(generics.DestroyAPIView):
    serializer_class = MiscellaneousItemSerializer
    permission_classes = [HasMiscellaneousAccess]
    queryset = MiscellaneousItem.objects.all()


# Handles manual stock adjustments from the admin stock adjust modal.
# PATCH /api/miscellaneous/update-stock/{id}/
#
# action must be 'take' (reduce stock) or 'return' (add stock).
# A reason is required for all adjustments.
# Every successful adjustment writes a MiscellaneousTransaction for the audit trail.
@api_view(['PATCH'])
@permission_classes([HasMiscellaneousAccess])
def update_miscellaneous_item_stock(request, pk):
    try:
        item = MiscellaneousItem.objects.get(pk=pk)
    except MiscellaneousItem.DoesNotExist:
        return Response(
            {"error": "Miscellaneous item not found"},
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

    MiscellaneousTransaction.objects.create(
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


# Updates miscellaneous item product information.
# PATCH /api/miscellaneous/update/{id}/
# partial=True means only the fields included in the request are updated.
@api_view(['PATCH'])
@permission_classes([HasMiscellaneousAccess])
def update_miscellaneous_item(request, pk):
    try:
        item = MiscellaneousItem.objects.get(pk=pk)
    except MiscellaneousItem.DoesNotExist:
        return Response(
            {"error": "Miscellaneous item not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = MiscellaneousItemSerializer(item, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save(updated_by=request.user)
        return Response({
            "message": "Item updated successfully",
            "item": serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# MISCELLANEOUS TRANSACTION VIEWS
# ============================================

# Returns the full transaction history for a single miscellaneous item, ordered newest first.
# GET /api/miscellaneous/{pk}/transactions/
class MiscellaneousTransactionListView(generics.ListAPIView):
    serializer_class = MiscellaneousTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MiscellaneousTransaction.objects.filter(
            item__pk=self.kwargs["pk"]
        ).order_by("-created_at")


# ============================================
# MISCELLANEOUS CATEGORY VIEWS
# ============================================

# Returns all miscellaneous categories for dropdown population.
# GET /api/miscellaneous/categories/
class MiscellaneousCategoryList(generics.ListAPIView):
    serializer_class = MiscellaneousCategorySerializer
    permission_classes = [HasMiscellaneousAccess]
    queryset = MiscellaneousCategory.objects.all()
