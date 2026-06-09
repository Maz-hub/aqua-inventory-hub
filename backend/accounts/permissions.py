from rest_framework.permissions import BasePermission

SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')


def is_admin(user):
    return user.is_superuser or user.groups.filter(name='admin').exists()


# HasGiftsAccess: read-only for gifts_viewer, full access for gifts_access or admin.
class HasGiftsAccess(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if is_admin(request.user):
            return True
        if request.user.groups.filter(name='gifts_access').exists():
            return True
        if request.method in SAFE_METHODS:
            return request.user.groups.filter(name='gifts_viewer').exists()
        return False


# HasApparelAccess: read-only for apparel_viewer, full access for apparel_access or admin.
class HasApparelAccess(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if is_admin(request.user):
            return True
        if request.user.groups.filter(name='apparel_access').exists():
            return True
        if request.method in SAFE_METHODS:
            return request.user.groups.filter(name='apparel_viewer').exists()
        return False


# HasExecutiveAccess: read-only for executive_viewer, full access for executive_access or admin.
class HasExecutiveAccess(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if is_admin(request.user):
            return True
        if request.user.groups.filter(name='executive_access').exists():
            return True
        if request.method in SAFE_METHODS:
            return request.user.groups.filter(name='executive_viewer').exists()
        return False


# HasITAccess: read-only for it_viewer, full access for it_access or admin.
class HasITAccess(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if is_admin(request.user):
            return True
        if request.user.groups.filter(name='it_access').exists():
            return True
        if request.method in SAFE_METHODS:
            return request.user.groups.filter(name='it_viewer').exists()
        return False


# HasOfficeAccess: read-only for office_viewer, full access for office_access or admin.
class HasOfficeAccess(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if is_admin(request.user):
            return True
        if request.user.groups.filter(name='office_access').exists():
            return True
        if request.method in SAFE_METHODS:
            return request.user.groups.filter(name='office_viewer').exists()
        return False


# IsAdminUser: admin group or superuser only — no viewer variant.
class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            is_admin(request.user)
        )
