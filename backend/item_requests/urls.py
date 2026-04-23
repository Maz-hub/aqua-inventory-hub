from django.urls import path
from . import views

urlpatterns = [
    # ============================================
    # DEPARTMENT ENDPOINTS
    # ============================================
    path("departments/", views.DepartmentList.as_view(), name="department-list"),

    # ============================================
    # ITEM REQUEST ENDPOINTS
    # ============================================

    # List all requests (admin) or own requests (user)
    # Create new request
    path("", views.ItemRequestListCreate.as_view(), name="item-request-list-create"),

    # View, update, or delete a specific request
    path("<int:pk>/", views.ItemRequestDetail.as_view(), name="item-request-detail"),

    # Requester submits their draft request
    path("<int:pk>/submit/", views.submit_request, name="item-request-submit"),

    # Admin updates request status
    path("<int:pk>/status/", views.update_request_status, name="item-request-status"),

    # ============================================
    # LINE ITEM ENDPOINTS
    # ============================================

    # Add item to a request
    path("<int:pk>/items/add/", views.add_item_to_request, name="item-request-add-item"),

    # Update or delete a specific line item
    path("<int:pk>/items/<int:item_pk>/", views.manage_request_item, name="item-request-manage-item"),
]
