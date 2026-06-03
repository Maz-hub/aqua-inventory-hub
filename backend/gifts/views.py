from django.contrib.auth.models import User

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import HasGiftsAccess
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from gifts.serializers import GiftSerializer, GiftCategorySerializer, InventoryTransactionSerializer

from gifts.models import Gift, GiftCategory, InventoryTransaction
from core.models import StockAdjustmentReason


# ============================================
# GIFT INVENTORY VIEWS
# ============================================

# Returns all gifts or creates a new one.
# GET  /api/gifts/  - lists the full inventory, visible to anyone with gifts access.
# POST /api/gifts/  - creates a new gift record, automatically setting created_by.
class GiftListCreate(generics.ListCreateAPIView):
    serializer_class = GiftSerializer
    permission_classes = [HasGiftsAccess]
    queryset = Gift.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
        else:
            print(serializer.errors)


# Deletes a specific gift by ID.
# DELETE /api/gifts/delete/{id}/
# No soft-delete: the record is permanently removed along with its transaction history.
class GiftDelete(generics.DestroyAPIView):
    serializer_class = GiftSerializer
    permission_classes = [HasGiftsAccess]
    queryset = Gift.objects.all()


# Handles manual stock adjustments from the admin stock adjust modal.
# PATCH /api/gifts/update-stock/{id}/
#
# action must be 'take' (reduce stock) or 'return' (add stock).
# A reason is required for all adjustments — the request is rejected without one.
# Stock is validated before the change: takes are blocked if quantity exceeds current stock.
# Every successful adjustment writes an InventoryTransaction record for the audit trail,
# capturing stock levels before and after.
# updated_by is set on the gift so the product record reflects who last touched it.
@api_view(['PATCH'])
@permission_classes([HasGiftsAccess])
def update_gift_stock(request, pk):
    try:
        gift = Gift.objects.get(pk=pk)
    except Gift.DoesNotExist:
        return Response(
            {"error": "Gift not found"},
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

    stock_before = gift.qty_stock

    if action == 'take':
        if gift.qty_stock < quantity:
            return Response(
                {"error": f"Insufficient stock. Only {gift.qty_stock} available."},
                status=status.HTTP_400_BAD_REQUEST
            )
        gift.qty_stock -= quantity

    elif action == 'return':
        gift.qty_stock += quantity

    else:
        return Response(
            {"error": "Invalid action. Use 'take' or 'return'"},
            status=status.HTTP_400_BAD_REQUEST
        )

    stock_after = gift.qty_stock

    gift.updated_by = request.user
    gift.save()

    # Reason is validated after saving the stock change.
    # If the reason ID is invalid, a 400 is returned but the stock has already moved.
    # In practice the frontend always sends a valid reason before submitting.
    if not reason_id:
        return Response(
            {"error": "A reason is required for stock adjustments."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        take_reason = StockAdjustmentReason.objects.get(id=reason_id)
    except StockAdjustmentReason.DoesNotExist:
        return Response(
            {"error": "Invalid reason ID."},
            status=status.HTTP_400_BAD_REQUEST
        )

    InventoryTransaction.objects.create(
        gift=gift,
        transaction_type=action,
        quantity=quantity,
        reason=take_reason,
        notes=notes,
        created_by=request.user,
        stock_before=stock_before,
        stock_after=stock_after
    )

    return Response({
        "message": "Stock updated successfully",
        "new_stock": gift.qty_stock
    }, status=status.HTTP_200_OK)


# Updates gift product information (name, price, image, customs fields, etc.).
# PATCH /api/gifts/update/{id}/
# partial=True means only the fields included in the request are updated;
# all other fields are left unchanged.
# updated_by is recorded on every save.
@api_view(['PATCH'])
@permission_classes([HasGiftsAccess])
def update_gift(request, pk):
    try:
        gift = Gift.objects.get(pk=pk)
    except Gift.DoesNotExist:
        return Response(
            {"error": "Gift not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = GiftSerializer(gift, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save(updated_by=request.user)

        return Response({
            "message": "Product updated successfully",
            "gift": serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================
# GIFT TRANSACTION VIEWS
# ============================================

# Returns the full transaction history for a single gift, ordered newest first.
# GET /api/gifts/{pk}/transactions/
# Used to populate the History modal in the admin table.
class GiftTransactionListView(generics.ListAPIView):
    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return InventoryTransaction.objects.filter(
            gift__pk=self.kwargs["pk"]
        ).order_by("-created_at")


# ============================================
# GIFT CATEGORY VIEWS
# ============================================

# Returns all gift categories for dropdown population.
# GET /api/gifts/categories/
# Ordered alphabetically by the model's Meta.ordering.
class GiftCategoryList(generics.ListAPIView):
    serializer_class = GiftCategorySerializer
    permission_classes = [HasGiftsAccess]
    queryset = GiftCategory.objects.all()
