from django.contrib import admin
from miscellaneous.models import MiscellaneousCategory, MiscellaneousItem, MiscellaneousTransaction

admin.site.register(MiscellaneousCategory)
admin.site.register(MiscellaneousItem)
admin.site.register(MiscellaneousTransaction)
