from rest_framework import serializers

from apparel.models import (
    ApparelSize, ApparelColor, ApparelCategory,
    ApparelProduct, ApparelVariant, ApparelTransaction
)
from core.serializers import TakeReasonSerializer


# ============================================
# APPAREL SERIALIZERS
# ============================================

class ApparelSizeSerializer(serializers.ModelSerializer):
    """
    Serializer for apparel sizes.
    Returns size information for dropdown population.
    """
    class Meta:
        model = ApparelSize
        fields = ['id', 'size_value', 'size_type', 'display_order']


class ApparelColorSerializer(serializers.ModelSerializer):
    """
    Serializer for apparel colors.
    Returns color information with optional hex codes for visual display.
    """
    class Meta:
        model = ApparelColor
        fields = ['id', 'color_name', 'hex_code']


class ApparelCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for apparel categories.
    Returns category information for filtering and organization.
    """
    class Meta:
        model = ApparelCategory
        fields = ['id', 'name']


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

    class Meta:
        model = ApparelVariant
        fields = [
            'id', 'size', 'color', 'size_id', 'color_id', 'product_id', 'gender',
            'qty_stock', 'minimum_stock_level', 'weight', 'sku',
            'created_at'
        ]
        read_only_fields = ['created_at']


class ApparelProductSerializer(serializers.ModelSerializer):
    """
    Serializer for apparel products.
    Includes nested category and all variants for complete product view.
    """
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
            'material', 'description', 'hs_code', 'unit_price',
            'country_of_origin', 'product_image', 'notes', 'variants',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ApparelTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for apparel transaction history.
    Includes nested variant and reason details for audit trail display.
    """
    variant = ApparelVariantSerializer(read_only=True)
    reason = TakeReasonSerializer(read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = ApparelTransaction
        fields = [
            'id', 'variant', 'transaction_type', 'quantity', 'reason',
            'notes', 'created_by', 'created_by_username', 'created_at',
            'stock_before', 'stock_after'
        ]
        read_only_fields = ['created_at', 'created_by', 'created_by_username']
