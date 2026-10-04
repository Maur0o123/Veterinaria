import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { clinica } from "../data/clinica";
import Logo from "./Logo";

const enlaces = [
  { to: "/", label: "Inicio" },
  { to: "/#servicios", label: "Servicios" },
  { to: "/#nosotros", label: "Nosotros" },
  { to: "/#contacto", label: "Contacto" },
];

export default function Navbar() {
  const { user, cargando, logout } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();
  const cerrar = () => setAbierto(false);

  const salir = async () => {
    cerrar();
    await logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={cerrar}>
          <Logo />
          <span>{clinica.nombre}</span>
        </Link>

        <button
          className="menu-toggle"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
        >
          <span /><span /><span />
        </button>

        <nav className={`nav ${abierto ? "abierto" : ""}`}>
          <ul>
            {enlaces.map((e) => (
              <li key={e.to}>
                <Link to={e.to} onClick={cerrar}>{e.label}</Link>
              </li>
            ))}
            {user?.rol === "admin" && (
              <>
                <li><Link to="/panel/calendario" onClick={cerrar}>Calendario</Link></li>
                <li><Link to="/panel/usuarios" onClick={cerrar}>Usuarios</Link></li>
              </>
            )}
          </ul>

          <div className="nav-actions">
            {!cargando && (user ? (
              <>
                <button className="btn-link" onClick={salir}>Salir</button>
                <Link className="btn sm" to="/citas" onClick={cerrar}>Agendar cita</Link>
              </>
            ) : (
              <>
                <Link className="btn-link" to="/login" onClick={cerrar}>Ingresar</Link>
                <Link className="btn sm" to="/registro" onClick={cerrar}>Crear cuenta</Link>
              </>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}