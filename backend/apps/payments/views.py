from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from apps.orders.models import Order
from .models import Payment
from .serializers import PaymentSerializer


class OrderPaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(order_id=self.kwargs['pk'], activo=True)

    def perform_create(self, serializer):
        order = get_object_or_404(Order, pk=self.kwargs['pk'])
        serializer.save(order=order, registrado_por=self.request.user)
