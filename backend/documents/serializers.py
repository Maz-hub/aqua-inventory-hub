from rest_framework import serializers
from documents.models import Document


# DocumentSerializer is read-only — documents are created and deleted through
# dedicated view logic (see views.py) rather than standard serializer validation,
# since creation needs to resolve a content_type string identifier to an actual
# ContentType and target object.
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'file', 'original_filename', 'uploaded_at']
        read_only_fields = fields
