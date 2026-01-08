from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Gift, GiftCategory

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