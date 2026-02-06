import { now } from '../Utilities/time.jsx'

export function isReady(entry) {
	return entry && entry.endAt <= now()
}

export function remainingMs(entry) {
	if (!entry) return 0
	return Math.max(0, entry.endAt - now())
}
