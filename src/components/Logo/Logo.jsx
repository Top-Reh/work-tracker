export function Logo({ size = 32, rounded = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Work Tracker logo"
    >
      <rect x="2" y="2" width="96" height="96" rx={rounded ? 24 : 0} fill="#0A66FF" />

      {/* clock face */}
      <circle cx="44" cy="44" r="27" stroke="white" strokeWidth="5.5" fill="none" />
      {/* hour ticks at 12/3/6/9 */}
      <line x1="44" y1="17" x2="44" y2="22" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="71" y1="44" x2="66" y2="44" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="44" y1="71" x2="44" y2="66" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="17" y1="44" x2="22" y2="44" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
      {/* clock hands */}
      <path d="M44 28 L44 45 L56 53" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* checkmark badge */}
      <circle cx="70" cy="70" r="18" fill="#0A66FF" stroke="white" strokeWidth="5" />
      <path d="M62 70 L67.5 75.5 L79 62" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
