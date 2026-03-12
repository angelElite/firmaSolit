from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.orders.models import Order
from .models import Delivery
from .serializers import DeliverySerializer


class OrderDeliveryView(generics.RetrieveUpdateAPIView):
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Delivery, order_id=self.kwargs['pk'])


class CreateDeliveryView(generics.CreateAPIView):
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        order = get_object_or_404(Order, pk=self.kwargs['pk'])
        serializer.save(order=order)


class MarkOutDeliveryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        delivery = get_object_or_404(Delivery, pk=pk)
        delivery.status = Delivery.EN_RUTA
        delivery.fecha_salida = timezone.now()
        delivery.save()
        return Response(DeliverySerializer(delivery).data)


class MarkDeliveredView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        delivery = get_object_or_404(Delivery, pk=pk)
        delivery.status = Delivery.ENTREGADO
        delivery.fecha_entrega = timezone.now()
        delivery.save()
        return Response(DeliverySerializer(delivery).data)
