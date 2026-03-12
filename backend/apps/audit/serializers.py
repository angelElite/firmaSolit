from rest_framework import serializers
from .models import OrderHistory


class OrderHistorySerializer(serializers.ModelSerializer):
    user_nombre = serializers.CharField(source='user.nombre', read_only=True)

    class Meta:
        model = OrderHistory
        fields = [
            'id', 'order', 'user', 'user_nombre',
            'status_anterior', 'status_nuevo', 'comentario', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
