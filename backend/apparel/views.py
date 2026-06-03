from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import HasApparelAccess
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from apparel.serializers import (
    ApparelSizeSerializer, ApparelColorSerializer, ApparelCategorySerializer,
    ApparelProductSerializer, ApparelVariantSerializer, ApparelTransactionSerializer
)

from apparel.models import (
    ApparelSize, ApparelColor, ApparelCategory,
    ApparelProduct, ApparelVariant, ApparelTransaction
)
from core.models import StockAdjustmentReason


# ============================================
# REFERENCE DATA VIEWS
# ============================================

# The three views below return the reference tables used to populate
# dropdowns in the Add/Edit product and variant forms.

# Returns all sizes, ordered by size_type then display_order.
# GET /api/apparel/sizes/
class ApparelSizeList(generics.ListAPIView):
    serializer_class = ApparelSizeSerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelSize.objects.all()


# Returns all colours, ordered alphabetically.
# GET /api/apparel/colors/
class ApparelColorList(generics.ListAPIView):
    serializer_class = ApparelColorSerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelColor.objects.all()


# Returns all apparel categories, ordered alphabetically.
# GET /api/apparel/categories/
class ApparelCategoryList(generics.ListAPIView):
    serializer_class = ApparelCategorySerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelCategory.objects.all()


# ============================================
# APPAREL PRODUCT VIEWS
# ============================================

# Lists all products or creates a new one.
# GET  /api/apparel/products/  - returns every product with its nested variants.
# POST /api/apparel/products/  - creates a new product, setting created_by automatically.
# Each product record is the base item (name, price, image, customs data).
# Stock is tracked per variant, not at the product level.
class ApparelProductListCreate(generics.ListCreateAPIView):
    serializer_class = ApparelProductSerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelProduct.objects.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
        else:
            print(serializer.errors)


# Retrieves, updates, or deletes a single product.
# GET    /api/apparel/products/{id}/  - returns product details with all variants.
# PATCH  /api/apparel/products/{id}/  - partial update of product fields.
# DELETE /api/apparel/products/{id}/  - permanently deletes the product and all its variants (CASCADE).
# updated_by is recorded on every PATCH.
class ApparelProductDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ApparelProductSerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelProduct.objects.all()

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


# ============================================
# APPAREL VARIANT VIEWS
# ============================================

# Lists all variants or creates a new one.
# GET  /api/apparel/variants/            - returns all variants across all products.
# GET  /api/apparel/variants/?product_id=5  - returns only variants for a specific product.
# POST /api/apparel/variants/            - creates a new size/colour/gender variant for a product.
# The product_id filter is used by the admin item-add dropdown to list
# available variants when adding apparel to a request.
class ApparelVariantListCreate(generics.ListCreateAPIView):
    serializer_class = ApparelVariantSerializer
    permission_classes = [HasApparelAccess]

    def get_queryset(self):
        queryset = ApparelVariant.objects.all()
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
        else:
            print(serializer.errors)


# Retrieves, updates, or deletes a single variant.
# GET    /api/apparel/variants/{id}/  - returns variant details.
# PATCH  /api/apparel/variants/{id}/  - partial update (e.g. correcting stock manually).
# DELETE /api/apparel/variants/{id}/  - removes the variant. Also deletes its transaction history (CASCADE).
# updated_by is recorded on every PATCH.
class ApparelVariantDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ApparelVariantSerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelVariant.objects.all()

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


# Handles manual stock adjustments from the admin stock adjust modal.
# PATCH /api/apparel/variants/update-stock/{id}/
#
# action must be 'take' (reduce stock) or 'return' (add stock).
# Takes are blocked if the requested quantity exceeds current stock.
# Every successful adjustment writes an ApparelTransaction record for the audit trail.
# reason is optional here: the frontend always sends one for manual adjustments,
# but automated movements (request submissions) do not provide a reason_id.
# updated_by is set on the variant so the record reflects who last touched it.
@api_view(['PATCH'])
@permission_classes([HasApparelAccess])
def update_apparel_stock(request, pk):
    try:
        variant = ApparelVariant.objects.get(pk=pk)
    except ApparelVariant.DoesNotExist:
        return Response(
            {"error": "Variant not found"},
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

    stock_before = variant.qty_stock

    if action == 'take':
        if variant.qty_stock < quantity:
            return Response(
                {"error": f"Insufficient stock. Only {variant.qty_stock} available."},
                status=status.HTTP_400_BAD_REQUEST
            )
        variant.qty_stock -= quantity

    elif action == 'return':
        variant.qty_stock += quantity

    else:
        return Response(
            {"error": "Invalid action. Use 'take' or 'return'"},
            status=status.HTTP_400_BAD_REQUEST
        )

    stock_after = variant.qty_stock

    variant.updated_by = request.user
    variant.save()

    take_reason = None
    if reason_id:
        try:
            take_reason = StockAdjustmentReason.objects.get(id=reason_id)
        except StockAdjustmentReason.DoesNotExist:
            pass

    ApparelTransaction.objects.create(
        variant=variant,
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
        "new_stock": variant.qty_stock
    }, status=status.HTTP_200_OK)


# ============================================
# APPAREL TRANSACTION VIEWS
# ============================================

# Returns the transaction history for apparel stock movements.
# GET /api/apparel/transactions/
#
# Supports two optional query filters:
#   ?variant_id=5    - history for a single size/colour variant
#   ?product_id=3    - history for all variants of a product (used by the History modal)
# Results are ordered newest first (from model's Meta.ordering).
class ApparelTransactionList(generics.ListAPIView):
    serializer_class = ApparelTransactionSerializer
    permission_classes = [HasApparelAccess]

    def get_queryset(self):
        queryset = ApparelTransaction.objects.all()

        variant_id = self.request.query_params.get('variant_id')
        if variant_id:
            queryset = queryset.filter(variant_id=variant_id)

        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(variant__product_id=product_id)

        return queryset
