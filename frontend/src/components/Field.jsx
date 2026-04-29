function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-100">{label}</span>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
    </label>
  )
}

export default Field
