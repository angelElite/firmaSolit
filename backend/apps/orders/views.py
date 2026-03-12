from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer, OrderStatusChangeSerializer
from apps.audit.models import OrderHistory


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['folio', 'client__nombre']
    ordering_fields = ['created_at', 'status', 'fecha_entrega_estimada']

    def get_queryset(self):
        queryset = Order.objects.select_related('client', 'canal_venta', 'prioridad')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class OrderRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.select_related('client', 'canal_venta', 'prioridad').prefetch_related('items', 'payments')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrderChangeStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderStatusChangeSerializer(
            data=request.data, context={'order': order}
        )
        serializer.is_valid(raise_exception=True)
        old_status = order.status
        new_status = serializer.validated_data['nuevo_status']
        comentario = serializer.validated_data.get('comentario', '')
        order.status = new_status
        order.save()
        OrderHistory.objects.create(
            order=order,
            user=request.user,
            status_anterior=old_status,
            status_nuevo=new_status,
            comentario=comentario,
        )
        return Response(OrderSerializer(order).data)


class OrderHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        from apps.audit.models import OrderHistory
        from apps.audit.serializers import OrderHistorySerializer
        history = OrderHistory.objects.filter(order=order).order_by('-created_at')
        return Response(OrderHistorySerializer(history, many=True).data)


class OrderItemListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order_id=self.kwargs['pk'])

    def perform_create(self, serializer):
        order = get_object_or_404(Order, pk=self.kwargs['pk'])
        serializer.save(order=order)


class OrderItemUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]
