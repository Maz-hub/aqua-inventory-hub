from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User, Group
from rest_framework_simplejwt.tokens import RefreshToken
from .microsoft_auth import verify_microsoft_token

# Create your views here.


class MicrosoftLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('access_token')
        if not token:
            return Response({'error': 'No token provided'}, status=400)

        # Verify the token with Microsoft and decode its contents.
        # If it's invalid, expired, or badly formed, reject the request.
        try:
            payload = verify_microsoft_token(token)
        except Exception:
            return Response({'error': 'Invalid token'}, status=401)

        # Microsoft tokens usually include 'email', but some accounts only have
        # 'preferred_username' set, so fall back to that if needed.
        email = payload.get('email') or payload.get('preferred_username')
        if not email:
            return Response({'error': 'No email in token'}, status=400)

        # Look up an existing user by email (case-insensitive).
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            # No account yet — create one and give it read-only access to
            # Office & Events by default.
            user = User.objects.create(username=email, email=email)
            office_viewer_group = Group.objects.get(name='office_viewer')
            user.groups.add(office_viewer_group)

        # Issue our own JWT pair for this user, the same way /api/token/ does for
        # normal username/password login, so the frontend can treat both the same way.
        refresh = RefreshToken.for_user(user)
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh)}, status=200)
