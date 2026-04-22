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
from core.models import TakeReason


# ============================================
# APPAREL INVENTORY VIEWS
# ============================================

class ApparelSizeList(generics.ListAPIView):
    """
    API endpoint to fetch all apparel sizes
    GET /api/apparel/sizes/
    Used to populate size dropdowns when creating variants
    """
    serializer_class = ApparelSizeSerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelSize.objects.all()


class ApparelColorList(generics.ListAPIView):
    """
    API endpoint to fetch all apparel colors
    GET /api/apparel/colors/
    Used to populate color dropdowns when creating variants
    """
    serializer_class = ApparelColorSerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelColor.objects.all()


class ApparelCategoryList(generics.ListAPIView):
    """
    API endpoint to fetch all apparel categories
    GET /api/apparel/categories/
    Used to populate category dropdowns and filtering
    """
    serializer_class = ApparelCategorySerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelCategory.objects.all()


class ApparelProductListCreate(generics.ListCreateAPIView):
    """
    API endpoint that handles:
    - GET: List all apparel products with their variants
    - POST: Create a new apparel product
    """
    serializer_class = ApparelProductSerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelProduct.objects.all()

    def perform_create(self, serializer):
        """
        Automatically set created_by field when creating product
        """
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
        else:
            print(serializer.errors)


class ApparelProductDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for single product operations:
    - GET: Retrieve product details with variants
    - PATCH: Update product information
    - DELETE: Delete product (and all its variants via CASCADE)
    """
    serializer_class = ApparelProductSerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelProduct.objects.all()

    def perform_update(self, serializer):
        """
        Automatically set updated_by field when updating product
        """
        serializer.save(updated_by=self.request.user)


class ApparelVariantListCreate(generics.ListCreateAPIView):
    """
    API endpoint that handles:
    - GET: List all variants (with optional product filtering)
    - POST: Create a new size/color variant for a product
    """
    serializer_class = ApparelVariantSerializer
    permission_classes = [HasApparelAccess]

    def get_queryset(self):
        """
        Optionally filter variants by product_id query parameter
        Example: /api/apparel/variants/?product_id=5
        """
        queryset = ApparelVariant.objects.all()
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        """
        Automatically set created_by field when creating variant
        """
        if serializer.is_valid():
            serializer.save(created_by=self.request.user)
        else:
            print(serializer.errors)


class ApparelVariantDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for single variant operations:
    - GET: Retrieve variant details
    - PATCH: Update variant (e.g., adjust stock manually)
    - DELETE: Delete variant
    """
    serializer_class = ApparelVariantSerializer
    permission_classes = [HasApparelAccess]
    queryset = ApparelVariant.objects.all()

    def perform_update(self, serializer):
        """
        Automatically set updated_by field when updating variant
        """
        serializer.save(updated_by=self.request.user)


@api_view(['PATCH'])
@permission_classes([HasApparelAccess])
def update_apparel_stock(request, pk):
    """
    Updates apparel variant stock quantity for Take/Return actions
    PATCH /api/apparel/variants/update-stock/{id}/

    Creates ApparelTransaction record for audit trail
    """
    # Try to find the variant by ID
    try:
        variant = ApparelVariant.objects.get(pk=pk)
    except ApparelVariant.DoesNotExist:
        return Response(
            {"error": "Variant not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get action, quantity, reason, and notes from request
    action = request.data.get('action')  # 'take' or 'return'
    quantity = request.data.get('quantity')
    reason_id = request.data.get('reason')  # TakeReason ID
    notes = request.data.get('notes', '')

    # Validate required fields
    if not action or not quantity:
        return Response(
            {"error": "Action and quantity required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Convert quantity to integer and validate
    try:
        quantity = int(quantity)
    except ValueError:
        return Response(
            {"error": "Invalid quantity"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Record stock level before change
    stock_before = variant.qty_stock

    # Handle 'take' action - reduce stock
    if action == 'take':
        if variant.qty_stock < quantity:
            return Response(
                {"error": f"Insufficient stock. Only {variant.qty_stock} available."},
                status=status.HTTP_400_BAD_REQUEST
            )
        variant.qty_stock -= quantity

    # Handle 'return' action - increase stock
    elif action == 'return':
        variant.qty_stock += quantity

    # Invalid action provided
    else:
        return Response(
            {"error": "Invalid action. Use 'take' or 'return'"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Record stock level after change
    stock_after = variant.qty_stock

    # Save the updated variant
    variant.updated_by = request.user
    variant.save()

    # Create transaction record for audit trail
    # Get TakeReason object if reason_id provided
    take_reason = None
    if action == 'take' and reason_id:
        try:
            take_reason = TakeReason.objects.get(id=reason_id)
        except TakeReason.DoesNotExist:
            pass  # Will save transaction with None reason if invalid ID

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

    # Return success response with new stock level
    return Response({
        "message": "Stock updated successfully",
        "new_stock": variant.qty_stock
    }, status=status.HTTP_200_OK)


class ApparelTransactionList(generics.ListAPIView):
    """
    API endpoint to fetch apparel transaction history
    GET /api/apparel/transactions/

    Supports filtering by variant, product, or date range
    """
    serializer_class = ApparelTransactionSerializer
    permission_classes = [HasApparelAccess]

    def get_queryset(self):
        """
        Optionally filter transactions by query parameters
        Examples:
        - /api/apparel/transactions/?variant_id=5
        - /api/apparel/transactions/?product_id=3
        """
        queryset = ApparelTransaction.objects.all()

        variant_id = self.request.query_params.get('variant_id')
        if variant_id:
            queryset = queryset.filter(variant_id=variant_id)

        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(variant__product_id=product_id)

        return queryset
