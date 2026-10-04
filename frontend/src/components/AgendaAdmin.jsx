import { useEffect, useState } from "react";
import api, { mensajeError } from "../api";
import {
  ESPECIES, ESTADOS, claveFecha, etiquetaFecha, primerDiaDelMes, ultimoDiaDelMes,
} from "../utils";
import Calendario from "./Calendario";
import GestionCita from "./GestionCita";
import Modal from "./Modal";

export default function AgendaAdmin() {
  const [mes, setMes] = useState(() => primerDiaDelMes(new Date()));
  const [fecha, setFecha] = useState(() => claveFecha(new Date()));
  const [citas, setCitas] = useState([]);
  const [estado, setEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [q, setQ] = useState("");
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [gestion, setGestion] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    let cancelado = false;
    api
      .get("/panel/citas/", {
        params: {
          desde: claveFecha(primerDiaDelMes(mes)),
          hasta: claveFecha(ultimoDiaDelMes(mes)),
          estado: estado || undefined,
          search: q || undefined,
        },
      })
      .then((r) => {
        if (cancelado) return;
        setCitas(r.data);
        setError("");
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeError(err, "No se pudo cargar la agenda."));
      });
    return () => {
      cancelado = true;
    };
  }, [mes, estado, q, version]);

  const porDia = {};
  citas.forEach((c) => {
    (porDia[c.fecha] ||= []).push(c);
  });

  const marcas = {};
  Object.entries(porDia).forEach(([dia, lista]) => {
    const cantidad = estado ? lista.length : lista.filter((c) => c.estado !== "cancelada").length;
    if (cantidad > 0) marcas[dia] = cantidad;
  });

  const delDia = porDia[fecha] ?? [];

  const cambiarMes = (delta) =>
    setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));

  return (
    <div>
      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar por cliente, email o mascota"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>{etiqueta}</option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="dos-paneles">
        <Calendario
          mes={mes}
          onCambiarMes={cambiarMes}
          seleccionado={fecha}
          onSeleccionar={setFecha}
          marcas={marcas}
        />
        <div>
          <h3>{etiquetaFecha(fecha)}</h3>
          {delDia.length === 0 ? (
            <p className="sub">No hay citas este día.</p>
          ) : (
            <ul className="lista">
              {delDia.map((c) => (
                <li className="item" key={c.id}>
                  <div className="item-info">
                    <strong>
                      <span className="hora">{c.hora}</span> · {c.mascota.nombre} ({ESPECIES[c.mascota.especie]})
                    </strong>
                    <p>{c.cliente.nombre} · {c.motivo}</p>
                  </div>
                  <div className="item-acciones">
                    <span className={`badge ${c.estado === "confirmada" ? "ok" : c.estado === "cancelada" ? "off" : ""}`}>
                      {ESTADOS[c.estado]}
                    </span>
                    <button className="btn-link" onClick={() => setGestion(c)}>Gestionar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {gestion && (
        <Modal titulo="Gestionar cita" onCerrar={() => setGestion(null)}>
          <GestionCita
            cita={gestion}
            onCancelar={() => setGestion(null)}
            onGuardado={() => {
              setGestion(null);
              setVersion((v) => v + 1);
            }}
          />
        </Modal>
      )}
    </div>
  );
}