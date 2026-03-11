from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'empresa', 'email', 'telefono', 'activo']
    list_filter = ['activo']
    search_fields = ['nombre', 'empresa', 'email']
