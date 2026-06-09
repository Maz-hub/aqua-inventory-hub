from django.urls import path
from . import views
from office.views import OfficeTransactionListView

urlpatterns = [
    # GET all office items / POST create a new item
    path("", views.OfficeItemListCreate.as_view(), name="office-item-list"),

    # DELETE a specific office item by ID
    path("delete/<int:pk>/", views.OfficeItemDelete.as_view(), name="delete-office-item"),

    # PATCH manual stock adjustment (take or return) — writes an OfficeTransaction record
    path("update-stock/<int:pk>/", views.update_office_item_stock, name="update-office-item-stock"),

    # PATCH update office item information (name, price, customs fields, etc.)
    path("update/<int:pk>/", views.update_office_item, name="update-office-item"),

    # GET all office categories — used to populate the category dropdown in forms and filters
    path("categories/", views.OfficeCategoryList.as_view(), name="office-category-list"),

    # GET the full stock movement history for a single item — used by history modal
    path("<int:pk>/transactions/", OfficeTransactionListView.as_view(), name="office-item-transactions"),
]
