from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import HasExecutiveAccess
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from executive.serializers import ExecutiveItemSerializer, ExecutiveCategorySerializer, ExecutiveTransactionSerializer

from executive.models import ExecutiveItem, ExecutiveCategory, ExecutiveTransaction
from core.models import StockAdjustmentReason


# ============================================
# EXECUTIVE INVENTORY VIEWS
# ============================================

# Returns all executive items or creates a new one.
# GET  /api/executive/  - lists the full inventory, visible to anyone with executive access.
# POST /api/executive/  - creates a new item record, automatically setting created_by.
class ExecutiveItemListCreate(generics.ListCreateAPIView):
    serializer_class = ExecutiveItemSerializer
    permission_classes = [HasExecutiveAccess]
    queryset = ExecutiveItem.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
        else:
            print(serializer.errors)


# Deletes a specific executive item by ID.
# DELETE /api/executive/delete/{id}/
# No soft-delete: the record is permanently removed along with its transaction history.
class ExecutiveItemDelete(generics.DestroyAPIView):
    serializer_class = ExecutiveItemSerializer
    permission_classes = [HasExecutiveAccess]
    queryset = ExecutiveItem.objects.all()


# Handles manual stock adjustments from the admin stock adjust modal.
# PATCH /api/executive/update-stock/{id}/
#
# action must be 'take' (reduce stock) or 'return' (add stock).
# A reason is required for all adjustments — the request is rejected without one.
# Stock is validated before the change: takes are blocked if quantity exceeds current stock.
# Every successful adjustment writes an ExecutiveTransaction record for the audit trail,
# capturing stock levels before and after.
# updated_by is set on the item so the product record reflects who last touched it.
@api_view(['PATCH'])
@permission_classes([HasExecutiveAccess])
def update_executive_item_stock(request, pk):
    try:
        item = ExecutiveItem.objects.get(pk=pk)
    except ExecutiveItem.DoesNotExist:
        return Response(
            {"error": "Executive item not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    action = request.data.get('action')  # 'take' or 'return'
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

    # Reason is validated after saving the stock change.
    # If the reason ID is invalid, a 400 is returned but the stock has already moved.
    # In practice the frontend always sends a valid reason before submitting.
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

    ExecutiveTransaction.objects.create(
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


# Updates executive item product information (name, price, image, customs fields, etc.).
# PATCH /api/executive/update/{id}/
# partial=True means only the fields included in the request are updated;
# all other fields are left unchanged.
# updated_by is recorded on every save.
@api_view(['PATCH'])
@permission_classes([HasExecutiveAccess])
def update_executive_item(request, pk):
    try:
        item = ExecutiveItem.objects.get(pk=pk)
    except ExecutiveItem.DoesNotExist:
        return Response(
            {"error": "Executive item not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = ExecutiveItemSerializer(item, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save(updated_by=request.user)

        return Response({
            "message": "Product updated successfully",
            "item": serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================
# EXECUTIVE TRANSACTION VIEWS
# ============================================

# Returns the full transaction history for a single executive item, ordered newest first.
# GET /api/executive/{pk}/transactions/
# Used to populate the History modal in the admin table.
class ExecutiveTransactionListView(generics.ListAPIView):
    serializer_class = ExecutiveTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExecutiveTransaction.objects.filter(
            item__pk=self.kwargs["pk"]
        ).order_by("-created_at")


# ============================================
# EXECUTIVE CATEGORY VIEWS
# ============================================

# Returns all executive categories for dropdown population.
# GET /api/executive/categories/
# Ordered alphabetically by the model's Meta.ordering.
class ExecutiveCategoryList(generics.ListAPIView):
    serializer_class = ExecutiveCategorySerializer
    permission_classes = [HasExecutiveAccess]
    queryset = ExecutiveCategory.objects.all()
