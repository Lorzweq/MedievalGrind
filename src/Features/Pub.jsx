import { useState } from 'react'
import { useGameStore } from '../State/gameStore.jsx'
import { Panel, Button, Badge } from '../components/Ui.jsx'

export default function Pub() {
	const { player, addCoins } = useGameStore()
	const [gameType, setGameType] = useState(null)
	const [bet, setBet] = useState(50)
	const [gameActive, setGameActive] = useState(false)
	const [result, setResult] = useState(null)
	const [dealerCard, setDealerCard] = useState(null)
	const [playerCard, setPlayerCard] = useState(null)
	const [fourCards, setFourCards] = useState([])
	const [selectedCard, setSelectedCard] = useState(null)
	const [revealedCards, setRevealedCards] = useState({})

	const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
	const cardValues = {
		A: 1,
		'2': 2,
		'3': 3,
		'4': 4,
		'5': 5,
		'6': 6,
		'7': 7,
		'8': 8,
		'9': 9,
		'10': 10,
		J: 11,
		Q: 12,
		K: 13
	}

	const getRandomCard = () => cards[Math.floor(Math.random() * cards.length)]

	const setupCardGame = () => {
		// Generate 4 random cards for player to pick from
		const newCards = [getRandomCard(), getRandomCard(), getRandomCard(), getRandomCard()]
		setFourCards(newCards)
		setRevealedCards({})
		setSelectedCard(null)
		setResult(null)
		setDealerCard(null)
		setPlayerCard(null)
		setGameType('cards')
		setGameActive(true)
	}

	const pickCard = (index) => {
		if (selectedCard !== null) return

		const chosen = fourCards[index]
		setSelectedCard(chosen)

		// Reveal all cards
		const revealed = {}
		fourCards.forEach((_, i) => {
			revealed[i] = true
		})
		setRevealedCards(revealed)

		// Dealer gets a card - house has slightly better odds
		const dealer = getRandomCard()
		setPlayerCard(chosen)
		setDealerCard(dealer)

		const playerVal = cardValues[chosen]
		const dealerVal = cardValues[dealer]

		let gameResult = ''
		let winnings = 0

		// House wins more regularly - if tie, dealer wins
		if (playerVal > dealerVal) {
			gameResult = 'win'
			winnings = Math.floor(bet * 1.5) // 1.5x payout
		} else {
			gameResult = 'loss'
			winnings = -bet
		}

		setResult({
			gameResult,
			winnings,
			message:
				gameResult === 'win'
					? `🎉 You won! Your ${chosen} beats dealer's ${dealer}! +${winnings} coins`
					: `💔 You lost! Dealer's ${dealer} beats or ties your ${chosen}. ${winnings} coins`
		})

		if (winnings !== 0) {
			addCoins(winnings)
		}
	}

	const startGame = (type) => {
		if (bet > player.coins || bet <= 0) {
			setResult({
				gameResult: 'error',
				message: 'Invalid bet amount!'
			})
			return
		}

		if (type === 'cards') {
			setupCardGame()
		}
	}

	const resetGame = () => {
		setGameType(null)
		setResult(null)
		setDealerCard(null)
		setPlayerCard(null)
		setFourCards([])
		setSelectedCard(null)
		setRevealedCards({})
		setGameActive(false)
	}

	return (
		<Panel title="🍺 The Tavern & Pub" className="col-span-full">
			<div className="my-2 space-y-3">
				<div className="rounded-lg border border-dusk/20 p-2">
					<div className="text-sm font-semibold text-ink">Coins: {player.coins}</div>
					<div className="flex items-center gap-2 mt-2">
						<label className="text-xs font-semibold text-ink/70">Bet:</label>
						<input
							type="number"
							value={bet}
							onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 0))}
							disabled={gameActive}
							className="w-20 rounded-lg border border-dusk/20 bg-parchment px-2 py-1 text-xs text-ink disabled:opacity-50"
						/>
					</div>
				</div>

				{!gameType ? (
					<button
						onClick={() => startGame('cards')}
						className="w-full rounded-lg border-2 border-ember/50 bg-ember/10 p-3 text-center hover:bg-ember/20 transition-all"
					>
						<div className="font-bold text-ink">🃏 Pick A Card</div>
						<div className="text-xs text-ink/70">Choose 1 of 4 cards and beat the dealer!</div>
					</button>
				) : (
					<div className="my-2 space-y-2">
						{selectedCard === null ? (
							<div className="grid grid-cols-4 gap-1">
								{fourCards.map((card, index) => (
									<button
										key={index}
										onClick={() => pickCard(index)}
										disabled={selectedCard !== null}
										className="aspect-square rounded-lg border-2 border-dusk/40 bg-dusk/20 hover:border-ember hover:bg-ember/30 transition-all flex items-center justify-center font-bold text-xl text-ink disabled:opacity-50"
									>
										🂠
									</button>
								))}
							</div>
						) : (
							<div className="my-2 space-y-2">
								<div className="grid grid-cols-4 gap-1">
									{fourCards.map((card, index) => (
										<div
											key={index}
											className={`aspect-square rounded-lg border-2 flex items-center justify-center font-bold text-lg ${
												index === fourCards.indexOf(selectedCard)
													? 'border-dusk/40 bg-dusk/10 text-ink border-b-4 border-b-ember'
													: 'border-dusk/40 bg-dusk/10 text-ink'
											}`}
										>
											{card}
										</div>
									))}
								</div>

								<div className="grid grid-cols-2 gap-2 text-center text-sm">
									<div className="rounded-lg border border-dusk/20 bg-dusk/10 p-2">
										<div className="text-xs text-ink/60">DEALER</div>
										<div className="text-2xl font-bold text-ink">{dealerCard}</div>
									</div>
									<div className="rounded-lg border border-dusk/20 bg-dusk/10 p-2">
										<div className="text-xs text-ink/60">YOU</div>
										<div className="text-2xl font-bold text-ink">{playerCard}</div>
									</div>
								</div>
							</div>
						)}

						{result && (
							<div className="rounded-lg p-3 border-2 border-dusk/20 text-center">
								<div className="text-sm font-semibold text-ink">{result.message}</div>
								<div className={`text-lg font-bold mt-1 ${result.winnings > 0 ? 'text-moss' : 'text-ember'}`}>
									{result.winnings > 0 ? '+' : ''}{result.winnings}
								</div>
							</div>
						)}

						{selectedCard !== null && (
							<Button variant="outline" className="w-full text-xs" onClick={resetGame}>
								Play Again
							</Button>
						)}
					</div>
				)}
			</div>
		</Panel>
	)
}
