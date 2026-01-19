from django.urls import path
# Django's URL routing system - maps URLs to view functions/classes

from . import views
# Import all views from current app (api/views.py)

from .views import update_gift_stock, update_gift, TakeReasonList
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
    # Params: action ('take' or 'return'), quantity (number)
    
    path("gifts/update/<int:pk>/", update_gift, name="update-gift"),
    # PATCH /api/gifts/update/{id}/ - Update gift product information
    # Used by: EditGiftForm to modify product details, prices, supplier info
    # Handles both file uploads (images) and regular field updates

    path("reasons/", TakeReasonList.as_view(), name="reason-list"),
    
    # ============================================
    # CATEGORY ENDPOINTS
    # ============================================
    
    path("categories/", views.GiftCategoryList.as_view(), name="category-list"),
    # GET /api/categories/ - Fetch all gift categories
    # Used by: Dropdown menus in GiftForm and EditGiftForm
    # Returns list of categories sorted alphabetically
]