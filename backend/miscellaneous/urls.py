from django.urls import path
from . import views
from miscellaneous.views import MiscellaneousTransactionListView

urlpatterns = [
    # GET all miscellaneous items / POST create a new item
    path("", views.MiscellaneousItemListCreate.as_view(), name="miscellaneous-item-list"),

    # DELETE a specific miscellaneous item by ID
    path("delete/<int:pk>/", views.MiscellaneousItemDelete.as_view(), name="delete-miscellaneous-item"),

    # PATCH manual stock adjustment (take or return) — writes a MiscellaneousTransaction record
    path("update-stock/<int:pk>/", views.update_miscellaneous_item_stock, name="update-miscellaneous-item-stock"),

    # PATCH update miscellaneous item information (name, price, customs fields, etc.)
    path("update/<int:pk>/", views.update_miscellaneous_item, name="update-miscellaneous-item"),

    # GET all miscellaneous categories — used to populate the category dropdown in forms and filters
    path("categories/", views.MiscellaneousCategoryList.as_view(), name="miscellaneous-category-list"),

    # GET the full stock movement history for a single item — used by history modal
    path("<int:pk>/transactions/", MiscellaneousTransactionListView.as_view(), name="miscellaneous-item-transactions"),
]
