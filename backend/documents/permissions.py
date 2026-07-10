from rest_framework.permissions import BasePermission

# Documents attach to items across every inventory module, so access mirrors
# the admin panel as a whole rather than any single category: any manager
# group, or admin/superuser. There is no read-only viewer tier — uploading
# and managing documents is an admin-panel-level feature.
MANAGER_GROUPS = [
    'gifts_access',
    'apparel_access',
    'office_access',
    'misc_access',
    'executive_access',
    'it_access',
]


class HasDocumentAccess(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.groups.filter(name='admin').exists():
            return True
        return request.user.groups.filter(name__in=MANAGER_GROUPS).exists()
