from django.contrib import admin
from office.models import OfficeCategory, OfficeItem, OfficeTransaction

admin.site.register(OfficeCategory)
admin.site.register(OfficeItem)
admin.site.register(OfficeTransaction)
