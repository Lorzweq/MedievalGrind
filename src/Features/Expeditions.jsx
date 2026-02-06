import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../State/gameStore.jsx'
import { Panel, Button } from '../components/Ui.jsx'
import { formatDuration, now } from '../Utilities/time.jsx'

export default function ExpeditionsPanel() {
	const { data, expeditions, startExpedition, claimExpedition } = useGameStore()
	const [tick, setTick] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => setTick((t) => t + 1), 1000)
		return () => clearInterval(interval)
	}, [])

	const currentTime = useMemo(() => now(), [tick])

	return (
		<Panel title="🗺️ Expeditions">
			<div className="my-2 space-y-3 text-sm">
				{data.expeditions.map((expedition) => (
					<div key={expedition.id} className="flex items-center justify-between rounded-lg border border-dusk/20 p-3 hover:border-royal/50 transition-all">
						<div>
							<div className="font-semibold text-ink">{expedition.name}</div>
							<div className="text-xs text-ink">Duration: {expedition.durationSec / 60}m</div>
						</div>
						<Button variant="primary" className="text-xs px-3 py-1 whitespace-nowrap" onClick={() => startExpedition(expedition.id)}>→ Send</Button>
					</div>
				))}
			</div>
			<div className="mt-4 space-y-2 text-xs text-ink">
				{expeditions.map((entry) => {
					const expedition = data.expeditions.find((item) => item.id === entry.expeditionId)
					const remaining = entry.endAt - currentTime
					return (
						<div key={entry.id} className={remaining <= 0 ? "flex items-center justify-between rounded-lg border border-moss/30 bg-moss/10 p-2" : "flex items-center justify-between"}>
							<span className={remaining <= 0 ? "text-moss font-semibold" : ""}>{expedition?.name}</span>
							{remaining <= 0 ? (
								<Button variant="success" className="text-xs px-3 py-1 whitespace-nowrap" onClick={() => claimExpedition(entry.id)}>
									✓ Claim
								</Button>
							) : (
								<span>{formatDuration(remaining)}</span>
							)}
						</div>
					)
				})}
			</div>
		</Panel>
	)
}
