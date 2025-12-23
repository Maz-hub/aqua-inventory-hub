from django.shortcuts import render
# Renders HTML templates - not commonly used in REST APIs

from django.contrib.auth.models import User
# Django's built-in User table - handles authentication and user data storage

from rest_framework import generics
# Provides ready-made view classes for common CRUD operations (Create, Read, Update, Delete)

from .serializers import UserSerializer, GiftSerializer, GiftCategorySerializer
# Converts User data between Python objects and JSON format for API responses

from rest_framework.permissions import IsAuthenticated, AllowAny
# Controls API endpoint access: IsAuthenticated requires login, AllowAny allows public access

from .models import Gift, GiftCategory


# VIEWS
class GiftListCreate(generics.ListCreateAPIView):
    # API endpoint that handles both listing all gifts (GET) and creating new gifts (POST)
    
    serializer_class = GiftSerializer
    # Specifies which serializer to use for data validation and conversion
    
    permission_classes = [IsAuthenticated]
    # Requires users to be logged in to view or create gifts
    
    queryset = Gift.objects.all()
    # Returns ALL gifts - this is shared inventory, everyone sees everything
    
    def perform_create(self, serializer):
        # Custom create logic to automatically set created_by field
        
        if serializer.is_valid():
            # Data passed validation, save gift with creator information
            serializer.save(created_by=self.request.user)
        else:
            # Data validation failed, log errors for debugging
            print(serializer.errors)


class GiftDelete(generics.DestroyAPIView):
    # API endpoint to delete a specific gift from inventory
    
    serializer_class = GiftSerializer
    # Specifies which serializer to use
    
    permission_classes = [IsAuthenticated]
    # Requires users to be logged in to delete gifts
    
    queryset = Gift.objects.all()
    # Can delete any gift - no user filtering (shared inventory)
        

class GiftCategoryList(generics.ListAPIView):
    # API endpoint to fetch all available gift categories for dropdown menus
    
    serializer_class = GiftCategorySerializer
    # Uses GiftCategorySerializer to convert categories to JSON
    
    permission_classes = [IsAuthenticated]
    # Users must be logged in to see categories
    
    queryset = GiftCategory.objects.all()
    # Returns all categories, ordered alphabetically (from model's Meta.ordering)


class CreateUserView(generics.CreateAPIView):
    # API endpoint for user registration - allows new users to create accounts
    
    queryset = User.objects.all()
    # Defines the full set of User objects this view can work with
    
    serializer_class = UserSerializer
    # Specifies which serializer to use for validating and saving user data
    
    permission_classes = [AllowAny]
    # Allows unauthenticated access - anyone can register without being logged in