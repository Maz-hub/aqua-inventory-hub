from django.urls import path
from . import views

urlpatterns = [
    # ============================================
    # DEPARTMENT ENDPOINTS
    # ============================================

    # GET all departments — used to populate the department dropdown on the request form
    path("departments/", views.DepartmentList.as_view(), name="department-list"),

    # ============================================
    # ITEM REQUEST ENDPOINTS
    # ============================================

    # GET all requests (admin sees all; users see only their own)
    # POST create a new draft request
    path("", views.ItemRequestListCreate.as_view(), name="item-request-list-create"),

    # GET / PATCH / DELETE a specific request
    path("<int:pk>/", views.ItemRequestDetail.as_view(), name="item-request-detail"),

    # PATCH moves a draft request to pending — deducts stock for all line items
    # Only the original requester can call this
    path("<int:pk>/submit/", views.submit_request, name="item-request-submit"),

    # PATCH cancels a pending request and restores stock for all line items
    # Requester or admin can cancel; only works on pending (not draft) requests
    path("<int:pk>/cancel/", views.cancel_request, name="item-request-cancel"),

    # PATCH moves a request to a different status — admin only, no stock movement
    path("<int:pk>/status/", views.update_request_status, name="item-request-status"),

    # ============================================
    # LINE ITEM ENDPOINTS
    # ============================================

    # POST add a new line item to a request
    path("<int:pk>/items/add/", views.add_item_to_request, name="item-request-add-item"),

    # PATCH update a line item / DELETE remove a line item
    # Admin can modify at any status; requester can only modify their own draft requests
    path("<int:pk>/items/<int:item_pk>/", views.manage_request_item, name="item-request-manage-item"),

    # PATCH set or update quantity_confirmed on a line item — admin only
    # Reconciles stock against the previously deducted quantity (take or return the difference)
    path("<int:pk>/items/<int:item_pk>/confirm/", views.confirm_request_item, name="item-request-confirm-item"),
]
