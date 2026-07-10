from django.urls import path
from . import views
from executive.views import ExecutiveTransactionListView

urlpatterns = [
    # GET all executive items / POST create a new item
    path("", views.ExecutiveItemListCreate.as_view(), name="executive-item-list"),

    # DELETE a specific executive item by ID
    path("delete/<int:pk>/", views.ExecutiveItemDelete.as_view(), name="delete-executive-item"),

    # PATCH manual stock adjustment (take or return) — writes an ExecutiveTransaction record
    path("update-stock/<int:pk>/", views.update_executive_item_stock, name="update-executive-item-stock"),

    # PATCH update executive item information (name, price, customs fields, etc.)
    path("update/<int:pk>/", views.update_executive_item, name="update-executive-item"),

    # GET all executive categories — used to populate the category dropdown in forms and filters
    path("categories/", views.ExecutiveCategoryList.as_view(), name="executive-category-list"),

    # GET the full stock movement history for a single item — used by TransactionHistoryModal
    path("<int:pk>/transactions/", ExecutiveTransactionListView.as_view(), name="executive-item-transactions"),
]
