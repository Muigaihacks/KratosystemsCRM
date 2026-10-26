from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PipelineStatsView

urlpatterns = [
    path("stats/", PipelineStatsView.as_view(), name="pipeline-stats"),
]
