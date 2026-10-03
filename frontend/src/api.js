import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

export function mensajeError(err, porDefecto = "Ocurrió un error.") {
  const d = err.response?.data;
  if (!d || typeof d === "string") return porDefecto;
  if (d.detail) return d.detail;
  return Object.values(d).flat().join(" ") || porDefecto;
}
export default api;