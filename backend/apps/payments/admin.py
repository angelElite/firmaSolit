from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'monto', 'tipo', 'metodo', 'fecha_pago', 'activo']
    list_filter = ['tipo', 'metodo', 'activo']
    search_fields = ['order__folio']
