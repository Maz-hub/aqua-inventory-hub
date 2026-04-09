from django.urls import path
from . import views

urlpatterns = [
    path("reasons/", views.TakeReasonList.as_view(), name="reason-list"),
]
