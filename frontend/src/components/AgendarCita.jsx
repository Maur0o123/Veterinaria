import { useEffect, useState } from "react";
import api, { mensajeError } from "../api";
import { ESPECIES, claveFecha, claveMes, etiquetaFecha, primerDiaDelMes } from "../utils";
import Calendario from "./Calendario";
import Campo from "./Campo";

export default function AgendarCita({ mascotas, onAgendada }) {
  const [mes, setMes] = useState(() => primerDiaDelMes(new Date()));
  const [dias, setDias] = useState({});
  const [fecha, setFecha] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [inicio, setInicio] = useState("");
  const [mascota, setMascota] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [version, setVersion] = useState(0);

  const mascotaElegida = mascota || (mascotas[0] ? String(mascotas[0].id) : "");

  useEffect(() => {
    let cancelado = false;
    api
      .get("/citas/disponibilidad/", { params: { mes: claveMes(mes) } })
      .then((r) => !cancelado && setDias(r.data))
      .catch((err) => !cancelado && setError(mensajeError(err, "No se pudo cargar la disponibilidad.")));
    return () => {
      cancelado = true;
    };
  }, [mes, version]);

  useEffect(() => {
    if (!fecha) return;
    let cancelado = false;
    api
      .get("/citas/disponibilidad/", { params: { fecha } })
      .then((r) => !cancelado && setHorarios(r.data))
      .catch((err) => !cancelado && setError(mensajeError(err, "No se pudieron cargar los horarios.")));
    return () => {
      cancelado = true;
    };
  }, [fecha, version]);

  const cambiarMes = (delta) =>
    setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));

  const seleccionarFecha = (clave) => {
    setFecha(clave);
    setInicio("");
    setError("");
    setExito("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setEnviando(true);
    try {
      await api.post("/citas/", { mascota: mascotaElegida, inicio, motivo });
      setExito("¡Tu cita quedó confirmada!");
      setInicio("");
      setMotivo("");
      onAgendada();
    } catch (err) {
      setError(mensajeError(err, "No se pudo agendar la cita."));
    } finally {
      setEnviando(false);
      setVersion((v) => v + 1);
    }
  };

  return (
    <div className="bloque">
      <h2>Agendar una cita</h2>
      <div className="dos-paneles">
        <Calendario
          mes={mes}
          onCambiarMes={cambiarMes}
          seleccionado={fecha}
          onSeleccionar={seleccionarFecha}
          marcas={dias}
          deshabilitado={(d) => !dias[claveFecha(d)]}
        />
        <div>
          {!fecha && <p className="sub">Elige un día con horarios disponibles.</p>}
          {fecha && (
            <>
              <h3>{etiquetaFecha(fecha)}</h3>
              {horarios.length === 0 ? (
                <p className="sub">No quedan horarios disponibles este día.</p>
              ) : (
                <div className="slots">
                  {horarios.map((h) => (
                    <button
                      key={h.inicio}
                      type="button"
                      className={`slot ${inicio === h.inicio ? "sel" : ""}`}
                      onClick={() => setInicio(h.inicio)}
                    >
                      {h.hora}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {inicio && mascotas.length === 0 && (
            <p className="sub">Primero registra a tu mascota en la sección «Mis mascotas».</p>
          )}

          {inicio && mascotas.length > 0 && (
            <form onSubmit={onSubmit}>
              <label className="field">
                <span>Mascota</span>
                <select value={mascotaElegida} onChange={(e) => setMascota(e.target.value)}>
                  {mascotas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} · {ESPECIES[m.especie]}
                    </option>
                  ))}
                </select>
              </label>
              <Campo
                label="Motivo de la consulta"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={200}
                required
              />
              <button className="btn" type="submit" disabled={enviando}>
                {enviando ? "Agendando..." : "Confirmar cita"}
              </button>
            </form>
          )}

          {error && <p className="error">{error}</p>}
          {exito && <p className="exito">{exito}</p>}
        </div>
      </div>
    </div>
  );
}