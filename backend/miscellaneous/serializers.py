from rest_framework import serializers
from miscellaneous.models import MiscellaneousItem, MiscellaneousCategory, MiscellaneousTransaction
from core.models import Department


class MiscellaneousCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MiscellaneousCategory
        fields = ["id", "name"]


# DepartmentSerializer is used to return department as a nested object on read.
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name"]


# MiscellaneousItemSerializer handles both reading and writing miscellaneous item records.
#
# Dual-field pattern for category and department:
#   category    (read, nested) - returned as {"id": 1, "name": "Stationery"}
#   category_id (write, PK)    - accepted in POST/PATCH as a plain integer
#   department  (read, nested) - returned as {"id": 1, "name": "Marketing"} or null
#   department_id (write, PK)  - accepted in POST/PATCH as a plain integer or null
class MiscellaneousItemSerializer(serializers.ModelSerializer):
    category = MiscellaneousCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=MiscellaneousCategory.objects.all(),
        source='category',
        write_only=True
    )
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = MiscellaneousItem
        fields = [
            "id",
            "product_image",
            "item_name",
            "category",
            "category_id",
            "qty_stock",
            "department",
            "department_id",
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


# MiscellaneousTransactionSerializer is used by the miscellaneous item stock history endpoint.
# Entirely read-only — transactions are never created or modified through this serializer.
class MiscellaneousTransactionSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(slug_field="username", read_only=True)
    reason = serializers.SlugRelatedField(slug_field="name", read_only=True)

    class Meta:
        model = MiscellaneousTransaction
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
