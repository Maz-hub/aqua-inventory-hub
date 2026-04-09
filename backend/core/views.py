from django.contrib.auth.models import User

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny

from core.serializers import UserSerializer, TakeReasonSerializer

from core.models import TakeReason


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
