import { useGameStore } from '../State/gameStore.jsx'
import { Panel, ProgressBar, Button } from '../components/Ui.jsx'

export default function TownStats() {
	const { town, player, improveTownStat } = useGameStore()

	const improvements = [
		{ stat: 'happiness', label: '😊 Happiness', amount: 15, cost: 100 },
		{ stat: 'water', label: '💧 Water', amount: 20, cost: 80 },
		{ stat: 'food', label: '🌾 Food', amount: 20, cost: 120 },
		{ stat: 'stability', label: '⚖️ Stability', amount: 15, cost: 150 },
		{ stat: 'health', label: '💊 Health', amount: 15, cost: 100 }
	]

	const stats = [
		{ label: '😊 Happiness', value: town.happiness, max: 100, color: 'bg-ember' },
		{ label: '💧 Water', value: town.water, max: 100, color: 'bg-royal' },
		{ label: '🌾 Food', value: town.food, max: 100, color: 'bg-moss' },
		{ label: '👥 Population', value: town.population, max: 500, color: 'bg-steel' },
		{ label: '⚖️ Stability', value: town.stability, max: 100, color: 'bg-ember' },
		{ label: '💊 Health', value: town.health, max: 100, color: 'bg-moss' }
	]

	const getStatColor = (value) => {
		if (value < 30) return 'text-ember'
		if (value < 60) return 'text-amber-600'
		return 'text-moss'
	}

	const handleImprove = (stat, amount, cost) => {
		improveTownStat(stat, amount, cost)
	}

	return (
		<Panel title="🏘️ Town Status">
			<div className="mb-4 rounded-lg border border-dusk/20 p-3 text-xs text-ink">
				<p>⚠️ Town stats decay daily. Low stats reduce army effectiveness in battle!</p>
				<p className="mt-1">• Food/Health/Happiness &lt; 30: -10-15% battle strength</p>
				<p>• Stability &lt; 40: -5% battle strength</p>
				<p>• Low stats also risk raider attacks!</p>
			</div>

			<div className="grid grid-cols-2 gap-4 md:grid-cols-3 mb-4">
				{stats.map((stat) => (
					<div key={stat.label} className="my-2 space-y-2 rounded-lg border border-dusk/20 p-3">
						<div className="text-xs font-semibold text-ink">{stat.label}</div>
						<div className="h-3 rounded-full bg-dusk/20 overflow-hidden">
							<div
								className={`h-full ${stat.color} transition-all`}
								style={{ width: `${(stat.value / stat.max) * 100}%` }}
							/>
						</div>
						<div className={`text-sm font-bold ${getStatColor(stat.value)}`}>
							{stat.value}/{stat.max}
						</div>
					</div>
				))}
			</div>

			<div className="border-t border-dusk/20 pt-3">
				<div className="text-xs font-semibold text-ink mb-2">💰 Improve Town (Your coins: {player.coins})</div>
				<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
					{improvements.map((imp) => (
						<Button
							key={imp.stat}
							variant="outline"
							size="sm"
							onClick={() => handleImprove(imp.stat, imp.amount, imp.cost)}
							disabled={player.coins < imp.cost || town[imp.stat] >= 100}
						>
							{imp.label} +{imp.amount}
							<div className="text-xs">({imp.cost} 💰)</div>
						</Button>
					))}
				</div>
			</div>
		</Panel>
	)
}
