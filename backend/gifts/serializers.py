from rest_framework import serializers

from gifts.models import Gift, GiftCategory, InventoryTransaction


# GiftCategorySerializer is used wherever categories need to appear as nested objects
# in API responses (e.g. inside GiftSerializer). Returns only id and name.
class GiftCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCategory
        fields = ["id", "name"]


# GiftSerializer handles both reading and writing gift records.
#
# The dual-field pattern is used for category:
#   category    (read, nested) - returned in responses as {"id": 1, "name": "Pins"}
#   category_id (write, PK)    - accepted in POST/PATCH requests as a plain integer
# This avoids needing to POST the full nested object when creating or updating a gift.
#
# Audit fields (created_at, created_by, updated_at, updated_by) are all read_only.
# created_by and updated_by are set in the view's perform_create/perform_update,
# not here.
class GiftSerializer(serializers.ModelSerializer):
    category = GiftCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=GiftCategory.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Gift
        fields = [
            "id",
            "product_image",
            "product_name",
            "category",              # read: full nested object
            "category_id",           # write: integer ID
            "qty_stock",
            "description",
            "material",
            "unit_price",
            "hs_code",
            "country_of_origin",
            "supplier_name",
            "supplier_email",
            "supplier_phone",
            "supplier_address",
            "merchant_product_id",
            "manufacturer_product_id",
            "standardised_product_id",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
            "minimum_stock_level",
            "notes",
        ]

        extra_kwargs = {
            "created_at": {"read_only": True},
            "created_by": {"read_only": True},
            "updated_at": {"read_only": True},
            "updated_by": {"read_only": True},
        }


# InventoryTransactionSerializer is used by the gift stock history endpoint.
# It is entirely read-only — transactions are never created or modified through this serializer.
#
# created_by uses SlugRelatedField to return the username string directly instead of
# the user's integer ID, so the history table can display a name without a second lookup.
#
# reason uses SlugRelatedField to return the StockAdjustmentReason's name string
# rather than its ID.
class InventoryTransactionSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(slug_field="username", read_only=True)
    reason = serializers.SlugRelatedField(slug_field="name", read_only=True)

    class Meta:
        model = InventoryTransaction
        fields = [
            "id",
            "transaction_type",
            "quantity",
            "reason",
            "notes",
            "created_at",
            "stock_before",
            "stock_after",
            "created_by",
        ]
        read_only_fields = fields
