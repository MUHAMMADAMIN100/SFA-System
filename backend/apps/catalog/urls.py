from rest_framework.routers import DefaultRouter

from apps.users.views import ManagerViewSet

from .views import ProductViewSet, StoreViewSet

router = DefaultRouter()
router.register("stores", StoreViewSet, basename="store")
router.register("products", ProductViewSet, basename="product")
router.register("managers", ManagerViewSet, basename="manager")

urlpatterns = router.urls
