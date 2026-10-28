from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/auth/token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("api/v1/users/", include("users.urls")),
    path("api/v1/projects/", include("projects.urls")),
    path("api/v1/messaging/", include("messaging.urls")),
    path("api/v1/reviews/", include("reviews.urls")),
    path("api/v1/notifications/", include("notifications.urls")),
    path("api/v1/admin/stats/", __import__("core.views", fromlist=["AdminStatsView"]).AdminStatsView.as_view(), name="admin-stats"),
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/v1/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/v1/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
