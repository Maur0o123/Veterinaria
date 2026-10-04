from datetime import timedelta

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone


class Mascota(models.Model):
    class Especie(models.TextChoices):
        PERRO = "perro", "Perro"
        GATO = "gato", "Gato"
        CONEJO = "conejo", "Conejo"
        AVE = "ave", "Ave"
        OTRO = "otro", "Otro"

    dueno = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mascotas"
    )
    nombre = models.CharField(max_length=60)
    especie = models.CharField(max_length=10, choices=Especie.choices)
    raza = models.CharField(max_length=60, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    creada = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return f"{self.nombre} ({self.get_especie_display()})"


class Horario(models.Model):
    class Dia(models.IntegerChoices):
        LUNES = 0, "Lunes"
        MARTES = 1, "Martes"
        MIERCOLES = 2, "Miércoles"
        JUEVES = 3, "Jueves"
        VIERNES = 4, "Viernes"
        SABADO = 5, "Sábado"
        DOMINGO = 6, "Domingo"

    dia_semana = models.PositiveSmallIntegerField(choices=Dia.choices)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ["dia_semana", "hora_inicio"]


class Bloqueo(models.Model):
    inicio = models.DateTimeField()
    fin = models.DateTimeField()
    motivo = models.CharField(max_length=120, blank=True)


class Cita(models.Model):
    class Estado(models.TextChoices):
        CONFIRMADA = "confirmada", "Confirmada"
        COMPLETADA = "completada", "Completada"
        CANCELADA = "cancelada", "Cancelada"
        NO_ASISTIO = "no_asistio", "No asistió"

    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="citas"
    )
    mascota = models.ForeignKey(Mascota, on_delete=models.PROTECT, related_name="citas")
    inicio = models.DateTimeField()
    fin = models.DateTimeField()
    motivo = models.CharField(max_length=200)
    estado = models.CharField(max_length=12, choices=Estado.choices, default=Estado.CONFIRMADA)
    notas_admin = models.TextField(blank=True)
    creada = models.DateTimeField(auto_now_add=True)
    actualizada = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["inicio"]
        constraints = [
            models.UniqueConstraint(
                fields=["inicio"],
                condition=Q(estado__in=["confirmada", "completada", "no_asistio"]),
                name="cita_unica_por_horario",
            )
        ]

    def cancelable_por_cliente(self):
        limite = timezone.now() + timedelta(hours=settings.CITA_CANCELACION_HORAS)
        return self.estado == self.Estado.CONFIRMADA and self.inicio >= limite