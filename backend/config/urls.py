# Root URL configuration for the backend.
# All API routes are prefixed with /api/ and delegated to app-level urls.py files.
# The catch-all at the bottom serves the React SPA's index.html for any non-API URL,
# enabling client-side React Router to handle navigation.
# Media file serving (product images) is enabled in development via DEBUG check at the bottom.

from django.contrib import admin
from django.urls import path, include, re_path
from django.views import View
from django.http import FileResponse, Http404
from core.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
import os


# Serves the React build's index.html for any URL not matched by the API.
# React Router then takes over and renders the correct page client-side.
# Raises 404 if the frontend hasn't been built yet (run npm run build first).
class ReactAppView(View):
    def get(self, request, *args, **kwargs):
        index_path = settings.BASE_DIR / 'frontend' / 'dist' / 'index.html'
        try:
            return FileResponse(open(index_path, 'rb'), content_type='text/html')
        except FileNotFoundError:
            raise Http404("Frontend build not found. Run 'npm run build' in the frontend directory.")


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
    path("api/office/", include("office.urls")),             # office & events inventory
    path("api/auth/", include("accounts.urls")),             # Microsoft SSO login

    # Catch-all — must be last. Serves React's index.html for all non-API routes.
    re_path(r'^(?!api/).*$', ReactAppView.as_view(), name='react-app'),
]

# Serve uploaded product images in development.
# In production, media is served from Azure Blob Storage instead.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
