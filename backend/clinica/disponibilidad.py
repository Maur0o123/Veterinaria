from datetime import date, datetime, time, timedelta

from django.conf import settings
from django.utils import timezone

from .models import Bloqueo, Cita, Horario


def combinar_local(fecha, hora):
    return timezone.make_aware(datetime.combine(fecha, hora))


def _cargar(desde, hasta):
    inicio = combinar_local(desde, time.min)
    fin = combinar_local(hasta + timedelta(days=1), time.min)
    horarios = {}
    for horario in Horario.objects.filter(activo=True):
        horarios.setdefault(horario.dia_semana, []).append(horario)
    bloqueos = list(Bloqueo.objects.filter(inicio__lt=fin, fin__gt=inicio))
    ocupados = set(
        Cita.objects.filter(inicio__gte=inicio, inicio__lt=fin)
        .exclude(estado=Cita.Estado.CANCELADA)
        .values_list("inicio", flat=True)
    )
    return horarios, bloqueos, ocupados


def _bloques(fecha, horarios, bloqueos, ocupados, minimo):
    paso = timedelta(minutes=settings.CITA_DURACION_MINUTOS)
    libres = set()
    for horario in horarios.get(fecha.weekday(), []):
        actual = combinar_local(fecha, horario.hora_inicio)
        limite = combinar_local(fecha, horario.hora_fin)
        while actual + paso <= limite:
            fin = actual + paso
            bloqueado = any(actual < b.fin and fin > b.inicio for b in bloqueos)
            if actual >= minimo and actual not in ocupados and not bloqueado:
                libres.add(actual)
            actual = fin
    return sorted(libres)


def _limites():
    minimo = timezone.now() + timedelta(hours=settings.CITA_ANTICIPACION_HORAS)
    hoy = timezone.localdate()
    maximo = hoy + timedelta(days=settings.CITA_DIAS_MAXIMOS)
    return minimo, hoy, maximo


def slots_disponibles(fecha):
    minimo, hoy, maximo = _limites()
    if fecha < hoy or fecha > maximo:
        return []
    horarios, bloqueos, ocupados = _cargar(fecha, fecha)
    return _bloques(fecha, horarios, bloqueos, ocupados, minimo)


def resumen_mes(anio, mes):
    primero = date(anio, mes, 1)
    siguiente = date(anio + (mes == 12), mes % 12 + 1, 1)
    ultimo = siguiente - timedelta(days=1)
    minimo, hoy, maximo = _limites()
    horarios, bloqueos, ocupados = _cargar(primero, ultimo)
    resumen = {}
    dia = primero
    while dia <= ultimo:
        if hoy <= dia <= maximo:
            cantidad = len(_bloques(dia, horarios, bloqueos, ocupados, minimo))
            if cantidad:
                resumen[dia.isoformat()] = cantidad
        dia += timedelta(days=1)
    return resumen