from django.contrib.auth.models import User
# Django's built-in User table - handles authentication and user data storage

from rest_framework import serializers
# Provides tools to convert complex data types to/from JSON for API communication

from .models import (
    Gift, GiftCategory, TakeReason,
    ApparelSize, ApparelColor, ApparelCategory, 
    ApparelProduct, ApparelVariant, ApparelTransaction
)


class UserSerializer(serializers.ModelSerializer):
    # Converts User model data to JSON and validates incoming user registration data
    
    class Meta:
        # Configuration for the serializer
        model = User
        # Specifies which database model this serializer works with
        
        fields = ["id", "username", "password"]
        # Only these fields will be included in API requests/responses
        
        extra_kwargs = {"password": {"write_only": True}}
        # Password can be sent TO the API but will never be returned IN responses (security)

    def create(self, validated_data):
        # Custom method to handle user creation with proper password hashing
        user = User.objects.create_user(**validated_data)
        # create_user() automatically hashes the password before saving to database
        return user
    
class GiftCategorySerializer(serializers.ModelSerializer):
    # Converts GiftCategory model to/from JSON format for API responses
    
    class Meta:
        model = GiftCategory
        # Specifies which model this serializer works with
        
        fields = ["id", "name"]
        # Only include category ID and name in API responses


class GiftSerializer(serializers.ModelSerializer):
    # Converts Gift model to/from JSON format with nested category information
    
    category = GiftCategorySerializer(read_only=True)
    # For READ operations: shows full category details {"id": 1, "name": "Apparel"}
    # read_only=True means this field only appears in responses, not accepted in requests
    
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=GiftCategory.objects.all(),
        source='category',
        write_only=True
    )
    # For WRITE operations: accepts just the category ID when creating/updating gifts
    # queryset validates that the category ID exists in database
    # source='category' links this to the actual category field in the model
    # write_only=True means this field is only accepted in requests, not shown in responses
    
    class Meta:
        model = Gift
        # Specifies which model this serializer works with
        
        fields = [
            "id",                    # Unique identifier for each gift
            "product_image",         # Path to uploaded product image
            "product_name",          # Name of the product
            "category",              # Full category object (read-only, for display)
            "category_id",           # Category ID (write-only, for creating/updating)
            "qty_stock",             # Current stock quantity
            "description",           # Product description
            "material",              # Material composition
            "unit_price",            # Price per unit
            "hs_code",               # Harmonized System code for customs
            "country_of_origin",     # Manufacturing country
            "supplier_name",         # Supplier company name
            "supplier_email",        # Supplier contact email
            "supplier_address",      # Supplier physical address
            "created_at",            # Timestamp when record was created
            "created_by",            # User who created the record
            "updated_at",            # Timestamp of last modification
            "updated_by",            # User who last modified the record
            "minimum_stock_level",   # Alert threshold for low stock
            "notes",                 # Additional internal notes
        ]
        
        extra_kwargs = {
            "created_at": {"read_only": True},
            # Timestamp automatically set by Django, users cannot modify
            
            "created_by": {"read_only": True},
            # User automatically captured from request, users cannot set manually
            
            "updated_at": {"read_only": True},
            # Timestamp automatically updated by Django on every save
            
            "updated_by": {"read_only": True},
            # User automatically captured from request on updates
        }


class TakeReasonSerializer(serializers.ModelSerializer):
    """
    Serializer for TakeReason model.
    Returns reason data for dropdown population in frontend.
    """
    class Meta:
        model = TakeReason
        fields = ['id', 'reason_name', 'applies_to']
    
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
            'id', 'size', 'color', 'size_id', 'color_id', 'product_id',
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
    variants = ApparelVariantSerializer(many=True, read_only=True)
    
    class Meta:
        model = ApparelProduct
        fields = [
            'id', 'product_name', 'category', 'category_id', 'item_id',
            'gender', 'material', 'description', 'hs_code', 'unit_price',
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