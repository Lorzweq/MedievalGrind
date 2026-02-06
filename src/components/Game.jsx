import { useEffect, useMemo } from 'react'
import { useGameStore } from '../State/gameStore.jsx'
import { Panel, Button, Badge } from './Ui.jsx'
import { useNotifications, NotificationToast } from './Notifications.jsx'
import Map from './Map.jsx'
import Armies from './Armies.jsx'
import Enemies from './Enemies.jsx'
import InventoryPanel from '../Features/Inventory.jsx'
import CraftingPanel from '../Features/Crafting.jsx'
import ExpeditionsPanel from '../Features/Expeditions.jsx'
import TownStats from '../Features/TownStats.jsx'
import Pub from '../Features/Pub.jsx'

export default function Game() {
	const { notifications, addNotification } = useNotifications()
	const { data, player, dailyOrders, logs, resetDailyIfNeeded, completeOrder, getItemName, getXpForNextLevel } = useGameStore()

	useEffect(() => {
		resetDailyIfNeeded()
	}, [resetDailyIfNeeded])

	// Memoize expensive lookups
	const unlockedBuildings = useMemo(() => data.buildings.filter((b) => !b.locked), [data.buildings])
	const xpNeeded = getXpForNextLevel(player.level)
	const xpProgress = (player.xp / xpNeeded) * 100

	return (
		<>
			<div className="grid gap-6 mx-2">
				<section className="grid gap-4 mx-2 rounded-lg border border-stone-300 bg-white p-3">
					<TownStats />
				</section>

				<section className="grid gap-4 md:grid-cols-3 mx-2 rounded-lg border border-stone-300 bg-white p-3">
				<Panel title="⚔️ Hero">
							<div className="my-2 space-y-2 text-sm mx-2">
								<div className="flex justify-between mx-2">
								<span>Level</span>
								<span className="font-semibold">{player.level}</span>
							</div>
								<div className="mx-2">
								<div className="flex justify-between mb-1">
									<span>XP</span>
									<span className="font-semibold">{player.xp} / {xpNeeded}</span>
								</div>
								<div className="w-full bg-stone-200 rounded-full h-2">
									<div className="bg-amber-600 h-2 rounded-full" style={{ width: `${Math.min(xpProgress, 100)}%` }}></div>
								</div>
							</div>
								<div className="flex justify-between mx-2">
								<span>Coins</span>
								<span className="font-semibold">{player.coins}</span>
							</div>
								<div className="flex justify-between mx-2">
								<span>Daily Streak</span>
								<span className="font-semibold">{player.streak}</span>
							</div>
						</div>
					</Panel>
					<InventoryPanel className="md:col-span-2" />
				</section>

					<section className="grid gap-4 lg:grid-cols-2 mx-2 rounded-lg border border-stone-300 bg-white p-3">
					<CraftingPanel buildings={unlockedBuildings} />

					<Panel title="📜 Daily Order Board">
							<div className="my-2 space-y-3 text-sm mx-2">
							{dailyOrders.slots.map((orderId) => {
								const order = data.orders.find((entry) => entry.id === orderId)
								if (!order) return null
								const done = dailyOrders.completed[orderId]
								return (
										<div key={orderId} className="rounded-lg border border-dusk/20 p-3 mx-2">
											<div className="flex items-center justify-between mx-2">
											<span className="font-semibold">
												{order.tier === 'royal' ? '👑 Royal Order' : '📋 Town Order'}
											</span>
											<Badge>{order.tier}</Badge>
										</div>
											<div className="mt-2 text-xs text-dusk mx-2">
											Needs: {order.requirements.map((req) => `${req.qty}x ${getItemName(req.itemId)}`).join(', ')}
										</div>
											<div className="mt-1 text-xs text-dusk mx-2">
											Rewards:{' '}
											{order.rewards
												.map((reward) =>
													reward.type === 'item'
														? `${reward.qty}x ${getItemName(reward.itemId)}`
														: `${reward.qty} ${reward.type}`
												)
												.join(', ')}
										</div>
											<div className="mt-2 mx-2">
											{done ? (
													<Badge className="bg-moss/30 mx-2">✓ Delivered</Badge>
											) : (
												<Button variant="royal" onClick={() => completeOrder(orderId)}>
													Deliver
												</Button>
											)}
										</div>
									</div>
								)
							})}
						</div>
					</Panel>
				</section>

				<section className="grid gap-4 mx-2 rounded-lg border border-stone-300 bg-white p-3">
					<ExpeditionsPanel />
				</section>

				<section className="grid gap-4 mx-2 rounded-lg border border-stone-300 bg-white p-3">
					<Pub />
				</section>

				<section className="grid gap-4 mx-2 rounded-lg border border-stone-300 bg-white p-3">
					<Armies />
					<Enemies />
				</section>

				<section className="grid gap-4 mx-2 rounded-lg border border-stone-300 bg-white p-3">
					<Map />
				</section>

				<section className="grid gap-4 mx-2 rounded-lg border border-stone-300 bg-white p-3">
					<Panel title="📖 Town Chronicle">
						<div className="my-2 space-y-2 mx-2 text-xs text-ink">
							{logs.slice(0, 8).map((line, index) => (
								<div key={`${line}-${index}`} className="border-b border-dusk/10 pb-2 last:border-b-0 mx-2">
									{line}
								</div>
							))}
						</div>
					</Panel>
				</section>
			</div>

			<NotificationToast notifications={notifications} />
		</>
	)
}
