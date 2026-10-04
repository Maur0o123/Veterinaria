import { useState } from "react";
import api, { mensajeError } from "../api";
import { ESPECIES, ESTADOS, etiquetaFecha } from "../utils";

export default function GestionCita({ cita, onGuardado, onCancelar }) {
  const [estado, setEstado] = useState(cita.estado);
  const [notas, setNotas] = useState(cita.notas_admin);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const opciones = cita.estado === "confirmada" ? Object.keys(ESTADOS) : [cita.estado];

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await api.patch(`/panel/citas/${cita.id}/`, { estado, notas_admin: notas });
      onGuardado();
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="detalle">
        <p><strong>{cita.hora}</strong> · {etiquetaFecha(cita.fecha)}</p>
        <p>
          <span>Mascota:</span> {cita.mascota.nombre} ({ESPECIES[cita.mascota.especie]})
        </p>
        <p><span>Cliente:</span> {cita.cliente.nombre}</p>
        <p><span>Email:</span> {cita.cliente.email}</p>
        <p><span>Teléfono:</span> {cita.cliente.telefono || "—"}</p>
        <p><span>Motivo:</span> {cita.motivo}</p>
      </div>

      <label className="field">
        <span>Estado</span>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          {opciones.map((valor) => (
            <option key={valor} value={valor}>{ESTADOS[valor]}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Notas internas</span>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={1000} />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="modal-acciones">
        <button type="button" className="btn outline" onClick={onCancelar}>Cerrar</button>
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}