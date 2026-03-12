from django.contrib import admin
from .models import OrderHistory


@admin.register(OrderHistory)
class OrderHistoryAdmin(admin.ModelAdmin):
    list_display = ['order', 'user', 'status_anterior', 'status_nuevo', 'created_at']
    list_filter = ['status_nuevo']
    search_fields = ['order__folio']
    readonly_fields = ['order', 'user', 'status_anterior', 'status_nuevo', 'created_at']
