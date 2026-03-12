from rest_framework import generics, permissions
from .models import Material, Acabado, Unidad, CanalVenta, Prioridad
from .serializers import (
    MaterialSerializer, AcabadoSerializer, UnidadSerializer,
    CanalVentaSerializer, PrioridadSerializer,
)


class MaterialListView(generics.ListCreateAPIView):
    queryset = Material.objects.filter(activo=True)
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]


class AcabadoListView(generics.ListCreateAPIView):
    queryset = Acabado.objects.filter(activo=True)
    serializer_class = AcabadoSerializer
    permission_classes = [permissions.IsAuthenticated]


class UnidadListView(generics.ListCreateAPIView):
    queryset = Unidad.objects.filter(activo=True)
    serializer_class = UnidadSerializer
    permission_classes = [permissions.IsAuthenticated]


class CanalVentaListView(generics.ListCreateAPIView):
    queryset = CanalVenta.objects.filter(activo=True)
    serializer_class = CanalVentaSerializer
    permission_classes = [permissions.IsAuthenticated]


class PrioridadListView(generics.ListCreateAPIView):
    queryset = Prioridad.objects.filter(activo=True)
    serializer_class = PrioridadSerializer
    permission_classes = [permissions.IsAuthenticated]
