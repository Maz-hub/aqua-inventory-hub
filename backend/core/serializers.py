from django.contrib.auth.models import User
from rest_framework import serializers

from core.models import TakeReason


class UserSerializer(serializers.ModelSerializer):
    # Converts User model data to JSON and validates incoming user registration data

    class Meta:
        # Configuration for the serializer
        model = User
        # Specifies which database model this serializer works with

        fields = ["id", "username", "password"]
        # Only these fields will be included in API requests/responses

        extra_kwargs = {"password": {"write_only": True}}
        # Password can be sent TO the API but will never be returned IN responses (security)

    def create(self, validated_data):
        # Custom method to handle user creation with proper password hashing
        user = User.objects.create_user(**validated_data)
        # create_user() automatically hashes the password before saving to database
        return user


class TakeReasonSerializer(serializers.ModelSerializer):
    """
    Serializer for TakeReason model.
    Returns reason data for dropdown population in frontend.
    """
    class Meta:
        model = TakeReason
        fields = ['id', 'reason_name', 'applies_to']
