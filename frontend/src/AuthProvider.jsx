import { useEffect, useState } from "react";
import api from "./api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await api.get("/auth/csrf/");
        const { data } = await api.get("/auth/me/");
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login/", { email, password });
    setUser(data);
  };

  const registro = async (datos) => {
    const { data } = await api.post("/auth/registro/", datos);
    setUser(data);
  };

  const logout = async () => {
    await api.post("/auth/logout/");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}