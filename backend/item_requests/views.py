from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ItemRequest, ItemRequestItem
from .serializers import ItemRequestSerializer, ItemRequestItemSerializer, DepartmentSerializer
from accounts.permissions import IsAdminUser
from core.models import Department


# ============================================
# DEPARTMENT VIEWS
# ============================================

class DepartmentList(generics.ListAPIView):
    """
    Returns all departments for dropdown population.
    GET /api/requests/departments/
    Accessible to all authenticated users.
    """
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    queryset = Department.objects.all()


# ============================================
# ITEM REQUEST VIEWS
# ============================================

class ItemRequestListCreate(generics.ListCreateAPIView):
    """
    GET  /api/requests/          → Admin sees ALL requests
    POST /api/requests/          → Any user creates a new request
    """
    serializer_class = ItemRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Admin sees all requests.
        Regular users only see their own requests.
        """
        user = self.request.user
        if user.is_superuser or user.groups.filter(name='admin').exists():
            return ItemRequest.objects.all()
        return ItemRequest.objects.filter(requested_by=user)

    def perform_create(self, serializer):
        """
        Automatically sets the requester to the logged-in user.
        New requests always start as Draft.
        """
        serializer.save(
            requested_by=self.request.user,
            status='draft'
        )


class ItemRequestDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/requests/<id>/  → View request details
    PATCH  /api/requests/<id>/  → Update request
    DELETE /api/requests/<id>/  → Delete request (admin only)
    """
    serializer_class = ItemRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Admin can access any request.
        Regular users can only access their own.
        """
        user = self.request.user
        if user.is_superuser or user.groups.filter(name='admin').exists():
            return ItemRequest.objects.all()
        return ItemRequest.objects.filter(requested_by=user)

    def perform_update(self, serializer):
        """
        Records who last updated the request.
        """
        serializer.save(updated_by=self.request.user)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def submit_request(request, pk):
    """
    Moves a Draft request to Pending status.
    PATCH /api/requests/<id>/submit/
    Only the requester can submit their own draft.
    Stock reservation happens here.
    """
    item_request = get_object_or_404(ItemRequest, pk=pk)

    # Only the owner can submit their own request
    if item_request.requested_by != request.user:
        return Response(
            {"error": "You can only submit your own requests."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Can only submit from Draft status
    if item_request.status != 'draft':
        return Response(
            {"error": "Only draft requests can be submitted."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Move to Pending — stock reservation handled here later
    item_request.status = 'pending'
    item_request.save()

    return Response(
        {"message": "Request submitted successfully.", "status": "pending"},
        status=status.HTTP_200_OK
    )


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_request_status(request, pk):
    """
    Admin updates request status through the workflow.
    PATCH /api/requests/<id>/status/
    Only admin can change status (except submit which is done by requester).
    """
    item_request = get_object_or_404(ItemRequest, pk=pk)
    new_status = request.data.get('status')

    valid_statuses = ['draft', 'pending', 'in_preparation', 'ready', 'completed', 'cancelled']

    if new_status not in valid_statuses:
        return Response(
            {"error": f"Invalid status. Choose from: {valid_statuses}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    item_request.status = new_status
    item_request.updated_by = request.user
    item_request.save()

    return Response(
        {"message": f"Status updated to {new_status}."},
        status=status.HTTP_200_OK
    )


# ============================================
# ITEM REQUEST LINE ITEMS
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_item_to_request(request, pk):
    """
    Adds a line item to an existing Draft request.
    POST /api/requests/<id>/items/add/
    Only works on Draft requests.
    """
    item_request = get_object_or_404(ItemRequest, pk=pk)

    # Only owner or admin can add items
    if item_request.requested_by != request.user:
        if not (request.user.is_superuser or
                request.user.groups.filter(name='admin').exists()):
            return Response(
                {"error": "You can only modify your own requests."},
                status=status.HTTP_403_FORBIDDEN
            )

    serializer = ItemRequestItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(request=item_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_request_item(request, pk, item_pk):
    """
    PATCH  /api/requests/<id>/items/<item_id>/  → Update a line item
    DELETE /api/requests/<id>/items/<item_id>/  → Remove a line item
    Admin can modify at any status.
    Requester can only modify their own Draft requests.
    """
    item_request = get_object_or_404(ItemRequest, pk=pk)
    item = get_object_or_404(ItemRequestItem, pk=item_pk, request=item_request)

    is_admin = request.user.is_superuser or \
               request.user.groups.filter(name='admin').exists()

    # Non-admin can only modify their own draft requests
    if not is_admin:
        if item_request.requested_by != request.user:
            return Response(
                {"error": "You can only modify your own requests."},
                status=status.HTTP_403_FORBIDDEN
            )
        if item_request.status != 'draft':
            return Response(
                {"error": "You can only modify draft requests."},
                status=status.HTTP_400_BAD_REQUEST
            )

    if request.method == 'DELETE':
        item.delete()
        return Response(
            {"message": "Item removed from request."},
            status=status.HTTP_204_NO_CONTENT
        )

    serializer = ItemRequestItemSerializer(item, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
