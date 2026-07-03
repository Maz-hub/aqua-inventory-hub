from django.urls import path
from . import views

urlpatterns = [
    path("microsoft/", views.MicrosoftLoginView.as_view(), name="microsoft-login"),
]
