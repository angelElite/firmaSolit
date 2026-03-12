from django.db import models


class Material(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Material'
        verbose_name_plural = 'Materiales'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Acabado(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Acabado'
        verbose_name_plural = 'Acabados'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Unidad(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    abreviacion = models.CharField(max_length=10)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Unidad'
        verbose_name_plural = 'Unidades'
        ordering = ['nombre']

    def __str__(self):
        return f'{self.nombre} ({self.abreviacion})'


class CanalVenta(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Canal de Venta'
        verbose_name_plural = 'Canales de Venta'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Prioridad(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    orden = models.PositiveSmallIntegerField(default=0)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Prioridad'
        verbose_name_plural = 'Prioridades'
        ordering = ['orden']

    def __str__(self):
        return self.nombre
