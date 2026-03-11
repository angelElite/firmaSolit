from django.contrib import admin
from .models import Delivery


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['order', 'chofer', 'status', 'fecha_programada', 'fecha_entrega']
    list_filter = ['status']
    search_fields = ['order__folio']
