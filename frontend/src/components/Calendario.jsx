import { claveFecha } from "../utils";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function Calendario({
  mes,
  onCambiarMes,
  seleccionado,
  onSeleccionar,
  marcas = {},
  deshabilitado = () => false,
}) {
  const anio = mes.getFullYear();
  const numeroMes = mes.getMonth();
  const desfase = (new Date(anio, numeroMes, 1).getDay() + 6) % 7;
  const totalDias = new Date(anio, numeroMes + 1, 0).getDate();

  const celdas = [];
  for (let i = 0; i < desfase; i++) celdas.push(null);
  for (let d = 1; d <= totalDias; d++) celdas.push(new Date(anio, numeroMes, d));

  const titulo = mes.toLocaleDateString("es", { month: "long", year: "numeric" });

  return (
    <div className="calendario">
      <div className="calendario-cab">
        <button type="button" className="btn-link" onClick={() => onCambiarMes(-1)} aria-label="Mes anterior">‹</button>
        <strong>{titulo}</strong>
        <button type="button" className="btn-link" onClick={() => onCambiarMes(1)} aria-label="Mes siguiente">›</button>
      </div>
      <div className="calendario-grid">
        {DIAS.map((d) => (
          <span key={d} className="cal-dia-nombre">{d}</span>
        ))}
        {celdas.map((fecha, i) => {
          if (!fecha) return <span key={`vacio-${i}`} />;
          const clave = claveFecha(fecha);
          const marca = marcas[clave];
          return (
            <button
              key={clave}
              type="button"
              className={`cal-dia ${seleccionado === clave ? "sel" : ""}`}
              disabled={deshabilitado(fecha)}
              onClick={() => onSeleccionar(clave)}
            >
              <span>{fecha.getDate()}</span>
              {marca ? <small>{marca}</small> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}