from django.contrib import admin
from .models import Gift, GiftCategory, InventoryTransaction, ApparelSize, ApparelColor, TakeReason, ApparelCategory, ApparelProduct, ApparelVariant, ApparelTransaction
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

# ============================================
# TAKE REASON
# ============================================

@admin.register(TakeReason)
class TakeReasonAdmin(admin.ModelAdmin):
    """
    Admin interface for managing inventory transaction reasons.
    Shared between Gifts and Apparel inventories with filtering by applicability.
    """
    list_display = ['reason_name', 'applies_to', 'created_at']
    list_filter = ['applies_to']
    search_fields = ['reason_name']
    ordering = ['reason_name']

# ============================================
# APPAREL CATEGORY
# ============================================

@admin.register(ApparelCategory)
class ApparelCategoryAdmin(admin.ModelAdmin):
    """
    Admin interface for managing apparel product categories.
    Enables organization and filtering of 361° inventory.
    """
    list_display = ['name', 'created_at']
    search_fields = ['name']
    ordering = ['name']


# ============================================
# APPAREL PRODUCT
# ============================================

@admin.register(ApparelProduct)
class ApparelProductAdmin(admin.ModelAdmin):
    """
    Admin interface for managing base apparel products.
    Each product can have multiple size/color variants managed separately.
    """
    list_display = ['product_name', 'category', 'unit_price', 'item_id', 'created_at']
    list_filter = ['category', 'country_of_origin']
    search_fields = ['product_name', 'item_id', 'material']
    ordering = ['product_name']
    
    fieldsets = (
        ('Product Information', {
            'fields': ('product_name', 'category', 'item_id', 'product_image')
        }),
        ('Details', {
            'fields': ('description', 'material')
        }),
        ('Pricing & Customs', {
            'fields': ('unit_price', 'hs_code', 'country_of_origin')
        }),
        ('Internal', {
            'fields': ('notes',)
        }),
        ('Audit Trail', {
            'fields': ('created_at', 'created_by', 'updated_at', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']


# ============================================
# APPAREL VARIANT
# ============================================

@admin.register(ApparelVariant)
class ApparelVariantAdmin(admin.ModelAdmin):
    """
    Admin interface for managing size/color variants with stock tracking.
    Each variant represents a specific size/color combination of a product.
    """
    list_display = ['product', 'size', 'color', 'qty_stock', 'minimum_stock_level', 'created_at']
    list_filter = ['product__category', 'size__size_type', 'color']
    search_fields = ['product__product_name', 'sku']
    ordering = ['product', 'size__display_order']
    
    fieldsets = (
        ('Variant Information', {
            'fields': ('product', 'size', 'color')
        }),
        ('Stock Management', {
            'fields': ('qty_stock', 'minimum_stock_level')
        }),
        ('Additional Details', {
            'fields': ('weight', 'sku')
        }),
        ('Audit Trail', {
            'fields': ('created_at', 'created_by', 'updated_at', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']


# ============================================
# APPAREL TRANSACTION
# ============================================

@admin.register(ApparelTransaction)
class ApparelTransactionAdmin(admin.ModelAdmin):
    """
    Admin interface for viewing apparel inventory transaction history.
    Transactions are read-only to maintain audit trail integrity.
    """
    list_display = ['variant', 'transaction_type', 'quantity', 'reason', 'created_by', 'created_at', 'stock_before', 'stock_after']
    list_filter = ['transaction_type', 'reason', 'created_at']
    search_fields = ['variant__product__product_name', 'notes', 'created_by__username']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('variant', 'transaction_type', 'quantity', 'reason', 'notes')
        }),
        ('Stock Information', {
            'fields': ('stock_before', 'stock_after')
        }),
        ('Audit Information', {
            'fields': ('created_by', 'created_at')
        }),
    )
    
    readonly_fields = ['variant', 'transaction_type', 'quantity', 'reason', 'notes', 'stock_before', 'stock_after', 'created_by', 'created_at']
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False