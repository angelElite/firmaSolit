from django.contrib import admin
from .models import Material, Acabado, Unidad, CanalVenta, Prioridad

admin.site.register(Material)
admin.site.register(Acabado)
admin.site.register(Unidad)
admin.site.register(CanalVenta)
admin.site.register(Prioridad)
