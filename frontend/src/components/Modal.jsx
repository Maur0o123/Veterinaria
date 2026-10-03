import { useEffect } from "react";

export default function Modal({ titulo, onCerrar, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  return (
    <div
      className="modal-fondo"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-cab">
          <h2>{titulo}</h2>
          <button className="btn-link" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}