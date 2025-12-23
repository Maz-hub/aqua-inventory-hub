from django.contrib.auth.models import User
# Django's built-in User table - handles authentication and user data storage

from rest_framework import serializers
# Provides tools to convert complex data types to/from JSON for API communication

from .models import GiftCategory, Gift


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
    
