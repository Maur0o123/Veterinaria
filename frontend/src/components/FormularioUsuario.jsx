import { useState } from "react";
import api, { mensajeError } from "../api";
import Campo from "./Campo";

export default function FormularioUsuario({ usuario, esYo, onGuardado, onCancelar }) {
  const editando = Boolean(usuario);
  const [form, setForm] = useState({
    email: usuario?.email ?? "",
    first_name: usuario?.first_name ?? "",
    last_name: usuario?.last_name ?? "",
    telefono: usuario?.telefono ?? "",
    rol: usuario?.rol ?? "cliente",
    is_active: usuario?.is_active ?? true,
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!editando && form.password !== form.password2) {
      return setError("Las contraseñas no coinciden.");
    }
    setEnviando(true);
    try {
      if (editando) {
        const { first_name, last_name, telefono, rol, is_active } = form;
        await api.patch(`/panel/usuarios/${usuario.id}/`, {
          first_name, last_name, telefono, rol, is_active,
        });
      } else {
        const { email, first_name, last_name, telefono, rol, password, password2 } = form;
        await api.post("/panel/usuarios/", {
          email, first_name, last_name, telefono, rol, password, password2,
        });
      }
      onGuardado();
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="row">
        <Campo label="Nombre" name="first_name" value={form.first_name} onChange={onChange} required />
        <Campo label="Apellido" name="last_name" value={form.last_name} onChange={onChange} required />
      </div>
      <Campo label="Email" name="email" type="email" value={form.email}
             onChange={onChange} disabled={editando} required />
      <Campo label="Teléfono" name="telefono" type="tel" value={form.telefono} onChange={onChange} />

      <label className="field">
        <span>Rol</span>
        <select name="rol" value={form.rol} onChange={onChange} disabled={esYo}>
          <option value="cliente">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
      </label>

      {editando && (
        <label className="field check">
          <input type="checkbox" name="is_active" checked={form.is_active}
                 onChange={onChange} disabled={esYo} />
          <span>Cuenta activa</span>
        </label>
      )}
      {esYo && <p className="nota">No puedes cambiar tu propio rol ni desactivar tu cuenta.</p>}

      {!editando && (
        <>
          <Campo label="Contraseña" name="password" type="password" autoComplete="new-password"
                 minLength={10} value={form.password} onChange={onChange} required />
          <Campo label="Confirmar contraseña" name="password2" type="password" autoComplete="new-password"
                 minLength={10} value={form.password2} onChange={onChange} required />
        </>
      )}

      {error && <p className="error">{error}</p>}

      <div className="modal-acciones">
        <button type="button" className="btn outline" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}