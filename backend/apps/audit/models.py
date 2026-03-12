from django.db import models
from django.conf import settings


class OrderHistory(models.Model):
    order = models.ForeignKey(
        'orders.Order', on_delete=models.CASCADE, related_name='history'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='order_history'
    )
    status_anterior = models.CharField(max_length=20)
    status_nuevo = models.CharField(max_length=20)
    comentario = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Historial de Pedido'
        verbose_name_plural = 'Historial de Pedidos'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.order} | {self.status_anterior} → {self.status_nuevo}'
