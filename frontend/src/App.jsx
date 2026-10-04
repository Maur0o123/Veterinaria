import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import Layout from "./components/Layout";
import RutaProtegida from "./components/RutaProtegida";
import Citas from "./pages/Citas";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import CalendarioAdmin from "./pages/panel/CalendarioAdmin";
import Usuarios from "./pages/panel/Usuarios";
import Registro from "./pages/Registro";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route element={<RutaProtegida />}>
              <Route path="/citas" element={<Citas />} />
            </Route>
            <Route element={<RutaProtegida roles={["admin"]} />}>
              <Route path="/panel/usuarios" element={<Usuarios />} />
              <Route path="/panel/calendario" element={<CalendarioAdmin />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}