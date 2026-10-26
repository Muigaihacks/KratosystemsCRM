from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientSessionViewSet

router = DefaultRouter()
router.register(r"", ClientSessionViewSet, basename="session")

urlpatterns = [path("", include(router.urls))]
