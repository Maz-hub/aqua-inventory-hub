from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """
    Extends Django's built-in User model with
    World Aquatics specific information.
    One profile is automatically created per user.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    department = models.CharField(
        max_length=100,
        blank=True,
        help_text="User's World Aquatics department"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} — {self.department}"

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
