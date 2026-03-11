from django.db import models
from django.conf import settings
from apps.orders.models import Order


class Payment(models.Model):
    EFECTIVO = 'EFECTIVO'
    TRANSFERENCIA = 'TRANSFERENCIA'
    TARJETA = 'TARJETA'
    CHEQUE = 'CHEQUE'
    OTRO = 'OTRO'

    METODO_CHOICES = [
        (EFECTIVO, 'Efectivo'),
        (TRANSFERENCIA, 'Transferencia'),
        (TARJETA, 'Tarjeta'),
        (CHEQUE, 'Cheque'),
        (OTRO, 'Otro'),
    ]

    ANTICIPO = 'ANTICIPO'
    PARCIAL = 'PARCIAL'
    LIQUIDACION = 'LIQUIDACION'

    TIPO_CHOICES = [
        (ANTICIPO, 'Anticipo'),
        (PARCIAL, 'Parcial'),
        (LIQUIDACION, 'Liquidación'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    metodo = models.CharField(max_length=15, choices=METODO_CHOICES, default=EFECTIVO)
    tipo = models.CharField(max_length=12, choices=TIPO_CHOICES, default=PARCIAL)
    referencia = models.CharField(max_length=100, blank=True)
    fecha_pago = models.DateField()
    notas = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='payments_registered'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'
        ordering = ['-fecha_pago']

    def __str__(self):
        return f'Pago {self.monto} - {self.order.folio}'
