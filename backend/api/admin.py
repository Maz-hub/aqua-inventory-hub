from django.contrib import admin
from .models import Gift, GiftCategory, InventoryTransaction, ApparelSize, ApparelColor
from import_export import resources
from import_export.admin import ExportMixin


# ============================================
# GIFT CATEGORY ADMIN
# ============================================

@admin.register(GiftCategory)
class GiftCategoryAdmin(admin.ModelAdmin):
    """Admin interface for gift categories"""
    list_display = ['name', 'created_at']
    search_fields = ['name']


# ============================================
# GIFT ADMIN
# ============================================

@admin.register(Gift)
class GiftAdmin(admin.ModelAdmin):
    """Admin interface for gifts inventory"""
    list_display = ['product_name', 'category', 'qty_stock', 'unit_price', 'created_at', 'created_by']
    list_filter = ['category', 'created_at']
    search_fields = ['product_name', 'description']
    readonly_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']


# ============================================
# INVENTORY TRANSACTION EXPORT RESOURCE
# ============================================

class InventoryTransactionResource(resources.ModelResource):
    """
    Defines which fields to include in Excel export
    Formats the data for easy reading in spreadsheets
    """
    class Meta:
        model = InventoryTransaction
        fields = ('id', 'gift__product_name', 'transaction_type', 'quantity', 'reason', 'notes', 'created_by__username', 'created_at', 'stock_before', 'stock_after')
        # gift__product_name = Shows product name instead of ID
        # created_by__username = Shows username instead of User object
        export_order = fields  # Keeps columns in this order


# ============================================
# INVENTORY TRANSACTION ADMIN
# ============================================

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(ExportMixin, admin.ModelAdmin):
    """
    Admin interface for viewing inventory transaction history
    Includes export functionality for generating Excel reports
    """
    resource_class = InventoryTransactionResource
    # Links to the resource class defined above for exports
    
    list_display = ['id', 'gift', 'transaction_type', 'quantity', 'reason', 'notes', 'created_by', 'created_at', 'stock_before', 'stock_after']
    list_filter = ['transaction_type', 'reason', 'created_at', 'created_by']
    search_fields = ['gift__product_name', 'notes', 'created_by__username']
    readonly_fields = ['gift', 'transaction_type', 'quantity', 'reason', 'notes', 'created_by', 'created_at', 'stock_before', 'stock_after']
    
    def has_add_permission(self, request):
        # Disable manual creation - transactions are auto-created by system
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Disable deletion - preserve complete audit trail
        return False
    
# ============================================
# APPAREL SIZE
# ============================================

@admin.register(ApparelSize)
class ApparelSizeAdmin(admin.ModelAdmin):
    """
    Admin interface for managing standardized apparel sizes.
    Supports clothing sizes (S, M, L), footwear sizes (9.5, 42), and accessory sizes.
    """
    list_display = ['size_value', 'size_type', 'display_order', 'created_at']
    list_filter = ['size_type']
    search_fields = ['size_value']
    ordering = ['size_type', 'display_order']


# ============================================
# APPAREL COLOR
# ============================================

@admin.register(ApparelColor)
class ApparelColorAdmin(admin.ModelAdmin):
    """
    Admin interface for managing standardized apparel colors.
    Displays color swatches alongside names for easy visual identification.
    """
    list_display = ['color_name', 'hex_code', 'created_at']
    search_fields = ['color_name']
    ordering = ['color_name']