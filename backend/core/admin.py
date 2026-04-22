from django.contrib import admin
from .models import TakeReason, Department

@admin.register(TakeReason)
class TakeReasonAdmin(admin.ModelAdmin):
    """
    Admin configuration for TakeReason model.
    Allows admin to manage standardised reasons
    for inventory transactions.
    """
    list_display = ['reason_name', 'applies_to', 'created_at']
    list_filter = ['applies_to']
    search_fields = ['reason_name']

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """
    Admin configuration for Department model.
    Allows admin to manage World Aquatics departments
    for budget tracking on Item Requests.
    """
    list_display = ['name', 'created_at']
    search_fields = ['name']
