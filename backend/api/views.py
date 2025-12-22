from django.shortcuts import render
# Renders HTML templates - not commonly used in REST APIs

from django.contrib.auth.models import User
# Django's built-in User table - handles authentication and user data storage

from rest_framework import generics
# Provides ready-made view classes for common CRUD operations (Create, Read, Update, Delete)

from .serializers import UserSerializer
# Converts User data between Python objects and JSON format for API responses

from rest_framework.permissions import IsAuthenticated, AllowAny
# Controls API endpoint access: IsAuthenticated requires login, AllowAny allows public access

# Create your views here.
