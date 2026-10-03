import { useEffect, useState } from "react";
import api, { mensajeError } from "../../api";
import { useAuth } from "../../AuthContext";
import FormularioUsuario from "../../components/FormularioUsuario";
import Modal from "../../components/Modal";

const POR_PAGINA = 10;

export default function Usuarios() {
  const { user: yo } = useAuth();
  const [datos, setDatos] = useState({ count: 0, results: [] });
  const [busqueda, setBusqueda] = useState("");
  const [q, setQ] = useState("");
  const [rol, setRol] = useState("");
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const [version, setVersion] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  const recargar = () => setVersion((v) => v + 1);
  const totalPaginas = Math.max(1, Math.ceil(datos.count / POR_PAGINA));

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(busqueda);
      setPagina(1);
    }, 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    let cancelado = false;
    api
      .get("/panel/usuarios/", {
        params: {
          search: q || undefined,
          rol: rol || undefined,
          estado: estado || undefined,
          page: pagina,
        },
      })
      .then((r) => {
        if (cancelado) return;
        setDatos(r.data);
        setError("");
      })
      .catch((err) => {
        if (cancelado) return;
        if (err.response?.status === 404 && pagina > 1) return setPagina(1);
        setError(mensajeError(err, "No se pudieron cargar los usuarios."));
      })
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, [q, rol, estado, pagina, version]);

  const alternarActivo = async (u) => {
    const accion = u.is_active ? "desactivar" : "activar";
    if (!window.confirm(`¿Seguro que quieres ${accion} a ${u.email}?`)) return;
    try {
      await api.patch(`/panel/usuarios/${u.id}/`, { is_active: !u.is_active });
      recargar();
    } catch (err) {
      setError(mensajeError(err, "No se pudo actualizar el usuario."));
    }
  };

  return (
    <section className="seccion">
      <div className="container">
        <div className="panel-cab">
          <div>
            <p className="eyebrow">Administración</p>
            <h1>Usuarios</h1>
          </div>
          <button className="btn sm" onClick={() => setModal("nuevo")}>Nuevo usuario</button>
        </div>

        <div className="filtros">
          <input
            type="search"
            placeholder="Buscar por nombre o email"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={rol} onChange={(e) => { setRol(e.target.value); setPagina(1); }}>
            <option value="">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="cliente">Clientes</option>
          </select>
          <select value={estado} onChange={(e) => { setEstado(e.target.value); setPagina(1); }}>
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {datos.results.map((u) => (
                <tr key={u.id} className={u.is_active ? "" : "inactivo"}>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td>{u.telefono || "—"}</td>
                  <td>
                    <span className={`badge ${u.rol === "admin" ? "admin" : ""}`}>
                      {u.rol === "admin" ? "Administrador" : "Cliente"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? "" : "off"}`}>
                      {u.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>{new Date(u.date_joined).toLocaleDateString("es")}</td>
                  <td className="acciones">
                    <button className="btn-link" onClick={() => setModal(u)}>Editar</button>
                    {u.id !== yo.id && (
                      <button className="btn-link" onClick={() => alternarActivo(u)}>
                        {u.is_active ? "Desactivar" : "Activar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!cargando && datos.results.length === 0 && (
            <p className="vacio">No se encontraron usuarios.</p>
          )}
        </div>

        <div className="paginacion">
          <span>{datos.count} usuario{datos.count === 1 ? "" : "s"} · página {pagina} de {totalPaginas}</span>
          <div>
            <button className="btn outline sm" disabled={!datos.previous} onClick={() => setPagina(pagina - 1)}>
              Anterior
            </button>
            <button className="btn outline sm" disabled={!datos.next} onClick={() => setPagina(pagina + 1)}>
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <Modal
          titulo={modal === "nuevo" ? "Nuevo usuario" : "Editar usuario"}
          onCerrar={() => setModal(null)}
        >
          <FormularioUsuario
            usuario={modal === "nuevo" ? null : modal}
            esYo={modal !== "nuevo" && modal.id === yo.id}
            onCancelar={() => setModal(null)}
            onGuardado={() => {
              setModal(null);
              recargar();
            }}
          />
        </Modal>
      )}
    </section>
  );
}