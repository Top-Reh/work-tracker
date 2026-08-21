export function Card({ children, className = '', ...rest }) {
  return (
    <div
      className={`bg-[var(--paper-raised)] border border-[var(--border)] rounded-2xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
