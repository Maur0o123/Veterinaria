import { useEffect, useState } from "react";
import api, { mensajeError } from "../api";
import { useAuth } from "../AuthContext";
import AgendarCita from "../components/AgendarCita";
import MisCitas from "../components/MisCitas";
import MisMascotas from "../components/MisMascotas";

export default function Citas() {
  const { user } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");

  const recargar = () => setVersion((v) => v + 1);

  useEffect(() => {
    let cancelado = false;
    Promise.all([api.get("/mascotas/"), api.get("/citas/")])
      .then(([m, c]) => {
        if (cancelado) return;
        setMascotas(m.data);
        setCitas(c.data);
        setError("");
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeError(err, "No se pudieron cargar tus datos."));
      });
    return () => {
      cancelado = true;
    };
  }, [version]);

  return (
    <section className="seccion">
      <div className="container">
        <p className="eyebrow">Mi cuenta</p>
        <h1>Hola, {user.first_name}</h1>
        {error && <p className="error">{error}</p>}
        <AgendarCita mascotas={mascotas} onAgendada={recargar} />
        <MisCitas citas={citas} onCambio={recargar} />
        <MisMascotas mascotas={mascotas} onCambio={recargar} />
      </div>
    </section>
  );
}