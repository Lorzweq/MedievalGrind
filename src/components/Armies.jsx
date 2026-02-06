import { useState, useMemo } from 'react'
import { useGameStore } from '../State/gameStore.jsx'
import { Panel, Button, Badge } from './Ui.jsx'

export default function Armies() {
  const [selectedUnitId, setSelectedUnitId] = useState(null)
  const {
    armies,
    data,
    getTroop,
    recruitUnit,
    damageUnit,
    healUnit,
    dismissUnit,
    player,
    inventory,
    getTroopGear,
    getTroopGearStats,
    equipTroopGear,
    unequipTroopGear,
    getUnitMaxHp,
    getHealStatus
  } = useGameStore()

  const gearSlots = ['armor', 'helmet', 'ring', 'necklace']

  const armyArray = useMemo(() => Object.entries(armies), [armies])
  const unitsByType = useMemo(() => {
    const grouped = {}
    data.troops.forEach((troop) => {
      grouped[troop.id] = []
    })
    armyArray.forEach(([unitId, unit]) => {
      grouped[unit.troopType]?.push(unit)
    })
    return grouped
  }, [armies, data.troops, armyArray])

  const selectedUnit = selectedUnitId ? armies[selectedUnitId] : null
  const healStatus = selectedUnit ? getHealStatus(selectedUnit.id) : { canHeal: false, reason: 'No unit selected' }

  const itemById = useMemo(() => Object.fromEntries(data.items.map((item) => [item.id, item])), [data.items])
  const itemsBySlot = useMemo(() => {
    const grouped = { armor: [], helmet: [], ring: [], necklace: [] }
    data.items.forEach((item) => {
      if (item.type === 'gear' && grouped[item.slot]) grouped[item.slot].push(item)
    })
    return grouped
  }, [data.items])

  const formatStats = (stats) => {
    if (!stats) return ''
    const parts = []
    if (stats.hp) parts.push(`HP +${stats.hp}`)
    if (stats.attack) parts.push(`ATK +${stats.attack}`)
    if (stats.defense) parts.push(`DEF +${stats.defense}`)
    if (stats.speed) parts.push(`SPD +${stats.speed}`)
    return parts.join(', ')
  }

  const handleRecruit = (troopType) => {
    const success = recruitUnit(troopType)
    if (success) {
      // Brief visual feedback
    }
  }

  const getRecruitmentStatus = (troop) => {
    if (player.coins < troop.cost.coins) return 'Not enough coins'
    const canAfford = troop.cost.items.every((item) => (inventory[item.itemId] || 0) >= item.qty)
    if (!canAfford) return 'Missing items'
    return 'Ready'
  }

  return (
    <>
      <Panel title="⚔️ Army Recruitment" className="col-span-full">
        <div className="my-2 space-y-4">
          {/* Recruitment Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.troops.map((troop) => {
              const status = getRecruitmentStatus(troop)
              const canRecruit = status === 'Ready'
              const unitCount = unitsByType[troop.id]?.length || 0

              return (
                <div
                  key={troop.id}
                  className={`rounded-lg border-2 p-3 ${
                    canRecruit
                      ? 'border-moss/50 bg-moss/10 hover:border-moss hover:bg-moss/20'
                      : 'border-dusk/30 bg-dusk/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{troop.icon}</span>
                      <div>
                        <h4 className="font-bold text-dusk">{troop.name}</h4>
                        <p className="text-xs text-ink">{troop.description}</p>
                      </div>
                    </div>
                    <Badge>{unitCount}</Badge>
                  </div>

                  {/* Stats */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-ink">
                    <div>❤️ HP: {troop.baseStats.hp}</div>
                    <div>⚔️ ATK: {troop.baseStats.attack}</div>
                    <div>🛡️ DEF: {troop.baseStats.defense}</div>
                    <div>⚡ SPD: {troop.baseStats.speed}</div>
                  </div>

                  {/* Cost */}
                  <div className="mt-2 space-y-1 text-xs text-ink">
                    <div>💰 {troop.cost.coins} coins</div>
                    {troop.cost.items.map((item) => (
                      <div key={item.itemId}>
                        {item.qty}x {item.itemId.replace(/_/g, ' ')}
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="mt-3">
                    <Button
                      variant={canRecruit ? 'default' : 'outline'}
                      className="w-full text-xs"
                      disabled={!canRecruit}
                      onClick={() => handleRecruit(troop.id)}
                    >
                      {canRecruit ? 'Recruit' : status}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Panel>

      {/* Army Display */}
      <Panel title="👥 Your Army" className="col-span-full">
        {armyArray.length === 0 ? (
          <p className="text-center text-sm text-ink">No units recruited yet. Build an army above!</p>
        ) : (
          <div className="my-2 space-y-3">
            {data.troops.map((troop) => {
              const units = unitsByType[troop.id] || []
              if (units.length === 0) return null

              return (
                <div key={troop.id} className="rounded-lg border border-dusk/20 p-3">
                  <h4 className="mb-2 font-bold text-dusk">
                    {troop.icon} {troop.name} ({units.length})
                  </h4>
                  <div className="rounded-lg border border-dusk/20 p-2">
                    <div className="text-xs font-semibold text-dusk">Equipment (applies to all {troop.name})</div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {gearSlots.map((slot) => {
                        const gear = getTroopGear(troop.id)
                        const equippedId = gear[slot]
                        const options = itemsBySlot[slot].filter(
                          (item) => (inventory[item.id] || 0) > 0 || item.id === equippedId
                        )
                        const equippedItem = equippedId ? itemById[equippedId] : null

                        return (
                          <div key={slot} className="flex flex-col gap-1">
                            <label className="text-xs capitalize text-ink">{slot}</label>
                            <select
                              className="rounded-md border border-dusk/30 bg-ink/5 px-2 py-1 text-xs text-ink"
                              value={equippedId || ''}
                              onChange={(event) => {
                                const nextId = event.target.value
                                if (!nextId) {
                                  unequipTroopGear(troop.id, slot)
                                } else {
                                  equipTroopGear(troop.id, slot, nextId)
                                }
                              }}
                            >
                              <option value="">None</option>
                              {options.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                            {equippedItem?.stats ? (
                              <div className="text-[11px] text-ink">{formatStats(equippedItem.stats)}</div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-2 text-xs text-ink">
                      Total bonuses: {formatStats(getTroopGearStats(troop.id)) || 'None'}
                    </div>
                  </div>
                  <div className="my-2 space-y-2">
                    {units.map((unit) => {
                      const maxHp = getUnitMaxHp(unit)
                      const hpPercent = maxHp ? (unit.currentHp / maxHp) * 100 : 0
                      const isAlive = unit.currentHp > 0

                      return (
                        <div
                          key={unit.id}
                          onClick={() => setSelectedUnitId(unit.id)}
                          className={`cursor-pointer rounded-lg p-2 transition-all ${
                            selectedUnit?.id === unit.id
                              ? 'border-2 border-royal bg-royal/20'
                              : 'border border-dusk/20 hover:border-dusk/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-dusk">Lvl {unit.level}</span>
                            <span className={isAlive ? 'text-moss' : 'text-ember'}>
                              {unit.currentHp}/{maxHp} HP
                            </span>
                          </div>
                          {/* HP Bar */}
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-dusk/20">
                            <div
                              className={`h-full transition-all ${
                                hpPercent > 50 ? 'bg-moss' : hpPercent > 25 ? 'bg-ember' : 'bg-ember'
                              }`}
                            />
                          </div>
                          <div className="mt-1 text-xs text-ink">
                            XP: {unit.exp} • {getTroop(unit.troopType).name}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>

      {/* Unit Details */}
      {selectedUnit && (
        <Panel title={`📊 ${getTroop(selectedUnit.troopType).name} Details`} className="col-span-full animate-slide-in-right">
          <div className="my-2 space-y-4">
            {/* Stats */}
            <div className="rounded-lg border border-dusk/20 p-3">
              <h4 className="mb-2 font-bold text-dusk">Base Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-ink">HP:</span> {selectedUnit.currentHp}/{getUnitMaxHp(selectedUnit)}
                </div>
                <div>
                  <span className="text-ink">ATK:</span> {getTroop(selectedUnit.troopType).baseStats.attack}
                </div>
                <div>
                  <span className="text-ink">DEF:</span> {getTroop(selectedUnit.troopType).baseStats.defense}
                </div>
                <div>
                  <span className="text-ink">SPD:</span> {getTroop(selectedUnit.troopType).baseStats.speed}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-dusk/20 p-3">
              <h4 className="mb-2 font-bold text-dusk">Gear Bonuses</h4>
              <div className="text-sm text-ink">{formatStats(getTroopGearStats(selectedUnit.troopType)) || 'None'}</div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="success" disabled={!healStatus.canHeal} onClick={() => healUnit(selectedUnit.id, 20)}>
                ⚕️ {healStatus.reason || 'Heal'}
              </Button>
              <Button variant="outline" onClick={() => dismissUnit(selectedUnit.id)}>
                🗑️ Dismiss
              </Button>
              <Button variant="outline" onClick={() => setSelectedUnitId(null)}>
                ✕ Close
              </Button>
            </div>
          </div>
        </Panel>
      )}
    </>
  )
}
