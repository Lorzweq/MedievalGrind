import { useState } from 'react'
import { Panel, Button } from './Ui.jsx'
import { useGameStore } from '../State/gameStore.jsx'
import zones from '../Data/zones.json'

export default function Map() {
  const [selectedZone, setSelectedZone] = useState(null)
  const { player } = useGameStore()
  const gridCols = Math.max(...zones.map(z => z.position.x)) + 1

  const handleZoneClick = (zone) => {
    if (zone.unlocked) {
      setSelectedZone(zone)
    }
  }

  const canUnlock = (zone) => player.level >= zone.level
  return (
    <Panel title="🗺️ World Map" className="col-span-full">
      <div className="my-2 space-y-6">
        {/* Map Grid */}
        <div className="p-6 bg-dusk/10 rounded-xl border border-dusk/20">
          {zones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => handleZoneClick(zone)}
              className={`
                rounded-xl p-4 text-center transition-all cursor-pointer
                ${zone.unlocked
                  ? 'bg-gradient-to-br from-moss/30 to-moss/10 border-2 border-moss/50 hover:border-moss'
                  : canUnlock(zone)
                  ? 'bg-gradient-to-br from-royal/20 to-transparent border-2 border-royal/40 hover:border-royal/60 opacity-75'
                  : 'bg-gradient-to-br from-dusk/20 to-transparent border-2 border-dusk/30 opacity-60'
                }
              `}
            >
              <div className="text-4xl mb-2">{zone.icon}</div>
              <h3 className="font-bold text-sm text-dusk">{zone.name}</h3>
              <div className="text-xs text-ink mt-1">
                Level {zone.level}
              </div>
              {!zone.unlocked && canUnlock(zone) && (
                <div className="text-xs text-royal mt-2 font-semibold">
                  🔓 Ready to Unlock
                </div>
              )}
              {!zone.unlocked && !canUnlock(zone) && (
                <div className="text-xs text-dusk/50 mt-2 font-semibold">
                  🔒 Level {zone.level} Required
                </div>
              )}
              {zone.unlocked && (
                <div className="text-xs text-moss mt-2 font-semibold">
                  ✓ Active
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Zone Details */}
        {selectedZone && (
          <div className="rounded-lg bg-gradient-to-br from-royal/20 to-moss/20 border-2 border-royal/40 p-4 animate-slide-in-right">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedZone.icon}</span>
                <div>
                  <h3 className="font-bold text-dusk text-lg">{selectedZone.name}</h3>
                  <p className="text-xs text-ink">Level {selectedZone.level}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedZone(null)}>✕</Button>
            </div>
            <p className="text-sm text-dusk/80 mb-3">{selectedZone.description}</p>
            <div className="text-xs text-ink">
              {selectedZone.expeditions.length > 0 ? (
                <div>
                  <div className="font-semibold mb-2">📍 Available Expeditions:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedZone.expeditions.map(expId => (
                      <li key={expId} className="text-dusk/80">{expId.replace(/_/g, ' ').toUpperCase()}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <span className="text-dusk/50">🔮 More expeditions coming soon...</span>
              )}
            </div>
          </div>
        )}

        {/* Zone Overview */}
        <div className="rounded-lg border border-dusk/20 p-4">
          <div className="text-xs text-ink">
            <div className="font-semibold mb-2">🗺️ Zone Progress</div>
            <div className="my-2 space-y-1">
              <div className="flex justify-between">
                <span>Unlocked Zones:</span>
                <span className="font-semibold text-moss">{zones.filter(z => z.unlocked).length}/{zones.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Unlockable Next:</span>
                <span className="font-semibold text-royal">
                  {zones.find(z => !z.unlocked && canUnlock(z))?.name || 'None available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
