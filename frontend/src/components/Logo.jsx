export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="12" cy="16" rx="5" ry="4" />
      <circle cx="5.5" cy="11" r="2" />
      <circle cx="9.5" cy="6.5" r="2" />
      <circle cx="14.5" cy="6.5" r="2" />
      <circle cx="18.5" cy="11" r="2" />
    </svg>
  );
}