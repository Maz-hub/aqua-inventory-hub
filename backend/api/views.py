from django.shortcuts import render
# Renders HTML templates - not commonly used in REST APIs

from django.contrib.auth.models import User
# Django's built-in User table - handles authentication and user data storage

from rest_framework import generics
# Provides ready-made view classes for common CRUD operations (Create, Read, Update, Delete)

from .serializers import UserSerializer, GiftSerializer, GiftCategorySerializer, TakeReasonSerializer
# Converts data between Python objects and JSON format for API responses

from rest_framework.permissions import IsAuthenticated, AllowAny
# Controls API endpoint access: IsAuthenticated requires login, AllowAny allows public access

from .models import Gift, GiftCategory, InventoryTransaction, TakeReason
# Import our Gift and GiftCategory models

from rest_framework.decorators import api_view, permission_classes
# Decorators for function-based views

from rest_framework.response import Response
# Used to return JSON responses from API endpoints

from rest_framework import status
# HTTP status codes (200 OK, 404 Not Found, etc.)



# ============================================
# GIFT INVENTORY VIEWS
# ============================================

class GiftListCreate(generics.ListCreateAPIView):
    """
    API endpoint that handles:
    - GET: List all gifts in inventory
    - POST: Create a new gift
    """
    
    serializer_class = GiftSerializer
    # Specifies which serializer to use for data validation and conversion
    
    permission_classes = [IsAuthenticated]
    # Requires users to be logged in to view or create gifts
    
    queryset = Gift.objects.all()
    # Returns ALL gifts - this is shared inventory, everyone sees everything
    
    def perform_create(self, serializer):
        """
        Custom create logic to automatically set created_by field
        Called when a new gift is created via POST request
        """
        if serializer.is_valid():
            # Data passed validation, save gift with creator information
            serializer.save(created_by=self.request.user)
        else:
            # Data validation failed, log errors for debugging
            print(serializer.errors)


class GiftDelete(generics.DestroyAPIView):
    """
    API endpoint to delete a specific gift from inventory
    DELETE /api/gifts/delete/{id}/
    """
    
    serializer_class = GiftSerializer
    # Specifies which serializer to use
    
    permission_classes = [IsAuthenticated]
    # Requires users to be logged in to delete gifts
    
    queryset = Gift.objects.all()
    # Can delete any gift - no user filtering (shared inventory)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_gift_stock(request, pk):
    """
    Updates gift stock quantity for Take/Return actions
    PATCH /api/gifts/update-stock/{id}/
    
    Now also creates InventoryTransaction record for audit trail
    """
    # Try to find the gift by ID
    try:
        gift = Gift.objects.get(pk=pk)
    except Gift.DoesNotExist:
        return Response(
            {"error": "Gift not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get action, quantity, reason, and notes from request
    action = request.data.get('action')  # 'take' or 'return'
    quantity = request.data.get('quantity')
    reason_id = request.data.get('reason')  # Now expects TakeReason ID
    notes = request.data.get('notes', '')  # Optional notes
    
    # Validate required fields
    if not action or not quantity:
        return Response(
            {"error": "Action and quantity required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Convert quantity to integer and validate
    try:
        quantity = int(quantity)
    except ValueError:
        return Response(
            {"error": "Invalid quantity"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Record stock level before change
    stock_before = gift.qty_stock
    
    # Handle 'take' action - reduce stock
    if action == 'take':
        # Check if enough stock available
        if gift.qty_stock < quantity:
            return Response(
                {"error": f"Insufficient stock. Only {gift.qty_stock} available."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        # Reduce stock quantity
        gift.qty_stock -= quantity
    
    # Handle 'return' action - increase stock
    elif action == 'return':
        gift.qty_stock += quantity
    
    # Invalid action provided
    else:
        return Response(
            {"error": "Invalid action. Use 'take' or 'return'"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Record stock level after change
    stock_after = gift.qty_stock
    
    # Save the updated gift
    gift.updated_by = request.user
    gift.save()
    
    # Create transaction record for audit trail
    # Get TakeReason object if reason_id provided
    take_reason = None
    if action == 'take' and reason_id:
        try:
            from .models import TakeReason
            take_reason = TakeReason.objects.get(id=reason_id)
        except TakeReason.DoesNotExist:
            pass  # Will save transaction with None reason if invalid ID
    
    InventoryTransaction.objects.create(
        gift=gift,
        transaction_type=action,
        quantity=quantity,
        reason=take_reason,  # Now uses TakeReason object
        notes=notes,
        created_by=request.user,
        stock_before=stock_before,
        stock_after=stock_after
    )
    
    # Return success response with new stock level
    return Response({
        "message": "Stock updated successfully",
        "new_stock": gift.qty_stock
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_gift(request, pk):
    """
    Updates gift product information
    PATCH /api/gifts/update/{id}/
    
    Handles both file uploads (images) and regular field updates.
    Records who made the update and when.
    """
    # Try to find the gift by ID
    try:
        gift = Gift.objects.get(pk=pk)
    except Gift.DoesNotExist:
        return Response(
            {"error": "Gift not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Use serializer to validate and update data
    # partial=True allows updating only some fields, not all required
    serializer = GiftSerializer(gift, data=request.data, partial=True)
    
    if serializer.is_valid():
        # Save updates and record who made the change
        serializer.save(updated_by=request.user)
        
        return Response({
            "message": "Product updated successfully",
            "gift": serializer.data
        }, status=status.HTTP_200_OK)
    else:
        # Return validation errors if data is invalid
        return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST
        )

# ============================================
# GIFT CATEGORY VIEWS
# ============================================

class GiftCategoryList(generics.ListAPIView):
    """
    API endpoint to fetch all available gift categories
    GET /api/categories/
    Used to populate dropdown menus in the frontend
    """
    
    serializer_class = GiftCategorySerializer
    # Uses GiftCategorySerializer to convert categories to JSON
    
    permission_classes = [IsAuthenticated]
    # Users must be logged in to see categories
    
    queryset = GiftCategory.objects.all()
    # Returns all categories, ordered alphabetically (from model's Meta.ordering)


# ============================================
# USER REGISTRATION VIEW
# ============================================

class CreateUserView(generics.CreateAPIView):
    """
    API endpoint for user registration
    POST /api/user/register/
    Allows new users to create accounts without being logged in
    """
    
    queryset = User.objects.all()
    # Defines the full set of User objects this view can work with
    
    serializer_class = UserSerializer
    # Specifies which serializer to use for validating and saving user data
    
    permission_classes = [AllowAny]
    # Allows unauthenticated access - anyone can register without being logged in


# ============================================
# TAKE REASON VIEWS
# ============================================

class TakeReasonList(generics.ListAPIView):
    """
    API endpoint to fetch all available take reasons
    GET /api/reasons/
    Used to populate reason dropdowns in Gifts and Apparel forms
    """
    
    serializer_class = TakeReasonSerializer
    permission_classes = [IsAuthenticated]
    queryset = TakeReason.objects.all()