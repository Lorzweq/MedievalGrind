const STORAGE_KEY = 'medieval-grind-save'

export function saveGame(state) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
	} catch (error) {
		console.error('Failed to save game', error)
	}
}

export function loadGame() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return null
		return JSON.parse(raw)
	} catch (error) {
		console.error('Failed to load game', error)
		return null
	}
}
