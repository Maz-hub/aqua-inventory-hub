from django.urls import path
from . import views

urlpatterns = [
    # GET documents for an item (?content_type=&object_id=) / POST upload a new document
    path("", views.DocumentListCreate.as_view(), name="document-list-create"),

    # DELETE a specific document by ID
    path("delete/<int:pk>/", views.DocumentDelete.as_view(), name="delete-document"),
]
