from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['folio', 'client', 'status', 'fecha_entrega_estimada', 'created_at']
    list_filter = ['status']
    search_fields = ['folio', 'client__nombre']
    inlines = [OrderItemInline]
    readonly_fields = ['folio', 'created_at', 'updated_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'descripcion', 'cantidad', 'precio_unitario', 'subtotal']
    readonly_fields = ['subtotal']
