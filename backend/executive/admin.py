from django.contrib import admin
from executive.models import ExecutiveCategory, ExecutiveItem, ExecutiveTransaction

admin.site.register(ExecutiveCategory)
admin.site.register(ExecutiveItem)
admin.site.register(ExecutiveTransaction)
