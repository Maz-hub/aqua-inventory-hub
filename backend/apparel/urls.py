from django.urls import path
from . import views

urlpatterns = [
    # ============================================
    # REFERENCE DATA — used to populate dropdowns
    # ============================================

    # GET all sizes (clothing and footwear combined; frontend splits them by size_type)
    path("sizes/", views.ApparelSizeList.as_view(), name="apparel-size-list"),

    # GET all colours
    path("colors/", views.ApparelColorList.as_view(), name="apparel-color-list"),

    # GET all apparel categories
    path("categories/", views.ApparelCategoryList.as_view(), name="apparel-category-list"),

    # ============================================
    # PRODUCTS
    # ============================================

    # GET all products (with nested variants) / POST create a new product
    path("products/", views.ApparelProductListCreate.as_view(), name="apparel-product-list-create"),

    # GET / PATCH / DELETE a single product
    # DELETE cascades to remove all variants for that product
    path("products/<int:pk>/", views.ApparelProductDetail.as_view(), name="apparel-product-detail"),

    # ============================================
    # VARIANTS
    # ============================================

    # GET all variants / POST create a new variant
    # Supports ?product_id= filter to fetch only variants for a specific product
    path("variants/", views.ApparelVariantListCreate.as_view(), name="apparel-variant-list-create"),

    # GET / PATCH / DELETE a single variant
    path("variants/<int:pk>/", views.ApparelVariantDetail.as_view(), name="apparel-variant-detail"),

    # PATCH manual stock adjustment (take or add) — called by ApparelStockAdjustModal
    # Writes an ApparelTransaction record with the reason and stock snapshot
    path("variants/update-stock/<int:pk>/", views.update_apparel_stock, name="apparel-update-stock"),

    # ============================================
    # TRANSACTION HISTORY
    # ============================================

    # GET apparel transaction history
    # Supports ?product_id= (all variants of a product) or ?variant_id= (single variant)
    # Used by ApparelHistoryModal
    path("transactions/", views.ApparelTransactionList.as_view(), name="apparel-transaction-list"),
]
