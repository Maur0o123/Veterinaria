import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Foto from "../components/Foto";
import Reveal from "../components/Reveal";
import { clinica } from "../data/clinica";

export default function Inicio() {
  const { user } = useAuth();
  const destinoCita = user ? "/citas" : "/registro";
  const { imagenes } = clinica;

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <Reveal><p className="eyebrow">Clínica veterinaria</p></Reveal>
              <Reveal delay={100}>
                <h1>Cuidamos a quien <span className="accent">más quieres</span>.</h1>
              </Reveal>
              <Reveal delay={200}><p className="lead">{clinica.slogan}</p></Reveal>
              <Reveal delay={300}>
                <div className="hero-actions">
                  <Link className="btn" to={destinoCita}>Agendar una cita</Link>
                  <Link className="btn outline" to="/#servicios">Ver servicios</Link>
                </div>
              </Reveal>
            </div>

            <Reveal direction="right" delay={200} className="hero-foto">
              <Foto {...imagenes.hero} className="alta" eager />
            </Reveal>
          </div>

          <ul className="stats">
            {clinica.estadisticas.map((s, i) => (
              <Reveal as="li" key={s.etiqueta} delay={i * 120}>
                <strong>{s.valor}</strong>
                <span>{s.etiqueta}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="especies">
        <div className="container">
          <Reveal>
            <p className="especies-titulo">Atendemos a</p>
            <ul className="chips">
              {clinica.especies.map((e) => (
                <li key={e.nombre}>
                  <span aria-hidden="true">{e.emoji}</span>
                  {e.nombre}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section id="servicios" className="seccion">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Servicios</p>
            <h2>Todo lo que tu mascota necesita</h2>
          </Reveal>
          <div className="grid">
            {clinica.servicios.map((s, i) => (
              <Reveal key={s.titulo} delay={(i % 3) * 100}>
                <article className="tile">
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{s.titulo}</h3>
                  <p>{s.texto}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion alt-bg">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Nuestros pacientes</p>
            <h2>Cada mascota, una historia</h2>
          </Reveal>
          <div className="galeria">
            {imagenes.galeria.map((img, i) => (
              <Reveal key={img.src} delay={(i % 3) * 100}>
                <Foto {...img} className="cuadrada" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="nosotros" className="seccion">
        <div className="container dos-col">
          <Reveal direction="left">
            <Foto {...imagenes.nosotros} />
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow">Nosotros</p>
              <h2>Medicina veterinaria con trato cercano</h2>
              <p className="lead">
                Combinamos experiencia clínica con un trato humano, para que tú y tu mascota se
                sientan tranquilos en cada visita.
              </p>
            </Reveal>
            <ul className="motivos">
              {clinica.motivos.map((m, i) => (
                <Reveal as="li" key={m.titulo} delay={i * 120}>
                  <strong>{m.titulo}</strong>
                  <p>{m.texto}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="contacto" className="seccion alt-bg">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Contacto</p>
            <h2>Visítanos o escríbenos</h2>
          </Reveal>
          <div className="grid">
            <Reveal>
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
            </Reveal>
            <Reveal delay={100}>
              <article className="tile">
                <h3>Dónde estamos</h3>
                <p>{clinica.direccion}</p>
              </article>
            </Reveal>
            <Reveal delay={200}>
              <article className="tile">
                <h3>Hablemos</h3>
                <p><a href={`tel:${clinica.telefono.replace(/\s/g, "")}`}>{clinica.telefono}</a></p>
                <p><a href={`mailto:${clinica.email}`}>{clinica.email}</a></p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <Reveal>
            <h2>¿Listo para agendar tu cita?</h2>
            <p className="lead">Crea tu cuenta y reserva en pocos minutos.</p>
            <Link className="btn" to={destinoCita}>Agendar ahora</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}