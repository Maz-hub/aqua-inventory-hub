from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType

from documents.models import Document
from documents.serializers import DocumentSerializer
from documents.permissions import HasDocumentAccess

from gifts.models import Gift
from apparel.models import ApparelProduct
from office.models import OfficeItem
from miscellaneous.models import MiscellaneousItem


# Maps the string identifier used by the frontend/API to the actual model class.
# New inventory modules just need one line added here to support documents.
CONTENT_TYPE_MODELS = {
    'gift': Gift,
    'apparel': ApparelProduct,
    'office': OfficeItem,
    'miscellaneous': MiscellaneousItem,
}


# ============================================
# DOCUMENT VIEWS
# ============================================

# Lists documents for a given item, or uploads a new one.
# GET  /api/documents/?content_type=gift&object_id=5  - lists documents attached to that item.
# POST /api/documents/  - uploads a new PDF and attaches it to the given item.
#
# content_type here is the string identifier (e.g. 'gift', 'office'), not a
# ContentType PK — it's resolved against CONTENT_TYPE_MODELS.
class DocumentListCreate(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [HasDocumentAccess]

    def get_queryset(self):
        content_type_key = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')

        queryset = Document.objects.all()

        if content_type_key:
            model_class = CONTENT_TYPE_MODELS.get(content_type_key)
            if not model_class:
                return Document.objects.none()
            queryset = queryset.filter(content_type=ContentType.objects.get_for_model(model_class))

        if object_id:
            queryset = queryset.filter(object_id=object_id)

        return queryset

    # Creation is handled manually rather than through the serializer because
    # the incoming payload (file, content_type identifier, object_id) doesn't
    # map directly onto Document's fields — content_type needs to be resolved
    # from a string to an actual ContentType, and the target object needs to
    # be validated to exist before we attach anything to it.
    def create(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        content_type_key = request.data.get('content_type')
        object_id = request.data.get('object_id')

        if not uploaded_file:
            return Response(
                {"error": "A file is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not content_type_key or not object_id:
            return Response(
                {"error": "content_type and object_id are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        model_class = CONTENT_TYPE_MODELS.get(content_type_key)
        if not model_class:
            return Response(
                {"error": f"Unknown content_type '{content_type_key}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # PDF-only restriction — checked here (in addition to the model-level
        # validators) so a bad upload is rejected with a clear error before
        # anything is written to storage or the database.
        if not uploaded_file.name.lower().endswith('.pdf'):
            return Response(
                {"error": "Only PDF files are allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        file_content_type = getattr(uploaded_file, 'content_type', None)
        if file_content_type and file_content_type != 'application/pdf':
            return Response(
                {"error": "Only PDF files are allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_object = model_class.objects.get(pk=object_id)
        except model_class.DoesNotExist:
            return Response(
                {"error": f"No {content_type_key} found with id {object_id}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        document = Document.objects.create(
            file=uploaded_file,
            original_filename=uploaded_file.name,
            content_type=ContentType.objects.get_for_model(model_class),
            object_id=target_object.pk,
            uploaded_by=request.user,
        )

        serializer = self.get_serializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Deletes a specific document by ID.
# DELETE /api/documents/delete/{id}/
class DocumentDelete(generics.DestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [HasDocumentAccess]
    queryset = Document.objects.all()
