import { useState } from "react";
import api, { mensajeError } from "../api";
import { ESPECIES } from "../utils";
import Campo from "./Campo";

const vacio = { nombre: "", especie: "perro", raza: "", fecha_nacimiento: "" };

export default function MisMascotas({ mascotas, onCambio }) {
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const agregar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await api.post("/mascotas/", { ...form, fecha_nacimiento: form.fecha_nacimiento || null });
      setForm(vacio);
      onCambio();
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar la mascota."));
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (mascota) => {
    if (!window.confirm(`¿Eliminar a ${mascota.nombre}?`)) return;
    try {
      await api.delete(`/mascotas/${mascota.id}/`);
      setError("");
      onCambio();
    } catch (err) {
      setError(mensajeError(err, "No se pudo eliminar la mascota."));
    }
  };

  return (
    <div className="bloque">
      <h2>Mis mascotas</h2>

      {mascotas.length > 0 && (
        <ul className="lista">
          {mascotas.map((m) => (
            <li className="item" key={m.id}>
              <div className="item-info">
                <strong>{m.nombre}</strong>
                <p>{ESPECIES[m.especie]}{m.raza ? ` · ${m.raza}` : ""}</p>
              </div>
              <button className="btn-link" onClick={() => eliminar(m)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}

      <form className="form-inline" onSubmit={agregar}>
        <Campo label="Nombre" name="nombre" value={form.nombre} onChange={onChange} maxLength={60} required />
        <label className="field">
          <span>Especie</span>
          <select name="especie" value={form.especie} onChange={onChange}>
            {Object.entries(ESPECIES).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>{etiqueta}</option>
            ))}
          </select>
        </label>
        <Campo label="Raza (opcional)" name="raza" value={form.raza} onChange={onChange} maxLength={60} />
        <Campo label="Nacimiento (opcional)" name="fecha_nacimiento" type="date"
               value={form.fecha_nacimiento} onChange={onChange} />
        <button className="btn" type="submit" disabled={enviando}>Agregar mascota</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}