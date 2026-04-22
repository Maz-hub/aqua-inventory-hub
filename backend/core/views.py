from django.contrib.auth.models import User

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

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


# ============================================
# CURRENT USER INFO VIEW
# ============================================

class CurrentUserView(APIView):
    """
    Returns the currently logged-in user's info.
    GET /api/user/me/
    Used by frontend to determine which sections
    to show, hide, or gray out based on group membership.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get all group names this user belongs to
        groups = list(user.groups.values_list('name', flat=True))

        # Superusers get all access regardless of groups
        if user.is_superuser:
            groups = ['admin', 'gifts_access', 'apparel_access',
                      'executive_access', 'it_access']

        # Get department from profile if it exists
        try:
            department = user.profile.department
        except:
            department = ''

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'groups': groups,
            'department': department,
            'is_superuser': user.is_superuser,
        })
