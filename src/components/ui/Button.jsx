const VARIANT_CLASSES = {
  primary: 'bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 active:opacity-80',
  secondary: 'bg-[var(--paper-raised)] text-[var(--ink)] border border-[var(--border)] hover:bg-[var(--border-soft)]',
  ghost: 'bg-transparent text-[var(--ink-soft)] hover:bg-[var(--border-soft)]',
  danger: 'bg-[var(--negative)] text-white hover:opacity-90 active:opacity-80',
};

export function Button({ variant = 'primary', fullWidth, className = '', children, disabled, ...rest }) {
  return (
    <button
      className={`min-h-[44px] px-4 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150
        disabled:opacity-40 disabled:pointer-events-none
        ${fullWidth ? 'w-full' : ''} ${VARIANT_CLASSES[variant]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
