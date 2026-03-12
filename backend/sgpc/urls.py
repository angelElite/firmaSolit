"""
URL configuration for SGPC project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/deliveries/', include('apps.deliveries.urls')),
    path('api/catalogs/', include('apps.catalogs.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
