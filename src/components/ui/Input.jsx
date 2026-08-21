export function Input({ label, error, suffix, className = '', id, ...rest }) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`w-full min-h-[44px] rounded-xl border px-3.5 py-2.5 text-[15px] bg-[var(--paper-raised)]
            text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none tabular
            transition-colors duration-150
            focus:border-[var(--selected)] focus:ring-2 focus:ring-[var(--selected-soft)]
            ${error ? 'border-[var(--negative)]' : 'border-[var(--border)]'}
            ${suffix ? 'pr-12' : ''}
            ${className}`}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[var(--ink-faint)]">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-[13px] text-[var(--negative)]">{error}</p>}
    </div>
  );
}
