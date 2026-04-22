from rest_framework.permissions import BasePermission

def is_admin(user):
    """
    Helper function to check if user is
    in the admin group or is a Django superuser.
    Superusers always have full access.
    """
    return user.is_superuser or user.groups.filter(name='admin').exists()

class HasGiftsAccess(BasePermission):
    """
    Allows access to users in 'gifts_access'
    or 'admin' group.
    Gifts is accessible to all assigned staff.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (
                is_admin(request.user) or
                request.user.groups.filter(name='gifts_access').exists()
            )
        )

class HasApparelAccess(BasePermission):
    """
    Allows access to users in 'apparel_access'
    or 'admin' group only.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (
                is_admin(request.user) or
                request.user.groups.filter(name='apparel_access').exists()
            )
        )

class HasExecutiveAccess(BasePermission):
    """
    Allows access to users in 'executive_access'
    or 'admin' group only.
    Restricted to designated staff.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (
                is_admin(request.user) or
                request.user.groups.filter(name='executive_access').exists()
            )
        )

class HasITAccess(BasePermission):
    """
    Allows access to users in 'it_access'
    or 'admin' group only.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (
                is_admin(request.user) or
                request.user.groups.filter(name='it_access').exists()
            )
        )

class IsAdminUser(BasePermission):
    """
    Allows access to admin group or
    Django superusers only.
    Used for dashboard and management features.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            is_admin(request.user)
        )
