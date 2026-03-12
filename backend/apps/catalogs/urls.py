from django.urls import path
from .views import (
    MaterialListView, AcabadoListView, UnidadListView,
    CanalVentaListView, PrioridadListView,
)

urlpatterns = [
    path('materials/', MaterialListView.as_view(), name='material_list'),
    path('acabados/', AcabadoListView.as_view(), name='acabado_list'),
    path('unidades/', UnidadListView.as_view(), name='unidad_list'),
    path('canales/', CanalVentaListView.as_view(), name='canal_list'),
    path('prioridades/', PrioridadListView.as_view(), name='prioridad_list'),
]
