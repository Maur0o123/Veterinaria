import { useState } from "react";
import api, { mensajeError } from "../api";
import { ESTADOS, etiquetaFecha } from "../utils";

function Fila({ cita, onCancelar }) {
  return (
    <li className="item">
      <div className="item-info">
        <strong>
          <span className="hora">{cita.hora}</span> · {etiquetaFecha(cita.fecha)}
        </strong>
        <p>{cita.mascota.nombre} · {cita.motivo}</p>
      </div>
      <div className="item-acciones">
        <span className={`badge ${cita.estado === "confirmada" ? "ok" : ""}`}>
          {ESTADOS[cita.estado]}
        </span>
        {cita.puede_cancelar && (
          <button className="btn-link" onClick={() => onCancelar(cita)}>Cancelar</button>
        )}
      </div>
    </li>
  );
}

export default function MisCitas({ citas, onCambio }) {
  const [error, setError] = useState("");
  const proximas = citas.filter((c) => c.estado === "confirmada").reverse();
  const historial = citas.filter((c) => c.estado !== "confirmada");

  const cancelar = async (cita) => {
    if (!window.confirm("¿Seguro que quieres cancelar esta cita?")) return;
    try {
      await api.post(`/citas/${cita.id}/cancelar/`);
      setError("");
      onCambio();
    } catch (err) {
      setError(mensajeError(err, "No se pudo cancelar la cita."));
    }
  };

  return (
    <div className="bloque">
      <h2>Mis citas</h2>
      {error && <p className="error">{error}</p>}

      {proximas.length === 0 ? (
        <p className="sub">No tienes citas próximas.</p>
      ) : (
        <ul className="lista">
          {proximas.map((c) => (
            <Fila key={c.id} cita={c} onCancelar={cancelar} />
          ))}
        </ul>
      )}
      {proximas.some((c) => !c.puede_cancelar) && (
        <p className="nota">Para cambios de último minuto, contáctanos directamente.</p>
      )}

      {historial.length > 0 && (
        <>
          <h3 className="subtitulo">Historial</h3>
          <ul className="lista">
            {historial.map((c) => (
              <Fila key={c.id} cita={c} onCancelar={cancelar} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}