from django.urls import path
# Django's URL routing system - maps URLs to view functions/classes

from . import views
# Import all views from current app (api/views.py)

from .views import (
    CreateUserView, GiftListCreate, GiftDelete, GiftCategoryList, TakeReasonList,
    update_gift_stock, update_gift,
    ApparelSizeList, ApparelColorList, ApparelCategoryList,
    ApparelProductListCreate, ApparelProductDetail,
    ApparelVariantListCreate, ApparelVariantDetail,
    update_apparel_stock, ApparelTransactionList
)
# Explicit imports for function-based views (needed for better IDE support)


urlpatterns = [
    # ============================================
    # GIFT INVENTORY ENDPOINTS
    # ============================================
    
    path("gifts/", views.GiftListCreate.as_view(), name="gift-list"),
    # GET /api/gifts/ - List all gifts in inventory
    # POST /api/gifts/ - Create new gift with product details
    # Used by: Gifts page to display inventory and GiftForm to add items
    
    path("gifts/delete/<int:pk>/", views.GiftDelete.as_view(), name="delete-gift"),
    # DELETE /api/gifts/delete/{id}/ - Remove specific gift by ID
    # pk = primary key (gift's unique database ID)
    # Used by: Django admin only (not exposed in frontend currently)
    
    path("gifts/update-stock/<int:pk>/", update_gift_stock, name="update-gift-stock"),
    # PATCH /api/gifts/update-stock/{id}/ - Update stock quantity
    # Used by: Take and Return modals to add/subtract inventory
    # Params: action ('take' or 'return'), quantity (number), reason (TakeReason ID)
    # Creates InventoryTransaction record for audit trail
    
    path("gifts/update/<int:pk>/", update_gift, name="update-gift"),
    # PATCH /api/gifts/update/{id}/ - Update gift product information
    # Used by: EditGiftForm to modify product details, prices, supplier info
    # Handles both file uploads (images) and regular field updates

    # ============================================
    # SHARED RESOURCES
    # ============================================

    path("reasons/", TakeReasonList.as_view(), name="reason-list"),
    # GET /api/reasons/ - Fetch all take reasons
    # Used by: Take modals in both Gifts and Apparel inventories
    # Returns reasons filtered by applies_to field (gifts/apparel/both)
    
    path("categories/", views.GiftCategoryList.as_view(), name="category-list"),
    # GET /api/categories/ - Fetch all gift categories
    # Used by: Dropdown menus in GiftForm and EditGiftForm
    # Returns list of categories sorted alphabetically

    # ============================================
    # APPAREL INVENTORY ENDPOINTS
    # ============================================
    
    # Dropdown data endpoints
    path("apparel/sizes/", ApparelSizeList.as_view(), name="apparel-size-list"),
    # GET /api/apparel/sizes/ - Fetch all standardized apparel sizes
    # Returns sizes grouped by type (clothing/footwear/accessory) with display ordering
    # Used by: Variant creation forms to populate size dropdowns
    
    path("apparel/colors/", ApparelColorList.as_view(), name="apparel-color-list"),
    # GET /api/apparel/colors/ - Fetch all standardized apparel colors
    # Returns color names with optional hex codes for visual swatches
    # Used by: Variant creation forms to populate color dropdowns
    
    path("apparel/categories/", ApparelCategoryList.as_view(), name="apparel-category-list"),
    # GET /api/apparel/categories/ - Fetch all apparel product categories
    # Returns categories like Staff Polo, Winter Jacket, Shoes, etc.
    # Used by: Product forms and filtering dropdowns
    
    # Product endpoints
    path("apparel/products/", ApparelProductListCreate.as_view(), name="apparel-product-list-create"),
    # GET /api/apparel/products/ - List all apparel products with nested variants
    # POST /api/apparel/products/ - Create new product (without variants initially)
    # Used by: Apparel inventory page and product creation form
    
    path("apparel/products/<int:pk>/", ApparelProductDetail.as_view(), name="apparel-product-detail"),
    # GET /api/apparel/products/{id}/ - Retrieve single product with all variants
    # PATCH /api/apparel/products/{id}/ - Update product information
    # DELETE /api/apparel/products/{id}/ - Delete product (CASCADE deletes variants)
    # Used by: Product detail views and edit forms
    
    # Variant endpoints (size/color combinations)
    path("apparel/variants/", ApparelVariantListCreate.as_view(), name="apparel-variant-list-create"),
    # GET /api/apparel/variants/ - List all variants (optionally filter by ?product_id=X)
    # POST /api/apparel/variants/ - Create new size/color variant for a product
    # Used by: Variant management and inventory views
    
    path("apparel/variants/<int:pk>/", ApparelVariantDetail.as_view(), name="apparel-variant-detail"),
    # GET /api/apparel/variants/{id}/ - Retrieve single variant details
    # PATCH /api/apparel/variants/{id}/ - Update variant (e.g., adjust stock manually)
    # DELETE /api/apparel/variants/{id}/ - Delete variant
    # Used by: Variant detail pages and admin adjustments
    
    path("apparel/variants/update-stock/<int:pk>/", update_apparel_stock, name="apparel-update-stock"),
    # PATCH /api/apparel/variants/update-stock/{id}/ - Take or return items from variant
    # Params: action ('take'/'return'), quantity (number), reason (TakeReason ID), notes
    # Creates ApparelTransaction record for audit trail
    # Used by: Take and Return modals in Apparel inventory
    
    # Transaction history
    path("apparel/transactions/", ApparelTransactionList.as_view(), name="apparel-transaction-list"),
    # GET /api/apparel/transactions/ - List all apparel transactions
    # Optional filters: ?variant_id=X or ?product_id=Y
    # Returns complete audit trail with who/what/when/why/stock levels
    # Used by: Transaction history page and Excel export
]