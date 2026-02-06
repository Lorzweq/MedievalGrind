import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../State/gameStore.jsx'

export default function LeaderFloat() {
	const { player, addCoins, addItem, armies, town, currentEnemy, inBattle, data } = useGameStore()
	const [isOpen, setIsOpen] = useState(true)
	const [position, setPosition] = useState({ x: 24, y: 120 })
	const dragRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 })

	const armyUnits = Object.values(armies || {})
	const aliveUnits = armyUnits.filter((unit) => unit.currentHp > 0)
	const totalHp = armyUnits.reduce((sum, unit) => sum + unit.currentHp, 0)
	const enemyName = currentEnemy
		? data.enemies.find((enemy) => enemy.id === currentEnemy.enemyId)?.name || currentEnemy.enemyId
		: null

	useEffect(() => {
		const handleMove = (event) => {
			if (!dragRef.current.dragging) return
			const x = event.clientX - dragRef.current.offsetX
			const y = event.clientY - dragRef.current.offsetY
			setPosition({ x: Math.max(8, x), y: Math.max(8, y) })
		}

		const handleUp = () => {
			dragRef.current.dragging = false
		}

		window.addEventListener('mousemove', handleMove)
		window.addEventListener('mouseup', handleUp)

		return () => {
			window.removeEventListener('mousemove', handleMove)
			window.removeEventListener('mouseup', handleUp)
		}
	}, [])

	const startDrag = (event) => {
		dragRef.current.dragging = true
		dragRef.current.offsetX = event.clientX - position.x
		dragRef.current.offsetY = event.clientY - position.y
	}

	if (!isOpen) {
		return (
			<button
				onClick={() => setIsOpen(true)}
				className="fixed bottom-6 right-6 z-50 rounded-lg bg-gradient-to-br from-royal to-ember px-6 py-3 text-sm font-bold text-parchment-xl transition-all border-2 border-royal/50"
			>
				👤 Open Leader
			</button>
		)
	}

	return (
		<div
			className="fixed z-50 w-64 rounded-xl border border-stone-300 bg-white"
			style={{ left: `${position.x}px`, top: `${position.y}px` }}
		>
			<div
				onMouseDown={startDrag}
				className="flex cursor-move items-center justify-between rounded-t-xl bg-gradient-to-r from-royal/30 to-royal/20 px-3 py-2 border-b border-royal/30"
				>
					<div className="text-xs font-black uppercase tracking-[0.2em] text-ink">Leader</div>
					<button
						onClick={() => setIsOpen(false)}
						className="rounded-md px-2 text-xs font-semibold text-ink hover:bg-royal/30"
					>
						✕
					</button>
				</div>
				<div className="my-2 space-y-2 px-3 py-3 text-sm text-ink">
					<div className="flex items-center justify-between">
						<span className="text-xs uppercase tracking-widest text-ink/70 font-semibold">Gold</span>
						<span className="text-lg font-bold text-ember">{player.coins}</span>
					</div>
					<div className="rounded-lg border border-stone-300 bg-white px-2 py-2">
						<div className="text-xs font-semibold text-ink/80">Battle Status</div>
						<div className="mt-1 text-xs">
							<span className="text-ink/70 font-medium">Fighting:</span>{' '}
							<span className="font-semibold text-ink">
								{inBattle && enemyName ? enemyName : enemyName ? `Scouting ${enemyName}` : 'None'}
							</span>
						</div>
						<div className="mt-1 text-xs">
							<span className="text-ink/70 font-medium">Status:</span>{' '}
							<span className="font-semibold text-ink">{inBattle ? 'In Battle' : 'Idle'}</span>
						</div>
					</div>
					<div className="rounded-lg border border-stone-300 bg-white px-2 py-2">
						<div className="text-xs font-semibold text-ink/80">Army</div>
						<div className="mt-1 grid grid-cols-2 gap-2 text-xs">
							<div>
								<span className="text-ink/70 font-medium">Units:</span>{' '}
								<span className="font-semibold text-ink">{armyUnits.length}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">Alive:</span>{' '}
								<span className="font-semibold text-ink">{aliveUnits.length}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">Total HP:</span>{' '}
								<span className="font-semibold text-ink">{totalHp}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">Level:</span>{' '}
								<span className="font-semibold text-ink">{player.level}</span>
							</div>
						</div>
					</div>
					<button
						onClick={() => addCoins(500)}
						className="w-full rounded-md bg-ember/20 px-3 py-2 text-xs font-semibold text-ink hover:bg-ember/30 border border-ember/30"
					>
						Claim 500 gold
					</button>
					<button
						onClick={() => addItem('scrap_cloth', 10)}
						className="w-full rounded-md bg-moss/20 px-3 py-2 text-xs font-semibold text-ink hover:bg-moss/30 border border-moss/30"
					>
						Claim 10 scrap cloth
					</button>
					<div className="rounded-lg bg-dusk/10 px-2 py-2 border border-dusk/20">
						<div className="text-xs font-semibold text-ink/80">Leader Profile</div>
						<div className="mt-1 grid grid-cols-2 gap-2 text-xs">
							<div>
								<span className="text-ink/70 font-medium">Level:</span> <span className="font-semibold text-ink">{player.level}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">XP:</span> <span className="font-semibold text-ink">{player.xp}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">Streak:</span> <span className="font-semibold text-ink">{player.streak}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">Title:</span> <span className="font-semibold text-ink">Warden</span>
							</div>
						</div>
					</div>
					<div className="rounded-lg border border-stone-300 bg-white px-2 py-2">
						<div className="text-xs font-semibold text-ink/80">Town</div>
						<div className="mt-1 grid grid-cols-2 gap-2 text-xs">
							<div>
								<span className="text-ink/70 font-medium">Happiness:</span>{' '}
								<span className="font-semibold text-ink">{town.happiness}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">Water:</span>{' '}
								<span className="font-semibold text-ink">{town.water}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">Food:</span>{' '}
								<span className="font-semibold text-ink">{town.food}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">Population:</span>{' '}
								<span className="font-semibold text-ink">{town.population}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">Stability:</span>{' '}
								<span className="font-semibold text-ink">{town.stability}</span>
							</div>
							<div>
								<span className="text-ink/70 font-medium">Health:</span>{' '}
								<span className="font-semibold text-ink">{town.health}</span>
							</div>
						</div>
					</div>
				<div className="text-xs text-ink/60 font-medium">
					Drag this window to move it. Click ✕ to hide.
				</div>
			</div>
		</div>
	)
}
