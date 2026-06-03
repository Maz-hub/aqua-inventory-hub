from rest_framework import serializers

from apparel.models import (
    ApparelSize, ApparelColor, ApparelCategory,
    ApparelProduct, ApparelVariant, ApparelTransaction
)
from core.serializers import StockAdjustmentReasonSerializer


# ============================================
# REFERENCE DATA SERIALIZERS
# ============================================

# These three serializers are simple read-only representations of the reference tables.
# They are nested inside other serializers (e.g. ApparelVariantSerializer) so that
# API responses include full objects rather than bare IDs.

# Returns size_value, size_type, and display_order so the frontend can split sizes
# into clothing and footwear dropdowns and sort them correctly.
class ApparelSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApparelSize
        fields = ['id', 'size_value', 'size_type', 'display_order']


# Returns color_name and hex_code so the frontend can render colour swatches.
class ApparelColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApparelColor
        fields = ['id', 'color_name', 'hex_code']


# Returns id and name for the category filter dropdown.
class ApparelCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApparelCategory
        fields = ['id', 'name']


# ============================================
# VARIANT SERIALIZER
# ============================================

# ApparelVariantSerializer handles both reading and writing variant records.
#
# Dual-field pattern used for size, color, and product:
#   size / color / (product via variants reverse)
#     read fields  - nested objects returned in responses
#   size_id / color_id / product_id
#     write fields - plain integer IDs accepted in POST requests
#
# product_name is a read-only CharField derived from the variant's product.
# It is included so the admin item-add dropdown can show the product name
# alongside size and colour without requiring a separate product fetch.
#
# created_at is read_only; created_by is set in the view and not exposed here.
class ApparelVariantSerializer(serializers.ModelSerializer):
    size = ApparelSizeSerializer(read_only=True)
    color = ApparelColorSerializer(read_only=True)
    size_id = serializers.PrimaryKeyRelatedField(
        queryset=ApparelSize.objects.all(),
        source='size',
        write_only=True
    )
    color_id = serializers.PrimaryKeyRelatedField(
        queryset=ApparelColor.objects.all(),
        source='color',
        write_only=True
    )
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=ApparelProduct.objects.all(),
        source='product',
        write_only=True
    )
    product_name = serializers.CharField(source='product.product_name', read_only=True)

    class Meta:
        model = ApparelVariant
        fields = [
            'id', 'product_name', 'size', 'color', 'size_id', 'color_id', 'product_id', 'gender',
            'qty_stock', 'minimum_stock_level', 'weight', 'sku',
            'created_at'
        ]
        read_only_fields = ['created_at']


# ============================================
# PRODUCT SERIALIZER
# ============================================

# ApparelProductSerializer handles both reading and writing product records.
#
# Dual-field pattern for category and primary_color:
#   category / primary_color       - nested objects in responses
#   category_id / primary_color_id - write-only IDs for POST/PATCH
#
# primary_color_id is not required: a product can be saved without a primary colour,
# though the frontend always sets one when creating a product.
#
# variants is a nested list of all variants for this product, returned read-only.
# It is populated via the related_name='variants' on ApparelVariant.
#
# created_at and updated_at are both read_only.
class ApparelProductSerializer(serializers.ModelSerializer):
    category = ApparelCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ApparelCategory.objects.all(),
        source='category',
        write_only=True
    )

    primary_color = ApparelColorSerializer(read_only=True)
    primary_color_id = serializers.PrimaryKeyRelatedField(
        queryset=ApparelColor.objects.all(),
        source='primary_color',
        write_only=True,
        required=False
    )

    variants = ApparelVariantSerializer(many=True, read_only=True)

    class Meta:
        model = ApparelProduct
        fields = [
            'id', 'product_name', 'category', 'category_id', 'item_id', 'primary_color', 'primary_color_id',
            'material', 'description', 'hs_code',
            'merchant_product_id', 'manufacturer_product_id', 'standardised_product_id',
            'supplier_name', 'supplier_email', 'supplier_phone', 'supplier_address',
            'unit_price', 'country_of_origin', 'product_image', 'notes', 'variants',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


# ============================================
# TRANSACTION SERIALIZER
# ============================================

# ApparelTransactionSerializer is used by the apparel stock history endpoint.
# It is entirely read-only — transactions are never created or modified through
# this serializer.
#
# variant is a full nested ApparelVariantSerializer so the history table can show
# colour, size, and gender without extra lookups.
#
# reason uses StockAdjustmentReasonSerializer which exposes the reason's name field.
#
# created_by_username is a CharField derived from the FK so the history table shows
# a readable name rather than a user ID.
class ApparelTransactionSerializer(serializers.ModelSerializer):
    variant = ApparelVariantSerializer(read_only=True)
    reason = StockAdjustmentReasonSerializer(read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = ApparelTransaction
        fields = [
            'id', 'variant', 'transaction_type', 'quantity', 'reason',
            'notes', 'created_by', 'created_by_username', 'created_at',
            'stock_before', 'stock_after'
        ]
        read_only_fields = ['created_at', 'created_by', 'created_by_username']
