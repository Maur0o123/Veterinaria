import { useAuth } from "../AuthContext";

export default function Citas() {
  const { user } = useAuth();
  return (
    <section className="seccion">
      <div className="container">
        <h1>Mis citas</h1>
        <p className="sub">Hola, {user.first_name}. Muy pronto podrás agendar y ver tus citas aquí.</p>
      </div>
    </section>
  );
}