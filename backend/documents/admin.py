from django.contrib import admin
from documents.models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['original_filename', 'content_type', 'object_id', 'uploaded_by', 'uploaded_at']
    list_filter = ['content_type']
    search_fields = ['original_filename']
