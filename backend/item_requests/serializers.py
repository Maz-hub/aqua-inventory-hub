from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ItemRequest, ItemRequestItem
from core.serializers import TakeReasonSerializer
from core.models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Department model.
    Returns department data for dropdown population in frontend.
    """
    class Meta:
        model = Department
        fields = ['id', 'name']


class ItemRequestItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual line items within a request.
    Includes estimated cost and item name lookup.
    """
    estimated_cost = serializers.ReadOnlyField()
    item_name = serializers.SerializerMethodField()
    # Looks up the actual product name from the relevant model

    def get_item_name(self, obj):
        """
        Fetches the product name from the correct model
        based on item_type and item_id.
        """
        try:
            if obj.item_type == 'gift':
                from gifts.models import Gift
                return Gift.objects.get(pk=obj.item_id).product_name
            elif obj.item_type == 'apparel':
                from apparel.models import ApparelVariant
                variant = ApparelVariant.objects.get(pk=obj.item_id)
                return f"{variant.product.product_name} — {variant.size.size_value} {variant.color.color_name}"
            return f"{obj.get_item_type_display()} #{obj.item_id}"
        except Exception:
            return f"{obj.get_item_type_display()} #{obj.item_id}"

    class Meta:
        model = ItemRequestItem
        fields = [
            'id',
            'item_type',
            'item_id',
            'item_name',
            'quantity_requested',
            'quantity_confirmed',
            'unit_price',
            'notes',
            'estimated_cost',
        ]


class ItemRequestSerializer(serializers.ModelSerializer):
    """
    Full serializer for ItemRequest.
    Includes nested line items and calculated total cost.
    Read operations return full nested objects.
    Write operations accept IDs for foreign keys.
    """
    # Nested items — read only, shown in responses
    items = ItemRequestItemSerializer(many=True, read_only=True)

    # Calculated total cost — read only
    total_cost = serializers.ReadOnlyField()

    # Read: return full department object
    department = DepartmentSerializer(read_only=True)
    # Write: accept department ID
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True
    )

    # Read: return full reason object
    reason = TakeReasonSerializer(read_only=True)
    # Write: accept reason ID
    reason_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('core.models', fromlist=['TakeReason']).TakeReason.objects.all(),
        source='reason',
        write_only=True
    )

    # Show requester username in responses
    requested_by_username = serializers.CharField(
        source='requested_by.username',
        read_only=True
    )

    class Meta:
        model = ItemRequest
        fields = [
            'id',
            'requested_by',
            'requested_by_username',
            'department',
            'department_id',
            'reason',
            'reason_id',
            'status',
            'date_needed',
            'notes',
            'admin_notes',
            'items',
            'total_cost',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'requested_by',
            'status',
            'created_at',
            'updated_at',
        ]
