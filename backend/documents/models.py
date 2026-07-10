from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator


# Belt-and-braces check on the browser-reported MIME type. FileExtensionValidator
# below already blocks anything not named *.pdf; this catches a renamed
# non-PDF file that slipped past the extension check.
def validate_pdf_mime_type(file):
    content_type = getattr(file, 'content_type', None)
    if content_type and content_type != 'application/pdf':
        raise ValidationError('Only PDF files are allowed.')


# Document is a shared file attachment that can hang off ANY inventory model
# (Gift, ApparelProduct, OfficeItem, MiscellaneousItem, and future ones) via
# Django's generic relation pattern, instead of needing a separate document
# model + FK per inventory app.
#
# content_type + object_id together identify the attached record; content_object
# is the convenience accessor that resolves to the actual instance.
class Document(models.Model):
    file = models.FileField(
        upload_to='documents/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf']), validate_pdf_mime_type],
        help_text="The uploaded PDF file"
    )

    original_filename = models.CharField(
        max_length=255,
        help_text="Original filename as uploaded, preserved even if storage renames the file"
    )

    # Generic relation — content_type identifies which inventory model this
    # document belongs to, object_id is the PK of that record.
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents_uploaded',
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Document"
        verbose_name_plural = "Documents"

    def __str__(self):
        return self.original_filename
