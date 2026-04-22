from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from .models import UserProfile

class UserProfileInline(admin.StackedInline):
    """
    Displays UserProfile fields directly inside
    the User admin page — no need to manage
    them separately.
    """
    model = UserProfile
    can_delete = False
    verbose_name = "Profile"
    verbose_name_plural = "Profile"
    fields = ['department']

class CustomUserAdmin(UserAdmin):
    """
    Extends Django's default User admin to include
    the UserProfile inline and show key fields
    in the user list view.
    """
    inlines = [UserProfileInline]
    list_display = [
        'username',
        'email',
        'first_name',
        'last_name',
        'is_staff',
        'get_department'
    ]

    def get_department(self, obj):
        try:
            return obj.profile.department
        except UserProfile.DoesNotExist:
            return ''
    get_department.short_description = 'Department'

# Unregister the default User admin
# and replace with our custom version
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
