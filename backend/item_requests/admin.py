from django.contrib import admin
from .models import ItemRequest, ItemRequestItem


class ItemRequestItemInline(admin.TabularInline):
    """
    Displays all line items directly inside the ItemRequest admin page.
    Admin can add, edit, or remove items without leaving the request.
    """
    model = ItemRequestItem
    extra = 0
    # extra=0 means no empty rows shown by default
    fields = [
        'item_type',
        'item_id',
        'quantity_requested',
        'quantity_confirmed',
        'unit_price',
        'notes'
    ]


@admin.register(ItemRequest)
class ItemRequestAdmin(admin.ModelAdmin):
    """
    Admin configuration for ItemRequest.
    Shows all requests with key info at a glance.
    Admin can manage full request lifecycle from here.
    """
    inlines = [ItemRequestItemInline]
    # Shows line items directly on the request page

    list_display = [
        'id',
        'requested_by',
        'department',
        'status',
        'date_needed',
        'created_at',
        'total_cost'
    ]

    list_filter = ['status', 'department', 'reason']
    # Filter sidebar for quick navigation

    search_fields = ['requested_by__username', 'notes', 'admin_notes']
    # Search by requester name or notes

    readonly_fields = ['created_at', 'updated_at', 'updated_by']
    # These fields are set automatically, not manually

    def save_model(self, request, obj, form, change):
        """
        Automatically records who last modified the request
        every time admin saves it.
        """
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
