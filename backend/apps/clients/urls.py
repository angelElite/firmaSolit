from django.urls import path
from .views import ClientListCreateView, ClientRetrieveUpdateView

urlpatterns = [
    path('', ClientListCreateView.as_view(), name='client_list_create'),
    path('<int:pk>/', ClientRetrieveUpdateView.as_view(), name='client_detail'),
]
