from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'descripcion', 'material', 'acabado', 'unidad',
            'cantidad', 'precio_unitario', 'subtotal', 'notas', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_pedido = serializers.ReadOnlyField()
    total_pagado = serializers.ReadOnlyField()
    saldo_pendiente = serializers.ReadOnlyField()
    client_nombre = serializers.CharField(source='client.nombre', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'folio', 'client', 'client_nombre', 'canal_venta', 'prioridad',
            'status', 'fecha_entrega_estimada', 'notas',
            'total_pedido', 'total_pagado', 'saldo_pendiente',
            'items', 'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'folio', 'created_at', 'updated_at', 'created_by']


class OrderStatusChangeSerializer(serializers.Serializer):
    nuevo_status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    comentario = serializers.CharField(required=False, allow_blank=True)

    def validate_nuevo_status(self, value):
        order = self.context.get('order')
        if order and not order.can_transition_to(value):
            raise ValidationError(
                f'No se puede cambiar de "{order.status}" a "{value}".'
            )
        return value
