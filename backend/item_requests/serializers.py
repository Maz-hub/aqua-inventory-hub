from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ItemRequest, ItemRequestItem
from core.serializers import TakeReasonSerializer
from core.models import Department


# Returns id and name for the department dropdown on the request form.
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']


# ItemRequestItemSerializer handles a single line item within a request.
#
# estimated_cost uses ReadOnlyField to call the model property directly.
# It returns unit_price * (quantity_confirmed or quantity_requested).
#
# item_name is a SerializerMethodField that resolves the human-readable product name
# from the referenced model (gift or apparel variant) using item_type + item_id.
# Because item_id has no database-level FK, the lookup can fail if the referenced
# record was deleted. get_item_name catches any exception and falls back to a
# generic "Type #ID" label so the request still renders correctly.
# For apparel, the name includes the variant's size and colour.
class ItemRequestItemSerializer(serializers.ModelSerializer):
    estimated_cost = serializers.ReadOnlyField()
    item_name = serializers.SerializerMethodField()

    def get_item_name(self, obj):
        # Resolves the product name from the correct inventory model.
        # Falls back to a generic label if the item no longer exists.
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


# ItemRequestSerializer handles the full request record including all line items.
#
# Dual-field pattern for department and reason:
#   department / reason          - nested objects returned in responses
#   department_id / reason_id    - write-only IDs accepted in POST/PATCH
#
# requested_by_username is a read-only CharField derived from the FK so responses
# include a readable name without an extra lookup.
#
# items is a nested list of all line items, read-only. Line items are created and
# managed through their own dedicated endpoints, not through this serializer.
#
# total_cost calls the model property and is read-only.
#
# status, requested_by, created_at, and updated_at are all read_only.
# status is controlled exclusively by the submit, cancel, and status-change endpoints.
# requested_by is set automatically in the view's perform_create.
class ItemRequestSerializer(serializers.ModelSerializer):
    # Nested items — returned in responses, not writable through this serializer
    items = ItemRequestItemSerializer(many=True, read_only=True)

    # Calls the model property
    total_cost = serializers.ReadOnlyField()

    # Read: full nested department object; Write: integer ID
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True
    )

    # Read: full nested reason object; Write: integer ID
    reason = TakeReasonSerializer(read_only=True)
    reason_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('core.models', fromlist=['TakeReason']).TakeReason.objects.all(),
        source='reason',
        write_only=True
    )

    # Returns the requester's username in responses instead of their user ID
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
