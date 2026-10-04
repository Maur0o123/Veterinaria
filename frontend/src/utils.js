export const ESTADOS = {
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

export const ESPECIES = {
  perro: "Perro",
  gato: "Gato",
  conejo: "Conejo",
  ave: "Ave",
  otro: "Otro",
};

export const DIAS_SEMANA = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
];

export function claveFecha(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function claveMes(fecha) {
  return claveFecha(fecha).slice(0, 7);
}

export function fechaDesdeClave(clave) {
  const [anio, mes, dia] = clave.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function etiquetaFecha(clave) {
  return fechaDesdeClave(clave).toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function primerDiaDelMes(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

export function ultimoDiaDelMes(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
}