import { Link } from "react-router-dom";
import { clinica } from "../data/clinica";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand">
              <Logo size={24} />
              <span>{clinica.nombre}</span>
            </Link>
            <p className="footer-text">{clinica.slogan}</p>
          </div>

          <div>
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/#servicios">Servicios</Link></li>
              <li><Link to="/#nosotros">Nosotros</Link></li>
              <li><Link to="/#contacto">Contacto</Link></li>
              <li><Link to="/registro">Crear cuenta</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contacto</h4>
            <ul>
              <li><a href={`tel:${clinica.telefono.replace(/\s/g, "")}`}>{clinica.telefono}</a></li>
              <li><a href={`mailto:${clinica.email}`}>{clinica.email}</a></li>
              <li>{clinica.direccion}</li>
            </ul>
          </div>
        </div>

        <p className="footer-bottom">
          © {new Date().getFullYear()} {clinica.nombre}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}