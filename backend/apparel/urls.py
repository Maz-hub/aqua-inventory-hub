from django.urls import path
from . import views

urlpatterns = [
    path("sizes/", views.ApparelSizeList.as_view(), name="apparel-size-list"),
    path("colors/", views.ApparelColorList.as_view(), name="apparel-color-list"),
    path("categories/", views.ApparelCategoryList.as_view(), name="apparel-category-list"),
    path("products/", views.ApparelProductListCreate.as_view(), name="apparel-product-list-create"),
    path("products/<int:pk>/", views.ApparelProductDetail.as_view(), name="apparel-product-detail"),
    path("variants/", views.ApparelVariantListCreate.as_view(), name="apparel-variant-list-create"),
    path("variants/<int:pk>/", views.ApparelVariantDetail.as_view(), name="apparel-variant-detail"),
    path("variants/update-stock/<int:pk>/", views.update_apparel_stock, name="apparel-update-stock"),
    path("transactions/", views.ApparelTransactionList.as_view(), name="apparel-transaction-list"),
]
