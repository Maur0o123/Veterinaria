import { useEffect, useState } from "react";
import api, { mensajeError } from "../api";
import { DIAS_SEMANA } from "../utils";
import Campo from "./Campo";

const formularioHorario = { dias: [0, 1, 2, 3, 4], hora_inicio: "09:00", hora_fin: "18:00" };
const formularioBloqueo = { inicio: "", fin: "", motivo: "" };

const formatear = (iso) =>
  new Date(iso).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" });

export default function DisponibilidadAdmin() {
  const [horarios, setHorarios] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [nuevo, setNuevo] = useState(formularioHorario);
  const [bloqueo, setBloqueo] = useState(formularioBloqueo);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");

  const recargar = () => setVersion((v) => v + 1);

  useEffect(() => {
    let cancelado = false;
    Promise.all([api.get("/panel/horarios/"), api.get("/panel/bloqueos/")])
      .then(([h, b]) => {
        if (cancelado) return;
        setHorarios(h.data);
        setBloqueos(b.data);
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeError(err, "No se pudo cargar la disponibilidad."));
      });
    return () => {
      cancelado = true;
    };
  }, [version]);

  const alternarDia = (dia) =>
    setNuevo({
      ...nuevo,
      dias: nuevo.dias.includes(dia) ? nuevo.dias.filter((d) => d !== dia) : [...nuevo.dias, dia],
    });

  const agregarHorario = async (e) => {
    e.preventDefault();
    setError("");
    if (nuevo.dias.length === 0) return setError("Elige al menos un día.");
    try {
      await Promise.all(
        nuevo.dias.map((dia) =>
          api.post("/panel/horarios/", {
            dia_semana: dia,
            hora_inicio: nuevo.hora_inicio,
            hora_fin: nuevo.hora_fin,
          })
        )
      );
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar el horario."));
    }
    recargar();
  };

  const alternarHorario = async (h) => {
    try {
      await api.patch(`/panel/horarios/${h.id}/`, { activo: !h.activo });
      recargar();
    } catch (err) {
      setError(mensajeError(err, "No se pudo actualizar el horario."));
    }
  };

  const eliminarHorario = async (h) => {
    if (!window.confirm("¿Eliminar este horario?")) return;
    try {
      await api.delete(`/panel/horarios/${h.id}/`);
      recargar();
    } catch (err) {
      setError(mensajeError(err, "No se pudo eliminar el horario."));
    }
  };

  const agregarBloqueo = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/panel/bloqueos/", bloqueo);
      setBloqueo(formularioBloqueo);
      recargar();
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar el bloqueo."));
    }
  };

  const eliminarBloqueo = async (b) => {
    if (!window.confirm("¿Quitar este bloqueo?")) return;
    try {
      await api.delete(`/panel/bloqueos/${b.id}/`);
      recargar();
    } catch (err) {
      setError(mensajeError(err, "No se pudo quitar el bloqueo."));
    }
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}

      <div className="bloque primero">
        <h2>Horario semanal</h2>
        <p className="sub">Los clientes solo podrán reservar dentro de estos horarios.</p>

        {horarios.length > 0 && (
          <ul className="lista">
            {horarios.map((h) => (
              <li className="item" key={h.id}>
                <div className="item-info">
                  <strong>
                    {DIAS_SEMANA[h.dia_semana]} · {h.hora_inicio.slice(0, 5)} – {h.hora_fin.slice(0, 5)}
                  </strong>
                </div>
                <div className="item-acciones">
                  <span className={`badge ${h.activo ? "ok" : "off"}`}>
                    {h.activo ? "Activo" : "Pausado"}
                  </span>
                  <button className="btn-link" onClick={() => alternarHorario(h)}>
                    {h.activo ? "Pausar" : "Activar"}
                  </button>
                  <button className="btn-link" onClick={() => eliminarHorario(h)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form className="form-inline" onSubmit={agregarHorario}>
          <div className="field">
            <span>Días</span>
            <div className="slots">
              {DIAS_SEMANA.map((nombre, i) => (
                <button
                  key={nombre}
                  type="button"
                  className={`slot ${nuevo.dias.includes(i) ? "sel" : ""}`}
                  onClick={() => alternarDia(i)}
                >
                  {nombre.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <Campo label="Desde" type="time" value={nuevo.hora_inicio}
                 onChange={(e) => setNuevo({ ...nuevo, hora_inicio: e.target.value })} required />
          <Campo label="Hasta" type="time" value={nuevo.hora_fin}
                 onChange={(e) => setNuevo({ ...nuevo, hora_fin: e.target.value })} required />
          <button className="btn" type="submit">Agregar horario</button>
        </form>
      </div>

      <div className="bloque">
        <h2>Días y horas bloqueados</h2>
        <p className="sub">Vacaciones, feriados o ausencias. Nadie podrá reservar en ese período.</p>

        {bloqueos.length > 0 && (
          <ul className="lista">
            {bloqueos.map((b) => (
              <li className="item" key={b.id}>
                <div className="item-info">
                  <strong>{formatear(b.inicio)} → {formatear(b.fin)}</strong>
                  <p>
                    {b.motivo || "Sin motivo"}
                    {b.citas_afectadas > 0 &&
                      ` · ${b.citas_afectadas} cita(s) ya agendada(s) en este período: cancélalas desde la Agenda`}
                  </p>
                </div>
                <button className="btn-link" onClick={() => eliminarBloqueo(b)}>Quitar</button>
              </li>
            ))}
          </ul>
        )}

        <form className="form-inline" onSubmit={agregarBloqueo}>
          <Campo label="Desde" type="datetime-local" value={bloqueo.inicio}
                 onChange={(e) => setBloqueo({ ...bloqueo, inicio: e.target.value })} required />
          <Campo label="Hasta" type="datetime-local" value={bloqueo.fin}
                 onChange={(e) => setBloqueo({ ...bloqueo, fin: e.target.value })} required />
          <Campo label="Motivo (opcional)" value={bloqueo.motivo} maxLength={120}
                 onChange={(e) => setBloqueo({ ...bloqueo, motivo: e.target.value })} />
          <button className="btn" type="submit">Bloquear</button>
        </form>
      </div>
    </div>
  );
}