from rest_framework import serializers

from executive.models import ExecutiveItem, ExecutiveCategory, ExecutiveTransaction


# ExecutiveCategorySerializer is used wherever categories need to appear as nested objects
# in API responses (e.g. inside ExecutiveItemSerializer). Returns only id and name.
class ExecutiveCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutiveCategory
        fields = ["id", "name"]


# ExecutiveItemSerializer handles both reading and writing executive item records.
#
# The dual-field pattern is used for category:
#   category    (read, nested) - returned in responses as {"id": 1, "name": "Furniture"}
#   category_id (write, PK)    - accepted in POST/PATCH requests as a plain integer
# This avoids needing to POST the full nested object when creating or updating an item.
#
# Audit fields (created_at, created_by, updated_at, updated_by) are all read_only.
# created_by and updated_by are set in the view's perform_create/perform_update,
# not here.
class ExecutiveItemSerializer(serializers.ModelSerializer):
    category = ExecutiveCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ExecutiveCategory.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = ExecutiveItem
        fields = [
            "id",
            "product_image",
            "item_name",
            "category",              # read: full nested object
            "category_id",           # write: integer ID
            "qty_stock",
            "description",
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
            "notes",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
        ]

        extra_kwargs = {
            "created_at": {"read_only": True},
            "created_by": {"read_only": True},
            "updated_at": {"read_only": True},
            "updated_by": {"read_only": True},
        }


# ExecutiveTransactionSerializer is used by the executive item stock history endpoint.
# It is entirely read-only — transactions are never created or modified through this serializer.
#
# created_by uses SlugRelatedField to return the username string directly instead of
# the user's integer ID, so the history table can display a name without a second lookup.
#
# reason uses SlugRelatedField to return the StockAdjustmentReason's name string
# rather than its ID.
class ExecutiveTransactionSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(slug_field="username", read_only=True)
    reason = serializers.SlugRelatedField(slug_field="name", read_only=True)

    class Meta:
        model = ExecutiveTransaction
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
