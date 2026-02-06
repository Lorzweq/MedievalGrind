import { useState, useMemo, useEffect } from 'react'
import { useGameStore } from '../State/gameStore.jsx'
import { Panel, Button, Badge } from './Ui.jsx'

export default function Enemies() {
  const [battleResult, setBattleResult] = useState(null)
  const [inBattle, setInBattle] = useState(false)
  const [manualBattle, setManualBattle] = useState(null)
  const { 
    data, 
    armies, 
    currentEnemy,
    calculateArmyPower, 
    getBattlePreview, 
    getEnemyStats, 
    getArmyStats, 
    battleEnemy, 
    applyBattleOutcome,
    getRandomEnemy,
    fleeFromBattle
  } = useGameStore()

  const armySize = useMemo(() => Object.keys(armies).length, [armies])
  const armyPower = useMemo(() => calculateArmyPower(), [calculateArmyPower, armies])

  // Auto-generate enemy on mount if none exists
  useEffect(() => {
    if (!currentEnemy && armySize > 0) {
      getRandomEnemy()
    }
  }, [currentEnemy, armySize])

  const handleFlee = () => {
    const result = fleeFromBattle()
    setBattleResult(result)
    setInBattle(false)
    setManualBattle(null)
  }

  const handleNewEnemy = () => {
    getRandomEnemy()
    setBattleResult(null)
  }

  const handleBattle = (enemyId, tactic) => {
    console.log('handleBattle called with:', enemyId, tactic)
    if (armySize === 0) {
      setBattleResult({ success: false, message: 'You need units to fight!' })
      return
    }

    setInBattle(true)
    setTimeout(() => {
      const result = battleEnemy(enemyId, tactic)
      console.log('Battle result:', result)
      setBattleResult(result)
      setInBattle(false)
      
      // Auto-generate new enemy after battle
      if (result?.success) {
        setTimeout(() => {
          getRandomEnemy()
        }, 2000)
      }
    }, 1000)
  }

  const tactics = [
    { id: 'aggressive', label: 'Advance the Line', hint: 'Hard push, higher risk' },
    { id: 'balanced', label: 'Hold Formation', hint: 'Steady and safe' },
    { id: 'defensive', label: 'Shield Wall', hint: 'Safer, less damage' },
    { id: 'skirmish', label: 'Skirmish & Harry', hint: 'Swift hit and run' }
  ]

  const actions = [
    { id: 'strike', label: 'Move Infantry', hint: 'Solid advance' },
    { id: 'heavy', label: 'Cavalry Charge', hint: 'Big damage, risky' },
    { id: 'quick', label: 'Light Skirmish', hint: 'Fast, safer' },
    { id: 'aim', label: 'Archer Volley', hint: 'Precise volleys' },
    { id: 'power', label: 'Shield Break', hint: 'High impact' },
    { id: 'feint', label: 'Feigned Retreat', hint: 'Trick the enemy' },
    { id: 'brace', label: 'Brace Ranks', hint: 'Reduce damage' },
    { id: 'dodge', label: 'Loose Formation', hint: 'Avoid damage' },
    { id: 'parry', label: 'Counterstrike', hint: 'Defend then strike' },
    { id: 'rally', label: 'Rally the Troops', hint: 'Boost morale' }
  ]

  const startManualBattle = (enemy) => {
    const armyStats = getArmyStats()
    const enemyStats = getEnemyStats(enemy.id)
    if (armyStats.unitCount === 0) {
      setBattleResult({ success: false, message: 'You need units to fight!' })
      return
    }

    // Use total HP for armies, or regular HP for single enemies
    const totalEnemyHp = enemyStats.totalHp || enemyStats.hp || 100
    
    setManualBattle({
      enemyId: enemy.id,
      enemyName: enemy.name,
      enemyHp: totalEnemyHp,
      enemyMaxHp: totalEnemyHp,
      armyHp: armyStats.hpCurrent,
      armyMaxHp: armyStats.hpCurrent,
      initialArmyUnits: armyStats.unitCount,
      log: ['Battle started! Choose your actions.']
    })
    setBattleResult(null)
  }

  const applyManualAction = (actionId) => {
    if (!manualBattle) return
    const enemyStats = getEnemyStats(manualBattle.enemyId)
    const armyStats = getArmyStats()

    const atk = armyStats.attack || 10
    const def = armyStats.defense || 8
    const spd = armyStats.speed || 6
    const enemyAtk = enemyStats.attack || 6
    const enemyDef = enemyStats.defense || 4
    const enemySpd = enemyStats.speed || 6

    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    const profiles = {
      strike: { dmg: 0.9, taken: 0.6, note: 'A solid exchange.' },
      heavy: { dmg: 1.2, taken: 0.9, note: 'You swing hard.' },
      quick: { dmg: 0.7, taken: 0.4, note: 'Fast and safe.' },
      aim: { dmg: 1.0, taken: 0.7, note: 'A precise hit.' },
      power: { dmg: 1.4, taken: 1.0, note: 'All-in power push!' },
      feint: { dmg: 0.8, taken: 0.5, note: 'You trick the enemy.' },
      brace: { dmg: 0.5, taken: 0.2, note: 'You brace for impact.' },
      dodge: { dmg: 0.4, taken: 0.1, note: 'You dodge cleanly.' },
      parry: { dmg: 0.6, taken: 0.3, note: 'Parry and counter.' },
      rally: { dmg: 0.3, taken: 0.6, note: 'You rally the troops.' }
    }

    const profile = profiles[actionId] || profiles.strike
    const playerDamage = Math.max(3, Math.round((atk * profile.dmg * 1.3 - enemyDef * 0.25) + rand(2, 6)))
    const enemyDamage = Math.max(6, Math.round((enemyAtk * 3.0 * profile.taken - def * 0.1) + rand(4, 10)))

    const heal = actionId === 'rally' ? Math.round(Math.max(1, spd * 0.3)) : 0

    const newEnemyHp = Math.max(0, manualBattle.enemyHp - playerDamage)
    const newArmyHp = Math.max(0, manualBattle.armyHp - enemyDamage + heal)

    const nextLog = [
      `${profile.note} You deal ${playerDamage} damage${heal ? ` and heal ${heal}` : ''}. Enemy hits for ${enemyDamage}.`,
      ...manualBattle.log
    ]

    const nextState = { ...manualBattle, enemyHp: newEnemyHp, armyHp: newArmyHp, log: nextLog }
    setManualBattle(nextState)

    if (newEnemyHp <= 0 || newArmyHp <= 0) {
      const preview = getBattlePreview(manualBattle.enemyId, 'balanced')
      const result = applyBattleOutcome(manualBattle.enemyId, newEnemyHp <= 0, 'manual', preview.winChance)
      setBattleResult(result)
      setManualBattle(null)
    }
  }

  return (
    <>
      <Panel title="⚔️ Enemy Encounters" className="col-span-full">
        <div className="mb-4 rounded-lg border border-dusk/20 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink">Your Army Power:</span>
            <span className="font-bold text-moss">{armyPower}</span>
          </div>
          <div className="flex justify-between text-ink">
            <span>Units:</span>
            <span className="font-semibold">{armySize}</span>
          </div>
        </div>

        {armySize === 0 ? (
          <div className="rounded-lg border-2 border-ember/40 bg-ember/10 p-4 text-center">
            <p className="text-sm text-ink">
              🎖️ <strong>No army!</strong> You need at least 1 unit recruited in the Army section to fight enemies.
            </p>
            <div className="mt-3 text-xs text-ink">
              Go to the Armies section above and recruit some soldiers first.
            </div>
          </div>
        ) : !currentEnemy ? (
          <div className="rounded-lg border-2 border-dusk/30 p-4 text-center">
            <p className="text-sm text-ink mb-3">
              🔍 <strong>Searching for enemies...</strong>
            </p>
            <Button variant="primary" onClick={handleNewEnemy}>
              Scout for Enemies
            </Button>
          </div>
        ) : (
          <div className="my-2 space-y-3">
            {!data?.enemies?.length ? (
              <div className="rounded-lg bg-dusk/10 p-4 text-center">
                <p className="text-sm text-ink">Enemy data loading...</p>
              </div>
            ) : (() => {
              const enemy = data.enemies.find(e => e.id === currentEnemy?.enemyId)
              if (!enemy) {
                return (
                  <div className="rounded-lg bg-dusk/10 p-4 text-center">
                    <p className="text-sm text-ink">Enemy not found. <Button variant="outline" onClick={handleNewEnemy}>Scout New</Button></p>
                  </div>
                )
              }

              const stats = getEnemyStats(enemy.id)
              const previews = tactics.map((tactic) => getBattlePreview(enemy.id, tactic.id))
              const best = previews.reduce((acc, next) => (next.winChance > acc.winChance ? next : acc), previews[0])
              const bestLabel = tactics.find((t) => t.id === best.tactic)?.label || best.tactic
              const difficulty =
                best.winChance > 80 ? '🟢 Easy' : best.winChance > 60 ? '🟡 Medium' : best.winChance > 40 ? '🔴 Hard' : '💀 Deadly'

              const rarityColors = {
                common: 'border-dusk/30 bg-gradient-to-br from-dusk/10 to-ember/10',
                uncommon: 'border-green-500/50 bg-gradient-to-br from-green-500/20 to-green-600/10 animate-pulse-glow',
                rare: 'border-blue-500/60 bg-gradient-to-br from-blue-500/30 to-blue-600/15 animate-pulse-glow',
                legendary: 'border-amber-500/70 bg-gradient-to-br from-amber-500/40 to-amber-600/20 animate-pulse-glow-lg-amber-500/50'
              }

              return (
                <div className="my-2 space-y-3">
                  {currentEnemy.isRare && (
                    <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/20 p-3 text-center animate-pulse">
                      <span className="text-lg font-bold text-amber-700">
                        ⚠️ RARE ENCOUNTER! This enemy is exceptionally powerful! ⚠️
                      </span>
                    </div>
                  )}

                  <div className={`rounded-lg border-2 p-4 ${rarityColors[enemy.rarity] || rarityColors.common}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{enemy.icon}</span>
                        <div>
                          <h4 className="font-bold text-lg text-dusk">{enemy.name}</h4>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-ink">{difficulty}</p>
                            <Badge variant="default" className="text-xs capitalize">
                              {enemy.rarity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enemy Stats */}
                    <div className="mb-3">
                      {enemy.isArmy && enemy.units ? (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-dusk">🪖 Army Composition:</div>
                          <div className="grid grid-cols-2 gap-2">
                            {enemy.units.map((unit, idx) => (
                              <div key={idx} className="rounded border border-dusk/20 bg-dusk/5 p-2 text-xs">
                                <div className="font-semibold text-dusk">{unit.count}x {unit.type}</div>
                                <div className="text-ink">HP: {unit.hp} | ATK: {unit.attack} | DEF: {unit.defense}</div>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div className="rounded border border-dusk/20 p-2 text-center">
                              <div className="text-ink text-xs">❤️ Total HP</div>
                              <div className="font-bold text-dusk">{stats.totalHp}</div>
                            </div>
                            <div className="rounded border border-dusk/20 p-2 text-center">
                              <div className="text-ink text-xs">👥 Units</div>
                              <div className="font-bold text-dusk">{stats.totalUnits}</div>
                            </div>
                            <div className="rounded border border-dusk/20 p-2 text-center">
                              <div className="text-ink text-xs">⚔️ AVG ATK</div>
                              <div className="font-bold text-dusk">{stats.attack}</div>
                            </div>
                            <div className="rounded border border-dusk/20 p-2 text-center">
                              <div className="text-ink text-xs">🛡️ AVG DEF</div>
                              <div className="font-bold text-dusk">{stats.defense}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="rounded border border-dusk/20 p-2 text-center">
                            <div className="text-ink text-xs">❤️ HP</div>
                            <div className="font-bold text-dusk">{stats.hp}</div>
                          </div>
                          <div className="rounded border border-dusk/20 p-2 text-center">
                            <div className="text-ink text-xs">⚔️ ATK</div>
                            <div className="font-bold text-dusk">{stats.attack}</div>
                          </div>
                          <div className="rounded border border-dusk/20 p-2 text-center">
                            <div className="text-ink text-xs">🛡️ DEF</div>
                            <div className="font-bold text-dusk">{stats.defense}</div>
                          </div>
                          <div className="rounded border border-dusk/20 p-2 text-center">
                            <div className="text-ink text-xs">⚡ SPD</div>
                            <div className="font-bold text-dusk">{stats.speed}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Advisor Recommendation */}
                    <div className="mb-3 rounded-md border border-dusk/20 px-3 py-2 text-sm text-dusk/80">
                      🧙‍♂️ Advisor counsels: <span className="font-semibold text-royal">{bestLabel}</span>
                    </div>

                    {/* Battle Options */}
                    <div className="grid gap-2 mb-3">
                      {tactics.map((tactic) => {
                        const preview = previews.find((p) => p.tactic === tactic.id) || { winChance: 0, tactic: tactic.id }
                        return (
                          <button
                            key={tactic.id}
                            className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-all ${
                              best.tactic === tactic.id
                                ? 'border-royal bg-royal/20 text-dusk font-semibold'
                                : 'border-dusk/30 text-dusk/80 hover:border-dusk/50 hover:bg-dusk/5'
                            }`}
                            disabled={inBattle}
                            onClick={() => handleBattle(enemy.id, tactic.id)}
                          >
                            <div>
                              <span>{tactic.label}</span>
                            </div>
                            <div className="text-xs text-ink">{tactic.hint}</div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        disabled={inBattle}
                        onClick={() => startManualBattle(enemy)}
                      >
                        🎯 Manual Battle
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-ember/20 hover:bg-ember/30"
                        disabled={inBattle}
                        onClick={handleFlee}
                      >
                        🏃 Flee (Lose 10-30% troops)
                      </Button>
                    </div>
                  </div>

                  <Button variant="primary" className="w-full" onClick={handleNewEnemy} disabled={inBattle}>
                    🔍 Search for New Enemy
                  </Button>
                </div>
              )
            })()}
          </div>
        )}
      </Panel>

      {/* Manual Battle Panel */}
      {manualBattle && (
        <Panel title={`🎯 Manual Battle: ${manualBattle.enemyName}`} className="col-span-full animate-slide-in-right">
          <div className="my-2 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-dusk/20 p-3">
                <div className="mb-2 text-xs font-semibold text-ink">Your Army</div>
                <div className="text-sm font-bold text-moss">{manualBattle.armyHp}/{manualBattle.armyMaxHp} HP</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-dusk/20">
                  <div
                    className="h-full bg-moss transition-all"
                    style={{ width: `${Math.max(0, (manualBattle.armyHp / manualBattle.armyMaxHp) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-dusk/20 p-3">
                <div className="mb-2 text-xs font-semibold text-ink">Enemy</div>
                <div className="text-sm font-bold text-ember">{manualBattle.enemyHp}/{manualBattle.enemyMaxHp} HP</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-dusk/20">
                  <div
                    className="h-full bg-ember transition-all"
                    style={{ width: `${Math.max(0, (manualBattle.enemyHp / manualBattle.enemyMaxHp) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => applyManualAction(action.id)}
                  className="rounded-md border border-dusk/30 px-2 py-2 text-xs font-semibold text-dusk hover:border-dusk/50 hover:bg-dusk/10"
                >
                  {action.label}
                  <div className="text-[10px] text-ink">{action.hint}</div>
                </button>
              ))}
            </div>

            <div className="rounded-lg bg-parchment/80 p-3 text-xs text-dusk/80">
              <div className="mb-2 font-semibold">Battle Log</div>
              <div className="my-2 space-y-1">
                {manualBattle.log.slice(0, 6).map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setManualBattle(null)}>
                ✕ Exit Battle
              </Button>
              <Button variant="outline" className="bg-ember/20 hover:bg-ember/30" onClick={handleFlee}>
                🏃 Flee
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* Battle Result */}
      {battleResult && (
        <Panel
          title={battleResult.success ? '🏆 Victory!' : '💀 Defeat!'}
          className="col-span-full animate-slide-in-right"
        >
          <div className="my-2 space-y-3">
            <p className="text-sm text-dusk/80">{battleResult.message}</p>
            {battleResult.tactic && (
              <div className="text-xs text-ink">
                Tactic: <span className="font-semibold text-royal">{battleResult.tactic}</span>
              </div>
            )}

            {battleResult.success && (
              <div className="rounded-lg bg-moss/20 p-3">
                <h4 className="mb-2 font-bold text-moss">Rewards:</h4>
                <div className="my-2 space-y-1 text-sm text-dusk/80">
                  <div>💰 +{battleResult.coinsReward} coins</div>
                  <div>⭐ +{battleResult.xpReward} XP</div>
                  {battleResult.unitsLost > 0 && (
                    <div className="text-ember font-semibold">💀 {battleResult.unitsLost} units lost</div>
                  )}
                  {battleResult.drops?.length > 0 && (
                    <div>
                      <div className="font-semibold">Items:</div>
                      <ul className="list-inside list-disc text-xs">
                        {battleResult.drops.map((drop, idx) => (
                          <li key={idx}>
                            {drop.qty}x {drop.itemId}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!battleResult.success && (
              <div className="rounded-lg bg-ember/20 p-3">
                <p className="text-sm text-dusk/80">Your army took heavy damage. Heal your units before the next battle!</p>
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={() => setBattleResult(null)}>
              ✕ Close
            </Button>
          </div>
        </Panel>
      )}
    </>
  )
}
