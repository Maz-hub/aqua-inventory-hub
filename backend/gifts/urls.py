from django.urls import path
from . import views
from gifts.views import GiftTransactionListView

urlpatterns = [
    path("", views.GiftListCreate.as_view(), name="gift-list"),
    path("delete/<int:pk>/", views.GiftDelete.as_view(), name="delete-gift"),
    path("update-stock/<int:pk>/", views.update_gift_stock, name="update-gift-stock"),
    path("update/<int:pk>/", views.update_gift, name="update-gift"),
    path("categories/", views.GiftCategoryList.as_view(), name="gift-category-list"),
    path("<int:pk>/transactions/", GiftTransactionListView.as_view(), name="gift-transactions"),
]
