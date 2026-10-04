import { useState } from "react";
import AgendaAdmin from "../../components/AgendaAdmin";
import DisponibilidadAdmin from "../../components/DisponibilidadAdmin";

export default function CalendarioAdmin() {
  const [pestana, setPestana] = useState("agenda");

  return (
    <section className="seccion">
      <div className="container">
        <p className="eyebrow">Administración</p>
        <h1>Calendario</h1>

        <div className="pestanas" role="tablist">
          <button
            role="tab"
            aria-selected={pestana === "agenda"}
            className={pestana === "agenda" ? "activa" : ""}
            onClick={() => setPestana("agenda")}
          >
            Agenda
          </button>
          <button
            role="tab"
            aria-selected={pestana === "disponibilidad"}
            className={pestana === "disponibilidad" ? "activa" : ""}
            onClick={() => setPestana("disponibilidad")}
          >
            Disponibilidad
          </button>
        </div>

        {pestana === "agenda" ? <AgendaAdmin /> : <DisponibilidadAdmin />}
      </div>
    </section>
  );
}