import { create } from 'zustand'
import items from '../Data/items.json'
import recipes from '../Data/recipes.json'
import buildings from '../Data/buildings.json'
import enemies from '../Data/enemies.json'
import expeditions from '../Data/expeditions.json'
import orders from '../Data/orders.json'
import troops from '../Data/troops.json'
import { now, getDateKey } from '../Utilities/time.jsx'
import { randomInt, rollChance } from '../Utilities/rng.jsx'
import { loadGame } from './saveLoad.jsx'
import { fakeBackend } from '../api/fakeBackend.js'

const itemIndex = Object.fromEntries(items.map((item) => [item.id, item]))
const recipeIndex = Object.fromEntries(recipes.map((recipe) => [recipe.id, recipe]))
const buildingIndex = Object.fromEntries(buildings.map((building) => [building.id, building]))
const enemyIndex = Object.fromEntries(enemies.map((enemy) => [enemy.id, enemy]))
const expeditionIndex = Object.fromEntries(expeditions.map((expedition) => [expedition.id, expedition]))
const troopIndex = Object.fromEntries(troops.map((troop) => [troop.id, troop]))
const gearSlots = ['armor', 'helmet', 'ring', 'necklace']
const unitLevelBonus = { hp: 6, attack: 1, defense: 1 }
const healCost = 35
const healCooldownMs = 45 * 1000

function createEmptyGearSet() {
  return {
    armor: null,
    helmet: null,
    ring: null,
    necklace: null
  }
}

function createEmptyStats() {
  return { hp: 0, attack: 0, defense: 0, speed: 0 }
}

function sumGearStats(gear) {
  const totals = createEmptyStats()
  if (!gear) return totals
  Object.values(gear).forEach((itemId) => {
    if (!itemId) return
    const stats = itemIndex[itemId]?.stats
    if (!stats) return
    totals.hp += stats.hp || 0
    totals.attack += stats.attack || 0
    totals.defense += stats.defense || 0
    totals.speed += stats.speed || 0
  })
  return totals
}

function getUnitLevelBonus(level) {
  const rank = Math.max(0, level - 1)
  return {
    hp: unitLevelBonus.hp * rank,
    attack: unitLevelBonus.attack * rank,
    defense: unitLevelBonus.defense * rank
  }
}

function createStarterInventory() {
  return {
    wood_log: 6,
    stone: 4,
    iron_ore: 3,
    scrap_cloth: 2
  }
}

function generateDailyOrders(dateKey) {
  const normal = orders.filter((order) => order.tier === 'normal')
  const royal = orders.filter((order) => order.tier === 'royal')
  return {
    dateKey,
    slots: [
      normal[0]?.id,
      normal[1]?.id,
      normal[2]?.id,
      royal[0]?.id
    ].filter(Boolean),
    completed: {}
  }
}

function clamp(value, min = 0) {
  return Math.max(min, value)
}

function canAfford(inventory, requirements) {
  return requirements.every((req) => (inventory[req.itemId] || 0) >= req.qty)
}

function applyDropTable(dropTable) {
  const drops = []
  dropTable.forEach((drop) => {
    if (rollChance(drop.chance)) {
      const qty = randomInt(drop.min, drop.max)
      drops.push({ itemId: drop.itemId, qty })
    }
  })
  return drops
}

export const useGameStore = create((set, get) => {
  const dateKey = getDateKey()
  const starterState = {
    meta: {
      version: 1,
      lastSave: now(),
      lastDailyReset: dateKey
    },
    player: {
      xp: 0,
      level: 1,
      coins: 1000,
      streak: 0
    },
    inventory: createStarterInventory(),
    troopGear: {},
    craftingQueues: {},
    expeditions: [],
    dailyOrders: generateDailyOrders(dateKey),
    armies: {}, // { unitId: { id, troopType, hp, currentHp, exp, level } }
    currentEnemy: null, // { enemyId, isRare }
    inBattle: false,
    town: {
      happiness: 75,
      water: 80,
      food: 70,
      population: 150,
      stability: 85,
      health: 60
    },
    logs: ['You arrive in Greenwood Outskirts. The town waits for your craft.']
  }

  const loaded = loadGame()

  return {
    data: { items, recipes, buildings, enemies, expeditions, orders, troops },
    ...starterState,
    ...(loaded || {}),

    // Helper: Remove all dead units
    cleanupDeadUnits() {
      const state = get()
      const livingArmies = {}
      Object.entries(state.armies).forEach(([id, unit]) => {
        if (unit.currentHp > 0) {
          livingArmies[id] = unit
        }
      })
      set({ armies: livingArmies })
      get().save?.()
    },

    // Helper: Get XP needed for next level
    getXpForNextLevel(level) {
      return level * 100 // Level 2 = 100 XP, Level 3 = 200 XP, etc.
    },

    // Helper: Get unit XP needed for next level
    getUnitXpForNextLevel(level) {
      return level * 60
    },

    // Helper: Check and apply level up
    checkLevelUp() {
      const state = get()
      const xpNeeded = get().getXpForNextLevel(state.player.level)
      
      if (state.player.xp >= xpNeeded) {
        const newLevel = state.player.level + 1
        set({
          player: {
            ...state.player,
            level: newLevel,
            xp: state.player.xp - xpNeeded
          },
          logs: [`🎉 Level Up! You are now level ${newLevel}!`, ...state.logs]
        })
        get().save?.()
        return true
      }
      return false
    },

    async save() {
      const { data, ...state } = get()
      const next = {
        ...state,
        meta: {
          ...state.meta,
          lastSave: now()
        }
      }
      try {
        await fakeBackend.saveGame(next)
        set(next)
      } catch (error) {
        console.error('Failed to save:', error)
      }
    },

    resetDailyIfNeeded() {
      const currentKey = getDateKey()
      const state = get()
      if (state.meta.lastDailyReset !== currentKey) {
        // Daily town stats decay
        const newTown = {
          happiness: Math.max(0, state.town.happiness - randomInt(3, 8)),
          water: Math.max(0, state.town.water - randomInt(5, 12)),
          food: Math.max(0, state.town.food - randomInt(4, 10)),
          population: state.town.population,
          stability: Math.max(0, state.town.stability - randomInt(2, 6)),
          health: Math.max(0, state.town.health - randomInt(3, 7))
        }

        // Population changes based on happiness and health
        if (newTown.happiness < 30 || newTown.health < 30) {
          newTown.population = Math.max(50, newTown.population - randomInt(5, 15))
        } else if (newTown.happiness > 70 && newTown.health > 70) {
          newTown.population = Math.min(500, newTown.population + randomInt(1, 5))
        }

        const newLogs = [`A new day dawns over the town. Orders refreshed!`]

        // Low chance of raider attack (5%)
        if (Math.random() < 0.05) {
          const damage = randomInt(10, 25)
          const goldLoss = randomInt(50, 200)
          const armyIds = Object.keys(state.armies)
          let unitsLost = 0

          // Damage random units
          if (armyIds.length > 0) {
            const unitsToHit = Math.min(randomInt(1, 3), armyIds.length)
            for (let i = 0; i < unitsToHit; i++) {
              const randomId = armyIds[Math.floor(Math.random() * armyIds.length)]
              const unit = state.armies[randomId]
              if (unit) {
                get().damageUnit(randomId, damage)
                if (unit.currentHp - damage <= 0) unitsLost++
              }
            }
          }

          newTown.stability = Math.max(0, newTown.stability - randomInt(15, 25))
          newTown.happiness = Math.max(0, newTown.happiness - randomInt(10, 20))
          
          newLogs.unshift(`⚠️ RAIDERS ATTACKED! Lost ${goldLoss} coins${unitsLost > 0 ? `, ${unitsLost} units killed` : ''}. Town morale shaken!`)
          
          set({
            player: {
              ...state.player,
              coins: Math.max(0, state.player.coins - goldLoss),
              streak: state.player.streak + 1
            }
          })
        } else {
          set({
            player: {
              ...state.player,
              streak: state.player.streak + 1
            }
          })
        }

        // Warnings for low stats
        if (newTown.food < 30) newLogs.push('⚠️ Food supplies are running low!')
        if (newTown.water < 30) newLogs.push('⚠️ Water shortage threatens the town!')
        if (newTown.happiness < 30) newLogs.push('⚠️ The people are unhappy and restless!')
        if (newTown.health < 30) newLogs.push('⚠️ Disease spreads through the town!')
        if (newTown.stability < 30) newLogs.push('⚠️ Civil unrest grows in the streets!')

        set({
          meta: {
            ...state.meta,
            lastDailyReset: currentKey
          },
          dailyOrders: generateDailyOrders(currentKey),
          town: newTown,
          logs: [...newLogs, ...state.logs]
        })
      }
    },

    // Improve town stats
    improveTownStat(stat, amount, cost) {
      const state = get()
      if (state.player.coins < cost) return false

      const statNames = {
        happiness: 'Happiness',
        water: 'Water',
        food: 'Food',
        stability: 'Stability',
        health: 'Health'
      }

      set({
        town: {
          ...state.town,
          [stat]: Math.min(100, state.town[stat] + amount)
        },
        player: {
          ...state.player,
          coins: state.player.coins - cost
        },
        logs: [`Improved ${statNames[stat]} by ${amount} for ${cost} coins`, ...state.logs]
      })
      get().save?.()
      return true
    },

    spendItems(requirements) {
      set((state) => {
        const next = { ...state.inventory }
        requirements.forEach((req) => {
          next[req.itemId] = clamp((next[req.itemId] || 0) - req.qty)
        })
        return { inventory: next }
      })
    },

    startCrafting(buildingId, recipeId) {
      const state = get()
      const building = buildingIndex[buildingId]
      const recipe = recipeIndex[recipeId]
      if (!building || !recipe) return

      const queue = state.craftingQueues[buildingId] || []
      if (queue.length >= building.queueSlots) return
      if (!canAfford(state.inventory, recipe.inputs)) return

      const startAt = now()
      const entry = {
        id: `${buildingId}-${startAt}`,
        recipeId,
        startAt,
        endAt: startAt + recipe.timeSec * 1000,
        status: 'crafting'
      }

      state.spendItems?.(recipe.inputs)

      set({
        craftingQueues: {
          ...state.craftingQueues,
          [buildingId]: [...queue, entry]
        },
        logs: [`${recipe.name} started at ${building.name}.`, ...state.logs]
      })

      get().save?.()
    },

    claimCrafting(buildingId, entryId) {
      const state = get()
      const queue = state.craftingQueues[buildingId] || []
      const entry = queue.find((item) => item.id === entryId)
      if (!entry || entry.endAt > now()) return
      const recipe = recipeIndex[entry.recipeId]
      if (!recipe) return

      recipe.outputs.forEach((output) => state.addItem?.(output.itemId, output.qty))

      set({
        craftingQueues: {
          ...state.craftingQueues,
          [buildingId]: queue.filter((item) => item.id !== entryId)
        },
        logs: [`${recipe.name} completed.`, ...state.logs]
      })

      get().save?.()
    },

    startExpedition(expeditionId) {
      const state = get()
      const expedition = expeditionIndex[expeditionId]
      if (!expedition) return

      const startAt = now()
      const entry = {
        id: `${expeditionId}-${startAt}`,
        expeditionId,
        startAt,
        endAt: startAt + expedition.durationSec * 1000,
        status: 'running'
      }

      set({
        expeditions: [entry, ...state.expeditions],
        logs: [`Expedition started: ${expedition.name}.`, ...state.logs]
      })

      get().save?.()
    },

    claimExpedition(runId) {
      const state = get()
      const run = state.expeditions.find((entry) => entry.id === runId)
      if (!run || run.endAt > now()) return
      const expedition = expeditionIndex[run.expeditionId]
      if (!expedition) return

      const enemyId = expedition.enemyPool[randomInt(0, expedition.enemyPool.length - 1)]
      const enemy = enemyIndex[enemyId]
      const rewards = [
        ...applyDropTable(expedition.rewards),
        ...applyDropTable(enemy?.drops || [])
      ]
      rewards.forEach((reward) => state.addItem?.(reward.itemId, reward.qty))

      set({
        expeditions: state.expeditions.filter((entry) => entry.id !== runId),
        logs: [
          `Expedition complete: defeated ${enemy?.name || 'unknown foe'}.`,
          ...state.logs
        ]
      })

      get().save?.()
    },

    completeOrder(orderId) {
      const state = get()
      const order = orders.find((o) => o.id === orderId)
      if (!order || state.dailyOrders.completed[orderId]) return
      if (!canAfford(state.inventory, order.requirements)) return

      state.spendItems?.(order.requirements)

      let coins = state.player.coins
      let xp = state.player.xp
      const rewardItems = []
      order.rewards.forEach((reward) => {
        if (reward.type === 'coin') coins += reward.qty
        if (reward.type === 'xp') xp += reward.qty
        if (reward.type === 'item') rewardItems.push(reward)
      })

      rewardItems.forEach((reward) => state.addItem?.(reward.itemId, reward.qty))

      set({
        player: { ...state.player, coins, xp },
        dailyOrders: {
          ...state.dailyOrders,
          completed: { ...state.dailyOrders.completed, [orderId]: true }
        },
        logs: [`Order delivered: ${orderId}.`, ...state.logs]
      })

      get().save?.()
    },

    addCoins(amount) {
      const state = get()
      set({
        player: { ...state.player, coins: state.player.coins + amount },
        logs: [`Received ${amount} coins.`, ...state.logs]
      })
      get().save?.()
    },

    addItem(itemId, qty) {
      const state = get()
      set({
        inventory: {
          ...state.inventory,
          [itemId]: (state.inventory[itemId] || 0) + qty
        },
        logs: [`Received ${qty}x ${itemId}.`, ...state.logs]
      })
      get().save?.()
    },

    getItemName(itemId) {
      return itemIndex[itemId]?.name || itemId
    },

    getItem(itemId) {
      return itemIndex[itemId]
    },

    getRecipe(recipeId) {
      return recipeIndex[recipeId]
    },

    getBuilding(buildingId) {
      return buildingIndex[buildingId]
    },

    getTroop(troopId) {
      return troopIndex[troopId]
    },

    getTroopGear(troopId) {
      const state = get()
      return state.troopGear[troopId] || createEmptyGearSet()
    },

    getTroopGearStats(troopId) {
      const gear = get().getTroopGear(troopId)
      return sumGearStats(gear)
    },

    getUnitMaxHp(unit) {
      const troop = troopIndex[unit.troopType]
      if (!troop) return unit.currentHp
      const levelBonus = getUnitLevelBonus(unit.level)
      const gearStats = get().getTroopGearStats(unit.troopType)
      return troop.baseStats.hp + gearStats.hp + levelBonus.hp
    },

    awardArmyXp(xpTotal) {
      const state = get()
      const livingUnits = Object.values(state.armies).filter((unit) => unit.currentHp > 0)
      if (livingUnits.length === 0) return { unitXp: 0, leveledUp: [] }

      const unitXp = Math.max(2, Math.floor(xpTotal / livingUnits.length))
      const leveledUp = []
      const nextArmies = { ...state.armies }

      livingUnits.forEach((unit) => {
        let nextExp = unit.exp + unitXp
        let nextLevel = unit.level
        let levelsGained = 0
        let xpNeeded = get().getUnitXpForNextLevel(nextLevel)

        while (nextExp >= xpNeeded) {
          nextExp -= xpNeeded
          nextLevel += 1
          levelsGained += 1
          xpNeeded = get().getUnitXpForNextLevel(nextLevel)
        }

        if (levelsGained > 0) {
          const maxHp = get().getUnitMaxHp({ ...unit, level: nextLevel })
          const newHp = Math.min(unit.currentHp + unitLevelBonus.hp * levelsGained, maxHp)
          nextArmies[unit.id] = {
            ...unit,
            level: nextLevel,
            exp: nextExp,
            currentHp: newHp
          }
          leveledUp.push({ unitId: unit.id, troopType: unit.troopType, level: nextLevel })
        } else {
          nextArmies[unit.id] = { ...unit, exp: nextExp }
        }
      })

      set({ armies: nextArmies })
      return { unitXp, leveledUp }
    },

    equipTroopGear(troopId, slot, itemId) {
      if (!gearSlots.includes(slot)) return false
      const item = itemIndex[itemId]
      if (!item || item.slot !== slot) return false

      const state = get()
      if ((state.inventory[itemId] || 0) < 1) return false

      const currentGear = state.troopGear[troopId] || createEmptyGearSet()
      const previousItemId = currentGear[slot]
      const nextGear = { ...currentGear, [slot]: itemId }

      const nextInventory = { ...state.inventory }
      nextInventory[itemId] = (nextInventory[itemId] || 0) - 1
      if (previousItemId) {
        nextInventory[previousItemId] = (nextInventory[previousItemId] || 0) + 1
      }

      const troop = troopIndex[troopId]
      const gearStats = sumGearStats(nextGear)
      const maxHp = troop ? troop.baseStats.hp + gearStats.hp : 0
      const nextArmies = { ...state.armies }
      Object.entries(state.armies).forEach(([unitId, unit]) => {
        if (unit.troopType !== troopId) return
        nextArmies[unitId] = {
          ...unit,
          currentHp: maxHp ? Math.min(unit.currentHp, maxHp) : unit.currentHp
        }
      })

      set({
        inventory: nextInventory,
        troopGear: { ...state.troopGear, [troopId]: nextGear },
        armies: nextArmies,
        logs: [`Equipped ${item.name} for ${troop?.name || troopId}.`, ...state.logs]
      })

      get().save?.()
      return true
    },

    unequipTroopGear(troopId, slot) {
      if (!gearSlots.includes(slot)) return false
      const state = get()
      const currentGear = state.troopGear[troopId] || createEmptyGearSet()
      const previousItemId = currentGear[slot]
      if (!previousItemId) return false

      const nextGear = { ...currentGear, [slot]: null }
      const nextInventory = { ...state.inventory }
      nextInventory[previousItemId] = (nextInventory[previousItemId] || 0) + 1

      const troop = troopIndex[troopId]
      const gearStats = sumGearStats(nextGear)
      const maxHp = troop ? troop.baseStats.hp + gearStats.hp : 0
      const nextArmies = { ...state.armies }
      Object.entries(state.armies).forEach(([unitId, unit]) => {
        if (unit.troopType !== troopId) return
        nextArmies[unitId] = {
          ...unit,
          currentHp: maxHp ? Math.min(unit.currentHp, maxHp) : unit.currentHp
        }
      })

      set({
        inventory: nextInventory,
        troopGear: { ...state.troopGear, [troopId]: nextGear },
        armies: nextArmies,
        logs: [`Unequipped ${itemIndex[previousItemId]?.name || previousItemId}.`, ...state.logs]
      })

      get().save?.()
      return true
    },

    recruitUnit(troopType) {
      const troop = troopIndex[troopType]
      if (!troop) return false

      const state = get()
      // Check if player can afford it
      if (state.player.coins < troop.cost.coins) return false
      if (!canAfford(state.inventory, troop.cost.items)) return false

      // Create new unit
      const unitId = `${troopType}-${Date.now()}`
      const newUnit = {
        id: unitId,
        troopType,
        hp: troop.baseStats.hp,
        currentHp: troop.baseStats.hp,
        exp: 0,
        level: 1,
        createdAt: now()
      }

      // Deduct cost
      const newInventory = { ...state.inventory }
      troop.cost.items.forEach((item) => {
        newInventory[item.itemId] -= item.qty
      })

      set({
        player: { ...state.player, coins: state.player.coins - troop.cost.coins },
        inventory: newInventory,
        armies: { ...state.armies, [unitId]: newUnit },
        logs: [`${troop.name} recruited!`, ...state.logs]
      })

      get().save?.()
      return true
    },

    damageUnit(unitId, damage) {
      const state = get()
      const unit = state.armies[unitId]
      if (!unit) return

      const newHp = Math.max(0, unit.currentHp - damage)
      
      // Remove unit if dead (0 HP)
      if (newHp <= 0) {
        const { [unitId]: removed, ...remainingArmies } = state.armies
        set({ armies: remainingArmies })
      } else {
        set({
          armies: {
            ...state.armies,
            [unitId]: { ...unit, currentHp: newHp }
          }
        })
      }

      get().save?.()
    },

    healUnit(unitId, healing) {
      const state = get()
      const unit = state.armies[unitId]
      if (!unit) return

      if (state.player.coins < healCost) return
      if (unit.lastHealAt && now() - unit.lastHealAt < healCooldownMs) return

      const maxHp = get().getUnitMaxHp(unit)
      const newHp = Math.min(maxHp, unit.currentHp + healing)
      set({
        player: {
          ...state.player,
          coins: state.player.coins - healCost
        },
        armies: {
          ...state.armies,
          [unitId]: { ...unit, currentHp: newHp, lastHealAt: now() }
        }
      })

      get().save?.()
    },

    getHealStatus(unitId) {
      const state = get()
      const unit = state.armies[unitId]
      if (!unit) return { canHeal: false, reason: 'No unit selected', remainingSec: 0 }
      if (state.player.coins < healCost) return { canHeal: false, reason: 'Not enough coins', remainingSec: 0 }
      const cooldownRemaining = unit.lastHealAt ? healCooldownMs - (now() - unit.lastHealAt) : 0
      if (cooldownRemaining > 0) {
        return { canHeal: false, reason: `Cooldown ${Math.ceil(cooldownRemaining / 1000)}s`, remainingSec: Math.ceil(cooldownRemaining / 1000) }
      }
      return { canHeal: true, reason: `Heal (${healCost} coins)`, remainingSec: 0 }
    },

    dismissUnit(unitId) {
      const state = get()
      const newArmies = { ...state.armies }
      delete newArmies[unitId]
      set({
        armies: newArmies,
        logs: [`Unit dismissed.`, ...state.logs]
      })
      get().save?.()
    },

    getArmyStats() {
      const state = get()
      const totals = {
        hpMax: 0,
        hpCurrent: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        unitCount: 0
      }

      const gearByTroop = {}

      Object.values(state.armies).forEach((unit) => {
        // Skip dead units
        if (unit.currentHp <= 0) return
        
        const troop = troopIndex[unit.troopType]
        if (!troop) return
        if (!gearByTroop[unit.troopType]) {
          gearByTroop[unit.troopType] = get().getTroopGearStats(unit.troopType)
        }

        const gearStats = gearByTroop[unit.troopType]
        const stats = troop.baseStats
        const levelBonus = getUnitLevelBonus(unit.level)
        const maxHp = stats.hp + gearStats.hp + levelBonus.hp
        totals.hpMax += maxHp
        totals.hpCurrent += Math.min(unit.currentHp, maxHp)
        totals.attack += stats.attack + gearStats.attack + levelBonus.attack
        totals.defense += stats.defense + gearStats.defense + levelBonus.defense
        totals.speed += stats.speed + gearStats.speed
        totals.unitCount += 1
      })

      return totals
    },

    calculateArmyPower(tactic = 'balanced') {
      const stats = get().getArmyStats()
      if (stats.unitCount === 0) return 0

      const healthPercent = stats.hpMax > 0 ? stats.hpCurrent / stats.hpMax : 0
      const tacticMods = {
        aggressive: { attack: 1.15, defense: 0.9, speed: 1.05 },
        defensive: { attack: 0.9, defense: 1.2, speed: 0.95 },
        skirmish: { attack: 1.0, defense: 0.95, speed: 1.2 },
        balanced: { attack: 1.0, defense: 1.0, speed: 1.0 }
      }
      const mods = tacticMods[tactic] || tacticMods.balanced

      const power =
        (stats.attack * mods.attack * 1.2 +
          stats.defense * mods.defense * 1.0 +
          stats.speed * mods.speed * 0.6) *
        healthPercent

      return Math.floor(power)
    },

    getBattlePreview(enemyId, tactic = 'balanced') {
      const state = get()
      const enemy = enemyIndex[enemyId]
      if (!enemy) return { winChance: 0, powerDiff: 0 }

      const enemyStats = get().getEnemyStats(enemyId)

      const armyPower = get().calculateArmyPower(tactic)
      const enemyPower = enemyStats.hp * 0.6 + enemyStats.attack * 1.2 + enemyStats.defense * 1.0 + enemyStats.speed * 0.5
      const powerDiff = armyPower - enemyPower
      const baseChance = 50 + powerDiff / 12
      const winChance = Math.min(95, Math.max(5, Math.round(baseChance)))

      return { winChance, powerDiff, armyPower, enemyPower, tactic }
    },

    getEnemyStats(enemyId) {
      const enemy = enemyIndex[enemyId]
      if (!enemy) return { hp: 10, attack: 6, defense: 4, speed: 6, units: [], totalUnits: 0, totalHp: 10 }
      
      // If it's an army with multiple units
      if (enemy.isArmy && enemy.units) {
        let totalHp = 0
        let totalAttack = 0
        let totalDefense = 0
        let totalSpeed = 0
        let totalUnits = 0
        const unitList = []
        
        enemy.units.forEach(unit => {
          const count = unit.count || 1
          totalHp += unit.hp * count
          totalAttack += unit.attack * count
          totalDefense += unit.defense * count
          totalSpeed += unit.speed * count
          totalUnits += count
          unitList.push({ ...unit, unitCount: count })
        })
        
        return {
          hp: Math.round(totalHp / totalUnits),
          attack: Math.round(totalAttack / totalUnits),
          defense: Math.round(totalDefense / totalUnits),
          speed: Math.round(totalSpeed / totalUnits),
          totalHp,
          totalUnits,
          units: unitList
        }
      }
      
      // Single enemy fallback
      return (
        enemy.stats || {
          hp: enemy.hp || 10,
          attack: enemy.attack || 6,
          defense: enemy.defense || 4,
          speed: enemy.speed || 6,
          totalUnits: 1,
          totalHp: enemy.hp || 10
        }
      )
    },

    applyBattleOutcome(enemyId, won, tactic = 'balanced', winChance = null) {
      const state = get()
      const enemy = enemyIndex[enemyId]
      if (!enemy) return { success: false, message: 'Enemy not found.' }

      const damageProfile = {
        aggressive: { win: [8, 18], lose: [25, 45] },
        defensive: { win: [4, 12], lose: [18, 35] },
        skirmish: { win: [6, 14], lose: [22, 38] },
        balanced: { win: [5, 15], lose: [20, 40] },
        manual: { win: [4, 12], lose: [18, 32] }
      }
      const dmg = damageProfile[tactic] || damageProfile.balanced

      if (won) {
        // Count units before damage
        const unitsBefore = Object.values(state.armies).filter(u => u.currentHp > 0).length
        
        // Enemy deals counter-damage even on victory
        const unitIds = Object.keys(state.armies)
        const damageCount = Math.ceil(unitIds.length * 0.5)
        for (let i = 0; i < damageCount; i++) {
          const randomUnit = unitIds[randomInt(0, unitIds.length - 1)]
          get().damageUnit(randomUnit, randomInt(dmg.win[0], dmg.win[1]))
        }

        // Count units after damage
        const unitsAfter = Object.values(get().armies).filter(u => u.currentHp > 0).length
        const unitsLost = unitsBefore - unitsAfter

        const drops = applyDropTable(enemy.drops || [])
        const newInventory = { ...state.inventory }
        drops.forEach((drop) => {
          newInventory[drop.itemId] = (newInventory[drop.itemId] || 0) + drop.qty
        })

        const goldDrop = enemy.goldDrop || { min: 10, max: 30 }
        const coinsReward = randomInt(goldDrop.min, goldDrop.max)
        const xpReward = randomInt(30, 90)

        const xpResult = get().awardArmyXp(xpReward)
        const unitXpLine = xpResult.unitXp > 0 ? `Army units gain ${xpResult.unitXp} XP each.` : ''
        const levelLine =
          xpResult.leveledUp.length > 0
            ? `Level ups: ${xpResult.leveledUp.map((unit) => `${unit.troopType} L${unit.level}`).join(', ')}`
            : ''
        const extraLines = [unitXpLine, levelLine].filter(Boolean)

        set({
          inventory: newInventory,
          player: {
            ...state.player,
            coins: state.player.coins + coinsReward,
            xp: state.player.xp + xpReward
          },
          logs: [
            `Victory! Defeated ${enemy.name} using ${tactic}. +${coinsReward} coins, +${xpReward} XP${unitsLost > 0 ? `, ${unitsLost} units lost` : ''}`,
            ...extraLines,
            ...state.logs
          ]
        })

        get().save?.()
        get().checkLevelUp() // Check for level up after XP gain
        get().cleanupDeadUnits() // Remove any dead units
        return { success: true, message: 'Victory!', drops, coinsReward, xpReward, winChance, tactic, unitsLost, unitXp: xpResult.unitXp, leveledUp: xpResult.leveledUp }
      }

      // Loss: Enemy deals heavy damage to all units
      Object.keys(state.armies).forEach((unitId) => {
        get().damageUnit(unitId, randomInt(dmg.lose[0], dmg.lose[1]))
      })

      set({
        logs: [`Defeated by ${enemy.name} using ${tactic}. Army retreats.`, ...state.logs]
      })

      get().save?.()
      return { success: false, message: `Defeated by ${enemy.name}!`, winChance, tactic }
    },

    battleEnemy(enemyId, tactic = 'balanced') {
      const state = get()
      const enemy = enemyIndex[enemyId]
      if (!state.armies || Object.keys(state.armies).length === 0) return { success: false, message: 'No units to fight!' }
      if (!enemy) return { success: false, message: 'Enemy not found.' }

      const armyStats = get().getArmyStats()
      const enemyStats = get().getEnemyStats(enemyId)
      
      // Town stats affect army performance
      let townPenalty = 0
      if (state.town.food < 30) townPenalty += 10 // Hungry soldiers fight worse
      if (state.town.health < 30) townPenalty += 10 // Sick soldiers are weak
      if (state.town.happiness < 30) townPenalty += 5 // Low morale
      if (state.town.stability < 40) townPenalty += 5 // Chaos affects discipline
      
      // Check if army has any living units
      if (armyStats.unitCount === 0 || armyStats.hpCurrent <= 0) {
        return { success: false, message: 'Your army has no living units!' }
      }
      
      // Calculate battle based on actual HP and stats
      const armyTotalHp = armyStats.hpCurrent
      const enemyTotalHp = enemyStats.totalHp || enemyStats.hp
      
      // Army needs at least 25% of enemy HP to have a chance
      if (armyTotalHp < enemyTotalHp * 0.25) {
        // Guaranteed loss if army is too weak
        return get().applyBattleOutcome(enemyId, false, tactic, 5)
      }
      
      // Calculate win chance based on HP ratio and combat stats
      const hpRatio = armyTotalHp / enemyTotalHp
      const attackAdvantage = (armyStats.attack - enemyStats.attack) * 2
      const defenseAdvantage = (armyStats.defense - enemyStats.defense) * 1.5
      const speedAdvantage = (armyStats.speed - enemyStats.speed) * 0.5
      
      // Tactic modifiers
      const tacticMods = {
        aggressive: { offense: 1.3, defense: 0.8 },
        defensive: { offense: 0.7, defense: 1.4 },
        balanced: { offense: 1.0, defense: 1.0 },
        skirmish: { offense: 1.1, defense: 1.1 }
      }
      const mod = tacticMods[tactic] || tacticMods.balanced
      
      // Calculate base chance from HP ratio (50% when equal HP)
      let baseChance = (hpRatio * 50) - townPenalty // Town issues reduce effectiveness
      
      // Add stat advantages
      baseChance += (attackAdvantage * mod.offense)
      baseChance += (defenseAdvantage * mod.defense)
      baseChance += speedAdvantage
      
      // Add small luck factor
      const luck = randomInt(-3, 3)
      const winChance = Math.min(95, Math.max(5, Math.round(baseChance + luck)))
      
      const won = rollChance(winChance)
      return get().applyBattleOutcome(enemyId, won, tactic, winChance)
    },

    getRandomEnemy() {
      const totalWeight = enemies.reduce((sum, enemy) => sum + (enemy.encounterWeight || 50), 0)
      let roll = randomInt(1, totalWeight)
      
      for (const enemy of enemies) {
        roll -= enemy.encounterWeight || 50
        if (roll <= 0) {
          const isRare = enemy.rarity === 'legendary' || enemy.rarity === 'rare'
          set({ currentEnemy: { enemyId: enemy.id, isRare }, inBattle: false })
          return { enemyId: enemy.id, isRare, enemy }
        }
      }
      
      const fallback = enemies[0]
      set({ currentEnemy: { enemyId: fallback.id, isRare: false }, inBattle: false })
      return { enemyId: fallback.id, isRare: false, enemy: fallback }
    },

    fleeFromBattle() {
      const state = get()
      if (!state.currentEnemy) return { success: false, message: 'No active battle!' }
      
      const enemy = enemyIndex[state.currentEnemy.enemyId]
      const unitIds = Object.keys(state.armies)
      
      if (unitIds.length === 0) {
        set({ currentEnemy: null, inBattle: false })
        return { success: true, message: 'Fled from battle.', casualties: [] }
      }

      // Flee mechanics: lose 10-30% of troops randomly
      const fleeChance = rollChance(0.7) // 70% chance to successfully flee
      const casualties = []
      
      if (fleeChance) {
        const lossPercent = randomInt(10, 30) / 100
        const lossCount = Math.ceil(unitIds.length * lossPercent)
        
        for (let i = 0; i < lossCount && unitIds.length > 0; i++) {
          const randomIndex = randomInt(0, unitIds.length - 1)
          const unitId = unitIds[randomIndex]
          const unit = state.armies[unitId]
          casualties.push({ ...unit })
          get().dismissUnit(unitId)
          unitIds.splice(randomIndex, 1)
        }
        
        set({
          currentEnemy: null,
          inBattle: false,
          logs: [`Fled from ${enemy?.name || 'enemy'}! Lost ${casualties.length} units.`, ...state.logs]
        })
        
        get().save?.()
        return { success: true, message: `Fled successfully! Lost ${casualties.length} troops.`, casualties }
      } else {
        // Failed to flee - take heavy damage
        unitIds.forEach((unitId) => {
          get().damageUnit(unitId, randomInt(20, 40))
        })
        
        set({
          logs: [`Failed to flee from ${enemy?.name || 'enemy'}! Army takes heavy damage.`, ...state.logs]
        })
        
        get().save?.()
        return { success: false, message: 'Failed to flee! Army damaged.', casualties: [] }
      }
    }
  }
})

