from rest_framework import serializers
from .models import Material, Acabado, Unidad, CanalVenta, Prioridad


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'


class AcabadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acabado
        fields = '__all__'


class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidad
        fields = '__all__'


class CanalVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanalVenta
        fields = '__all__'


class PrioridadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prioridad
        fields = '__all__'
