# Root URL configuration for the backend.
# All API routes are prefixed with /api/ and delegated to app-level urls.py files.
# Media file serving (product images) is enabled in development via DEBUG check at the bottom.

from django.contrib import admin
from django.urls import path, include
from core.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django admin panel — manage users, groups, and model data through the browser
    path("admin/", admin.site.urls),

    # POST /api/user/register/ — creates a new user account
    path("api/user/register/", CreateUserView.as_view(), name="register"),

    # POST /api/token/ — login: validates username and password, returns access + refresh JWT tokens
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),

    # POST /api/token/refresh/ — exchanges a valid refresh token for a new access token
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),

    # Login/logout views for the DRF browsable API interface (development convenience)
    path("api-auth/", include("rest_framework.urls")),

    # App-level URL routing
    path("api/", include("core.urls")),                      # user info, reasons, departments
    path("api/gifts/", include("gifts.urls")),               # gifts inventory
    path("api/apparel/", include("apparel.urls")),           # apparel inventory
    path("api/requests/", include("item_requests.urls")),    # item requests
]

# Serve uploaded product images in development.
# In production, a web server (e.g. nginx) handles media file serving instead.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
