const TONE_CLASSES = {
  default: 'text-[var(--ink)]',
  negative: 'text-[var(--negative)]',
  positive: 'text-[var(--work-strong)]',
};

export function StatCard({ label, value, tone = 'default' }) {
  return (
    <div className="flex-1 min-w-[80px] bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl px-3 py-3 text-center">
      <p className="text-[11px] font-medium text-[var(--ink-faint)] uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-[15px] font-semibold tabular ${TONE_CLASSES[tone]}`}>{value}</p>
    </div>
  );
}
