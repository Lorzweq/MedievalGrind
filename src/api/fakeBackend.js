// Simulates a backend server with realistic delays
// In production, replace with real HTTP calls

const STORAGE_KEY = 'medieval-grind-save'
const DELAY_MS = 50 // Reduced from 300ms for better responsiveness

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const fakeBackend = {
  // Save game state to "server"
  async saveGame(state) {
    await sleep(DELAY_MS)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      return { success: true, timestamp: Date.now() }
    } catch (error) {
      console.error('Save failed:', error)
      throw new Error('Failed to save game')
    }
  },

  // Load game state from "server"
  async loadGame() {
    await sleep(DELAY_MS)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { success: true, data: null }
      return { success: true, data: JSON.parse(raw) }
    } catch (error) {
      console.error('Load failed:', error)
      throw new Error('Failed to load game')
    }
  },

  // Process crafting completion on server
  async completeCrafting(gameState, buildingId, entryId) {
    await sleep(DELAY_MS)
    // Validate on "server"
    const queue = gameState.craftingQueues[buildingId] || []
    const entry = queue.find((item) => item.id === entryId)
    if (!entry) throw new Error('Craft not found')
    if (entry.endAt > Date.now()) throw new Error('Craft not ready')
    return { success: true, entryId }
  },

  // Process expedition completion on server
  async completeExpedition(gameState, runId) {
    await sleep(DELAY_MS)
    // Validate on "server"
    const run = gameState.expeditions.find((entry) => entry.id === runId)
    if (!run) throw new Error('Expedition not found')
    if (run.endAt > Date.now()) throw new Error('Expedition not ready')
    return { success: true, runId }
  },

  // Validate and process daily order on server
  async completeOrder(gameState, orderId) {
    await sleep(DELAY_MS)
    // Validate on "server"
    if (gameState.dailyOrders.completed[orderId]) {
      throw new Error('Order already completed')
    }
    return { success: true, orderId }
  },

  // Get server time (for sync checks)
  async getServerTime() {
    await sleep(50)
    return { timestamp: Date.now() }
  },

  // Heartbeat to track daily reset
  async checkDailyReset(lastDailyReset) {
    await sleep(50)
    const today = new Date().toISOString().split('T')[0]
    if (lastDailyReset !== today) {
      return { reset: true, newDate: today }
    }
    return { reset: false }
  }
}
