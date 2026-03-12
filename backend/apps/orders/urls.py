from django.urls import path
from .views import (
    OrderListCreateView, OrderRetrieveUpdateView, OrderChangeStatusView,
    OrderHistoryView, OrderItemListCreateView, OrderItemUpdateView,
)

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order_list_create'),
    path('<int:pk>/', OrderRetrieveUpdateView.as_view(), name='order_detail'),
    path('<int:pk>/change-status/', OrderChangeStatusView.as_view(), name='order_change_status'),
    path('<int:pk>/history/', OrderHistoryView.as_view(), name='order_history'),
    path('<int:pk>/items/', OrderItemListCreateView.as_view(), name='order_items'),
    path('items/<int:pk>/', OrderItemUpdateView.as_view(), name='order_item_detail'),
]
