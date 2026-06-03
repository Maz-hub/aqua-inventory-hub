from django.urls import path
from . import views
from gifts.views import GiftTransactionListView

urlpatterns = [
    # GET all gifts / POST create a new gift
    path("", views.GiftListCreate.as_view(), name="gift-list"),

    # DELETE a specific gift by ID
    path("delete/<int:pk>/", views.GiftDelete.as_view(), name="delete-gift"),

    # PATCH manual stock adjustment (take or return) — writes an InventoryTransaction record
    path("update-stock/<int:pk>/", views.update_gift_stock, name="update-gift-stock"),

    # PATCH update gift product information (name, price, customs fields, etc.)
    path("update/<int:pk>/", views.update_gift, name="update-gift"),

    # GET all gift categories — used to populate the category dropdown in forms and filters
    path("categories/", views.GiftCategoryList.as_view(), name="gift-category-list"),

    # GET the full stock movement history for a single gift — used by TransactionHistoryModal
    path("<int:pk>/transactions/", GiftTransactionListView.as_view(), name="gift-transactions"),
]
