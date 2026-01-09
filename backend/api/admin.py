from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Gift, GiftCategory, InventoryTransaction

# Register GiftCategory so it appears in Django admin
@admin.register(GiftCategory)
class GiftCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    # Shows these columns in the admin list view
    search_fields = ['name']
    # Adds search box to filter categories by name

# Register Gift model
@admin.register(Gift)
class GiftAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'category', 'qty_stock', 'unit_price', 'created_at', 'created_by']
    # Shows these columns in the admin list view
    
    list_filter = ['category', 'created_at']
    # Adds filters sidebar
    
    search_fields = ['product_name', 'description']
    # Adds search box
    
    readonly_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']
    # These fields cannot be edited manually (auto-set by system)

# Register Inventory Transactions model
@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    """
    Admin interface for viewing inventory transaction history
    Shows all takes and returns with full audit trail
    """
    list_display = ['id', 'gift', 'transaction_type', 'quantity', 'reason', 'notes', 'created_by', 'created_at', 'stock_before', 'stock_after']
    # Added 'notes' column to show additional transaction details
    # Columns shown in the admin list view
    
    list_filter = ['transaction_type', 'reason', 'created_at', 'created_by']
    # Filter sidebar for narrowing down transactions
    
    search_fields = ['gift__product_name', 'notes', 'created_by__username']
    # Search by product name, notes, or user who made transaction
    
    readonly_fields = ['gift', 'transaction_type', 'quantity', 'reason', 'notes', 'created_by', 'created_at', 'stock_before', 'stock_after']
    # All fields are read-only - transactions cannot be edited once created
    
    def has_add_permission(self, request):
        # Disable manual creation - transactions are auto-created by system
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Disable deletion - preserve complete audit trail
        return False