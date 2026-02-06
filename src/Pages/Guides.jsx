import { Panel, Badge } from '../components/Ui.jsx'
import enemies from '../Data/enemies.json'
import items from '../Data/items.json'
import { useState } from 'react'

const itemIndex = Object.fromEntries(items.map((item) => [item.id, item]))

const rarityColors = {
	common: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
	uncommon: 'bg-green-500/20 text-green-700 border-green-500/30',
	rare: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
	very_rare: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
	legendary: 'bg-amber-500/20 text-amber-700 border-amber-500/30'
}

const enemyRarityColors = {
	common: 'text-dusk',
	uncommon: 'text-green-700',
	rare: 'text-blue-700',
	legendary: 'text-amber-700'
}

export default function Guides() {
	const [selectedEnemy, setSelectedEnemy] = useState(null)

	return (
		<div className="my-2 space-y-4">
			<Panel title="Enemy Drop Tables">
				<p className="text-sm text-dusk/80 mb-4">
					Below are all enemies you can encounter and their loot tables. Rare enemies have low encounter rates but better rewards!
				</p>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* Enemy List */}
					<div className="my-2 space-y-2">
						{enemies.map((enemy) => (
							<button
								key={enemy.id}
								onClick={() => setSelectedEnemy(enemy)}
								className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
									selectedEnemy?.id === enemy.id
										? 'bg-ember/10 border-ember/50'
										: 'bg-parchment/30 border-dusk/20 hover:border-dusk/40'
								}`}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="text-2xl">{enemy.icon}</span>
										<div>
											<div className={`font-semibold ${enemyRarityColors[enemy.rarity] || 'text-ink'}`}>
												{enemy.name}
											</div>
											<div className="text-xs text-ink">
												Level {enemy.level} • {enemy.stats.hp} HP
											</div>
										</div>
									</div>
									<Badge variant="default" className="text-xs capitalize">
										{enemy.rarity}
									</Badge>
								</div>
								{enemy.encounterWeight && (
									<div className="text-xs text-dusk/50 mt-1">
										Encounter Rate: {((enemy.encounterWeight / enemies.reduce((sum, e) => sum + (e.encounterWeight || 50), 0)) * 100).toFixed(2)}%
									</div>
								)}
							</button>
						))}
					</div>

					{/* Drop Table Details */}
					<div>
						{selectedEnemy ? (
							<div className="bg-parchment/40 p-4 rounded-lg border-2 border-dusk/20">
								<div className="flex items-center gap-3 mb-4 pb-3 border-b border-dusk/20">
									<span className="text-3xl">{selectedEnemy.icon}</span>
									<div>
										<h3 className={`font-bold text-lg ${enemyRarityColors[selectedEnemy.rarity] || 'text-ink'}`}>
											{selectedEnemy.name}
										</h3>
										<div className="text-sm text-ink">
											Level {selectedEnemy.level} • {selectedEnemy.rarity}
										</div>
									</div>
								</div>

								{/* Stats */}
								<div className="grid grid-cols-2 gap-2 mb-4">
									<div className="text-sm">
										<span className="text-ink">HP:</span> <span className="font-semibold">{selectedEnemy.stats.hp}</span>
									</div>
									<div className="text-sm">
										<span className="text-ink">Attack:</span> <span className="font-semibold">{selectedEnemy.stats.attack}</span>
									</div>
									<div className="text-sm">
										<span className="text-ink">Defense:</span> <span className="font-semibold">{selectedEnemy.stats.defense}</span>
									</div>
									<div className="text-sm">
										<span className="text-ink">Speed:</span> <span className="font-semibold">{selectedEnemy.stats.speed}</span>
									</div>
								</div>

								{/* Gold Rewards */}
								{selectedEnemy.goldDrop && (
									<div className="mb-4 p-2 bg-amber-500/10 rounded border border-amber-500/30">
										<div className="text-sm">
											<span className="text-ink">💰 Gold:</span>{' '}
											<span className="font-semibold text-amber-700">
												{selectedEnemy.goldDrop.min} - {selectedEnemy.goldDrop.max}
											</span>
										</div>
									</div>
								)}

								{/* Loot Drops */}
								<div>
									<h4 className="font-semibold text-sm mb-2 text-ink">Loot Drops:</h4>
									<div className="my-2 space-y-2">
										{selectedEnemy.drops?.map((drop, idx) => {
											const item = itemIndex[drop.itemId]
											if (!item) return null

											const chancePercent = (drop.chance * 100).toFixed(drop.chance < 0.01 ? 4 : 1)
											const rarityClass = rarityColors[drop.rarity] || rarityColors.common

											return (
												<div
													key={idx}
													className={`p-2 rounded border ${rarityClass}`}
												>
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<span className="font-medium text-sm">{item.name}</span>
															<span className="text-xs opacity-70">({drop.min}-{drop.max})</span>
														</div>
														<div className="text-xs font-semibold">
															{chancePercent}%
														</div>
													</div>
													<div className="text-xs mt-1 opacity-60 capitalize">
														{drop.rarity} drop
													</div>
												</div>
											)
										})}
										{(!selectedEnemy.drops || selectedEnemy.drops.length === 0) && (
											<p className="text-sm text-ink italic">No loot drops</p>
										)}
									</div>
								</div>
							</div>
						) : (
							<div className="h-full flex items-center justify-center text-dusk/40 text-sm">
								Select an enemy to view drop details
							</div>
						)}
					</div>
				</div>
			</Panel>

			<Panel title="Combat Tips">
				<div className="my-2 space-y-2 text-sm text-dusk/80">
					<p>• <strong>Encounter Rates:</strong> Common enemies appear frequently, while legendary enemies have extremely low spawn rates (0.3% or less).</p>
					<p>• <strong>Drop Chances:</strong> Each item has an independent chance to drop. Very rare items (0.01% or less) may take hundreds of kills.</p>
					<p>• <strong>Fleeing:</strong> You can flee from any battle, but you'll lose 10-30% of your troops. Failed flee attempts (30% chance) damage all units.</p>
					<p>• <strong>Tactics:</strong> Choose your battle tactics wisely. Aggressive deals more damage but takes more casualties, while Defensive minimizes losses.</p>
					<p>• <strong>Rare Encounters:</strong> When you encounter rare or legendary enemies, you'll see a special notification. These fights are harder but much more rewarding!</p>
				</div>
			</Panel>
		</div>
	)
}
