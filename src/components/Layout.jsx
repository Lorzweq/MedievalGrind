import { NavLink } from 'react-router-dom'
import LeaderFloat from './LeaderFloat.jsx'

const navLinkClass = ({ isActive }) =>
	`px-3 py-2 rounded-full text-xs font-semibold tracking-[0.2em] uppercase transition-all ${
		isActive
			? 'bg-ember text-parchment-md'
			: 'text-parchment hover:text-white hover:bg-ember/30'
	}`

export default function Layout({ children }) {
	return (
		<div className="min-h-screen text-ink">
			<header className="app-header sticky top-0 z-40">
				<div className="mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-gradient-to-br from-ember to-royal text-parchment flex items-center justify-center font-black-lg">
							⚔️
						</div>
						<div>
							<div className="text-xs uppercase tracking-[0.35em] text-parchment/70">The Low Kingdoms</div>
							<div className="text-lg font-black tracking-wide text-parchment">Medieval Grind</div>
						</div>
					</div>
					<nav className="flex flex-wrap gap-2">
						<NavLink to="/play" className={navLinkClass}>
							Play
						</NavLink>
						<NavLink to="/wiki" className={navLinkClass}>
							Wiki
						</NavLink>
						<NavLink to="/guides" className={navLinkClass}>
							Guides
						</NavLink>
						<NavLink to="/tools" className={navLinkClass}>
							Tools
						</NavLink>
					</nav>
				</div>
			</header>
			<main className="mx-auto max-w-6xl px-4 py-8">
				<div className="rounded-3xl bg-parchment p-4-panel md:p-6 border border-parchment/10">
					{children}
				</div>
			</main>
			<LeaderFloat />
		</div>
	)
}
