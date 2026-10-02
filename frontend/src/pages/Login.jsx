import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Campo from "../components/Campo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail ?? "No se pudo iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card">
      <h1>Iniciar sesión</h1>
      <p className="sub">Bienvenido de vuelta.</p>
      <form onSubmit={onSubmit}>
        <Campo label="Email" name="email" type="email" autoComplete="email"
               value={form.email} onChange={onChange} required />
        <Campo label="Contraseña" name="password" type="password" autoComplete="current-password"
               value={form.password} onChange={onChange} required />
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="alt">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </div>
  );
}