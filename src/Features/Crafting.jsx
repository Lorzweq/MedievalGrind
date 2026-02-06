import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../State/gameStore.jsx'
import { Panel, Button, Badge } from '../components/Ui.jsx'
import { formatDuration, now } from '../Utilities/time.jsx'

export default function CraftingPanel({ buildings = [] }) {
	const { craftingQueues, startCrafting, claimCrafting, getRecipe, getItemName, getItem } = useGameStore()
	const [tick, setTick] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => setTick((t) => t + 1), 1000)
		return () => clearInterval(interval)
	}, [])

	const currentTime = useMemo(() => now(), [tick])

	const formatStats = (stats) => {
		if (!stats) return ''
		const parts = []
		if (stats.hp) parts.push(`HP +${stats.hp}`)
		if (stats.attack) parts.push(`ATK +${stats.attack}`)
		if (stats.defense) parts.push(`DEF +${stats.defense}`)
		if (stats.speed) parts.push(`SPD +${stats.speed}`)
		return parts.join(', ')
	}

	return (
		<Panel title="🔨 Workshops">
			<div className="my-2 space-y-4">
				{buildings.map((building) => (
					<div key={building.id} className="my-2 space-y-2 rounded-lg border border-dusk/20 p-3">
						<div className="flex items-center justify-between">
							<span className="font-semibold text-dusk">{building.name}</span>
							<Badge>{building.queueSlots} slots</Badge>
						</div>
						<div className="my-2 space-y-2 text-sm">
							{building.recipes.map((recipeId) => {
								const recipe = getRecipe(recipeId)
								const outputs = recipe.outputs
									.map((output) => {
										const item = getItem(output.itemId)
										const statsText = item?.stats ? ` (${formatStats(item.stats)})` : ''
										return `${output.qty}x ${getItemName(output.itemId)}${statsText}`
									})
									.join(', ')
								return (
								<div key={recipeId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dusk/20 p-2 hover:border-ember/50 transition-all">
									<div>
										<div className="font-semibold text-ink">{recipe.name}</div>
										<div className="text-xs text-ink">
											{recipe.inputs
												.map((input) => `${input.qty}x ${getItemName(input.itemId)}`)
												.join(', ')}
											{' • '}
											{recipe.timeSec / 60}m
											{' • '}
											Outputs: {outputs}
										</div>
									</div>
									<Button variant="primary" className="text-xs px-3 py-1 whitespace-nowrap" onClick={() => startCrafting(building.id, recipeId)}>🔨 Craft</Button>
									</div>
								)
							})}
						</div>
						<div className="my-2 space-y-2 text-xs text-ink">
							{(craftingQueues[building.id] || []).map((entry) => {
								const recipe = getRecipe(entry.recipeId)
								const remaining = entry.endAt - currentTime
								const isReady = remaining <= 0
								return (
									<div key={entry.id} className={isReady ? "flex items-center justify-between rounded-lg border border-moss/30 bg-moss/10 p-2" : "flex items-center justify-between"}>
										<span className={isReady ? "text-moss font-semibold" : ""}>{recipe.name}</span>
										{isReady ? (
											<Button variant="success" className="text-xs px-3 py-1 whitespace-nowrap" onClick={() => claimCrafting(building.id, entry.id)}>
												✓ Claim
											</Button>
										) : (
											<span>{formatDuration(remaining)}</span>
										)}
									</div>
								)
							})}
						</div>
					</div>
				))}
			</div>
		</Panel>
	)
}
