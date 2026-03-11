from django.db import models
from django.conf import settings
from apps.clients.models import Client
from apps.catalogs.models import Material, Acabado, Unidad, CanalVenta, Prioridad


class Order(models.Model):
    # Estados del pedido
    NUEVO = 'NUEVO'
    ANTICIPO_PENDIENTE = 'ANTICIPO_PENDIENTE'
    CONFIRMADO = 'CONFIRMADO'
    PROGRAMADO = 'PROGRAMADO'
    EN_PRODUCCION = 'EN_PRODUCCION'
    EN_ACABADO = 'EN_ACABADO'
    LISTO_ENTREGA = 'LISTO_ENTREGA'
    EN_RUTA = 'EN_RUTA'
    ENTREGADO = 'ENTREGADO'
    PAUSADO = 'PAUSADO'
    CANCELADO = 'CANCELADO'

    STATUS_CHOICES = [
        (NUEVO, 'Nuevo'),
        (ANTICIPO_PENDIENTE, 'Anticipo Pendiente'),
        (CONFIRMADO, 'Confirmado'),
        (PROGRAMADO, 'Programado'),
        (EN_PRODUCCION, 'En Producción'),
        (EN_ACABADO, 'En Acabado'),
        (LISTO_ENTREGA, 'Listo para Entrega'),
        (EN_RUTA, 'En Ruta'),
        (ENTREGADO, 'Entregado'),
        (PAUSADO, 'Pausado'),
        (CANCELADO, 'Cancelado'),
    ]

    # Transiciones válidas de estado
    VALID_TRANSITIONS = {
        NUEVO: [ANTICIPO_PENDIENTE, CONFIRMADO, CANCELADO],
        ANTICIPO_PENDIENTE: [CONFIRMADO, CANCELADO],
        CONFIRMADO: [PROGRAMADO, CANCELADO],
        PROGRAMADO: [EN_PRODUCCION, PAUSADO, CANCELADO],
        EN_PRODUCCION: [EN_ACABADO, PAUSADO, CANCELADO],
        EN_ACABADO: [LISTO_ENTREGA, PAUSADO, CANCELADO],
        LISTO_ENTREGA: [EN_RUTA, CANCELADO],
        EN_RUTA: [ENTREGADO],
        ENTREGADO: [],
        PAUSADO: [PROGRAMADO, CANCELADO],
        CANCELADO: [],
    }

    folio = models.CharField(max_length=20, unique=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='orders')
    canal_venta = models.ForeignKey(
        CanalVenta, on_delete=models.SET_NULL, null=True, blank=True
    )
    prioridad = models.ForeignKey(
        Prioridad, on_delete=models.SET_NULL, null=True, blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=NUEVO)
    fecha_entrega_estimada = models.DateField(null=True, blank=True)
    notas = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='orders_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'
        ordering = ['-created_at']

    def __str__(self):
        return f'Pedido {self.folio} - {self.client}'

    def save(self, *args, **kwargs):
        if not self.folio:
            last = Order.objects.order_by('-id').first()
            next_id = (last.id + 1) if last else 1
            self.folio = f'PED-{next_id:05d}'
        super().save(*args, **kwargs)

    @property
    def total_pedido(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def total_pagado(self):
        return sum(p.monto for p in self.payments.filter(activo=True))

    @property
    def saldo_pendiente(self):
        return self.total_pedido - self.total_pagado

    def can_transition_to(self, new_status):
        return new_status in self.VALID_TRANSITIONS.get(self.status, [])


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    descripcion = models.CharField(max_length=300)
    material = models.ForeignKey(
        Material, on_delete=models.SET_NULL, null=True, blank=True
    )
    acabado = models.ForeignKey(
        Acabado, on_delete=models.SET_NULL, null=True, blank=True
    )
    unidad = models.ForeignKey(
        Unidad, on_delete=models.SET_NULL, null=True, blank=True
    )
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    notas = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Item de Pedido'
        verbose_name_plural = 'Items de Pedido'

    def __str__(self):
        return f'{self.descripcion} ({self.order.folio})'

    @property
    def subtotal(self):
        return self.cantidad * self.precio_unitario
