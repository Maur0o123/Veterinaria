import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function RutaProtegida({ roles }) {
  const { user, cargando } = useAuth();
  if (cargando) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />;
  return <Outlet />;
}