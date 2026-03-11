from django.urls import path
from .views import OrderDeliveryView, CreateDeliveryView, MarkOutDeliveryView, MarkDeliveredView

urlpatterns = [
    path('orders/<int:pk>/delivery/', CreateDeliveryView.as_view(), name='create_delivery'),
    path('orders/<int:pk>/delivery/detail/', OrderDeliveryView.as_view(), name='order_delivery'),
    path('<int:pk>/mark-out/', MarkOutDeliveryView.as_view(), name='delivery_mark_out'),
    path('<int:pk>/mark-delivered/', MarkDeliveredView.as_view(), name='delivery_mark_delivered'),
]
