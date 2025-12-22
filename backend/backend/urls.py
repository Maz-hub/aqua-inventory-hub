"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView
# Imports the user registration endpoint we just created in views.py

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# Pre-built views from SimpleJWT library that handle login token generation
# TokenObtainPairView: Validates username/password and returns access + refresh tokens
# TokenRefreshView: Exchanges an expired access token for a new one using the refresh token

urlpatterns = [
    path("admin/", admin.site.urls),
    # Django's built-in admin panel - manage users and data through web interface
    
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    # POST endpoint for new user registration - accepts username and password
    # POST /api/user/register/ → Create new account
    
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    # POST endpoint for user login - returns access and refresh JWT tokens
    # POST /api/token/ → Get tokens (login)
    
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    # POST endpoint to get a new access token using an unexpired refresh token
    # POST /api/token/refresh/ → Renew access token
    
    path("api-auth/", include("rest_framework.urls")),
    # Adds login/logout views for Django REST Framework's browsable API interface
    # GET /admin/ → Django admin panel (in browser)
]

