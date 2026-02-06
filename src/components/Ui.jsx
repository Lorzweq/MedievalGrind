export function Panel({ title, children, className = '', glow = false }) {
  return (
    <section className={`rounded-2xl bg-parchment p-5-panel ${glow ? 'animate-pulse-glow' : ''} ${className}`}>
      {title ? (
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.25em] text-ink flex items-center gap-2">
            <span className="text-ember">⚔</span>
            {title}
          </h2>
        </header>
      ) : null}
      {children}
    </section>
  )
}

export function Button({ children, className = '', variant = 'default', ...props }) {
  const variants = {
    default: 'bg-gradient-to-r from-dusk to-ember text-parchment hover:brightness-110',
    primary: 'bg-gradient-to-br from-ember via-royal to-ember text-white font-bold hover:brightness-110',
    royal: 'bg-gradient-to-r from-royal to-ember text-parchment hover:brightness-110',
    success: 'bg-gradient-to-r from-moss to-ember/70 text-parchment hover:brightness-110',
    outline: 'border border-dusk/50 text-dusk hover:bg-dusk hover:text-parchment'
  }
  
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 will-change-transform-sm focus:outline-none focus:ring-2 focus:ring-ember/40 ${variants[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	)
}

export function Badge({ children, className = '' }) {
	return (
		<span
      className={`inline-flex items-center rounded-full bg-dusk/20 px-2 py-1 text-xs font-semibold text-ink ${className}`}
		>
			{children}
		</span>
	)
}

export function ProgressBar({ value, max }) {
	const percent = Math.min(100, Math.round((value / max) * 100))
	return (
		<div className="h-2 w-full rounded-full bg-dusk/20">
      <div className="h-2 rounded-full bg-ember" />
		</div>
	)
}
