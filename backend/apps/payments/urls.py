from django.urls import path
from .views import OrderPaymentListCreateView

urlpatterns = [
    path('orders/<int:pk>/payments/', OrderPaymentListCreateView.as_view(), name='order_payment_list_create'),
]
