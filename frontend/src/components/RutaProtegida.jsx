import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function RutaProtegida() {
  const { user, cargando } = useAuth();
  if (cargando) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}