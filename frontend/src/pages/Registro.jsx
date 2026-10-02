import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Campo from "../components/Campo";

const vacio = {
  first_name: "", last_name: "", email: "",
  telefono: "", password: "", password2: "",
};

export default function Registro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(vacio);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const msg = (campo) => [].concat(errores[campo] ?? []).join(" ");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      return setErrores({ password2: "Las contraseñas no coinciden." });
    }
    setErrores({});
    setEnviando(true);
    try {
      await registro(form);
      navigate("/");
    } catch (err) {
      setErrores(err.response?.data ?? { detail: "No se pudo completar el registro." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card">
      <h1>Crear cuenta</h1>
      <p className="sub">Regístrate para agendar citas para tu mascota.</p>
      <form onSubmit={onSubmit}>
        <div className="row">
          <Campo label="Nombre" name="first_name" autoComplete="given-name"
                 value={form.first_name} onChange={onChange} error={msg("first_name")} required />
          <Campo label="Apellido" name="last_name" autoComplete="family-name"
                 value={form.last_name} onChange={onChange} error={msg("last_name")} required />
        </div>
        <Campo label="Email" name="email" type="email" autoComplete="email"
               value={form.email} onChange={onChange} error={msg("email")} required />
        <Campo label="Teléfono" name="telefono" type="tel" autoComplete="tel"
               value={form.telefono} onChange={onChange} error={msg("telefono")} />
        <Campo label="Contraseña" name="password" type="password" autoComplete="new-password"
               minLength={10} value={form.password} onChange={onChange}
               error={msg("password")} required />
        <Campo label="Confirmar contraseña" name="password2" type="password" autoComplete="new-password"
               minLength={10} value={form.password2} onChange={onChange}
               error={msg("password2")} required />
        {errores.detail && <p className="error">{errores.detail}</p>}
        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
      <p className="alt">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}