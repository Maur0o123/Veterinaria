export default function Campo({ label, error, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {error && <small className="error">{error}</small>}
    </label>
  );
}