import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { clinica } from "../data/clinica";

export default function Inicio() {
  const { user } = useAuth();
  const destinoCita = user ? "/citas" : "/registro";

  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">Clínica veterinaria</p>
          <h1>
            Cuidamos a quien <span className="accent">más quieres</span>.
          </h1>
          <p className="lead">{clinica.slogan}</p>

          <div className="hero-actions">
            <Link className="btn" to={destinoCita}>Agendar una cita</Link>
            <Link className="btn outline" to="/#servicios">Ver servicios</Link>
          </div>

          <ul className="stats">
            {clinica.estadisticas.map((s) => (
              <li key={s.etiqueta}>
                <strong>{s.valor}</strong>
                <span>{s.etiqueta}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="servicios" className="seccion">
        <div className="container">
          <p className="eyebrow">Servicios</p>
          <h2>Todo lo que tu mascota necesita</h2>
          <div className="grid">
            {clinica.servicios.map((s, i) => (
              <article className="tile" key={s.titulo}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.titulo}</h3>
                <p>{s.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="nosotros" className="seccion alt-bg">
        <div className="container dos-col">
          <div>
            <p className="eyebrow">Nosotros</p>
            <h2>Medicina veterinaria con trato cercano</h2>
            <p className="lead">
              Combinamos experiencia clínica con un trato humano, para que tú y tu mascota se
              sientan tranquilos en cada visita.
            </p>
          </div>
          <ul className="motivos">
            {clinica.motivos.map((m) => (
              <li key={m.titulo}>
                <strong>{m.titulo}</strong>
                <p>{m.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contacto" className="seccion">
        <div className="container">
          <p className="eyebrow">Contacto</p>
          <h2>Visítanos o escríbenos</h2>
          <div className="grid">
            <article className="tile">
              <h3>Horarios</h3>
              <ul className="horarios">
                {clinica.horarios.map((h) => (
                  <li key={h.dias}>
                    <span>{h.dias}</span>
                    <span>{h.horas}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="tile">
              <h3>Dónde estamos</h3>
              <p>{clinica.direccion}</p>
            </article>
            <article className="tile">
              <h3>Hablemos</h3>
              <p><a href={`tel:${clinica.telefono.replace(/\s/g, "")}`}>{clinica.telefono}</a></p>
              <p><a href={`mailto:${clinica.email}`}>{clinica.email}</a></p>
            </article>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>¿Listo para agendar tu cita?</h2>
          <p className="lead">Crea tu cuenta y reserva en pocos minutos.</p>
          <Link className="btn" to={destinoCita}>Agendar ahora</Link>
        </div>
      </section>
    </>
  );
}