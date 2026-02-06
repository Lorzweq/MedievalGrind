import { useMemo } from 'react'
import { useGameStore } from '../State/gameStore.jsx'
import { Panel, Badge } from '../components/Ui.jsx'

export default function InventoryPanel({ className = '' }) {
	const { inventory, getItemName } = useGameStore()
	const inventoryArray = useMemo(() => Object.entries(inventory), [inventory])

	return (
		<Panel title="📦 Inventory" className={className}>
			<div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
				{inventoryArray.map(([itemId, qty]) => (
					<div key={itemId} className="flex items-center justify-between rounded-lg border border-dusk/20 px-3 py-2">
						<span>{getItemName(itemId)}</span>
						<Badge>{qty}</Badge>
					</div>
				))}
			</div>
		</Panel>
	)
}
