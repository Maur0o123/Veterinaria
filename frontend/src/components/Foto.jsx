import { useState } from "react";
import Logo from "./Logo";

export default function Foto({ src, alt, className = "", eager = false }) {
  const [fallo, setFallo] = useState(false);

  return (
    <figure className={`figura ${className}`}>
      {fallo ? (
        <div className="figura-vacia" role="img" aria-label={alt}>
          <Logo size={44} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFallo(true)}
        />
      )}
    </figure>
  );
}