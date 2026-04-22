from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import UserProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically creates a UserProfile when a new User is created.
    Triggered every time a User object is saved.
    Only runs on creation (not updates) thanks to the 'created' check.
    """
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Keeps UserProfile in sync whenever User is saved.
    Ensures profile always exists even if created externally (e.g. SSO).
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
