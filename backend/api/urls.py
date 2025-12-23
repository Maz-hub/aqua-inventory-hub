from django.urls import path
# Django's URL routing system

from . import views
# Import views from current app


urlpatterns = [
    path("gifts/", views.GiftListCreate.as_view(), name="gift-list"),
    # GET: List all gifts, POST: Create new gift
    
    path("gifts/delete/<int:pk>/", views.GiftDelete.as_view(), name="delete-gift"),
    # DELETE: Remove specific gift by ID (pk = primary key)
    
    path("categories/", views.GiftCategoryList.as_view(), name="category-list"),
    # GET: Fetch all gift categories for dropdown menus
]