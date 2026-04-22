from django.urls import path
from . import views

urlpatterns = [
    path("reasons/", views.TakeReasonList.as_view(), name="reason-list"),
    path("user/me/", views.CurrentUserView.as_view(), name="current-user"),
]
