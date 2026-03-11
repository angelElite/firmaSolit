from django.db import models
from django.conf import settings
from apps.orders.models import Order


class Delivery(models.Model):
    PENDIENTE = 'PENDIENTE'
    EN_RUTA = 'EN_RUTA'
    ENTREGADO = 'ENTREGADO'
    FALLIDO = 'FALLIDO'

    STATUS_CHOICES = [
        (PENDIENTE, 'Pendiente'),
        (EN_RUTA, 'En Ruta'),
        (ENTREGADO, 'Entregado'),
        (FALLIDO, 'Fallido'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    chofer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='deliveries'
    )
    direccion_entrega = models.TextField()
    fecha_programada = models.DateField(null=True, blank=True)
    fecha_salida = models.DateTimeField(null=True, blank=True)
    fecha_entrega = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDIENTE)
    notas = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Entrega'
        verbose_name_plural = 'Entregas'
        ordering = ['-fecha_programada']

    def __str__(self):
        return f'Entrega {self.order.folio}'
