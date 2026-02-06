import Game from '../components/Game.jsx'
import { Panel } from '../components/Ui.jsx'

export default function Play() {
  return (
    <div className="my-2 space-y-6">
      <Panel className="border-2 border-royal/30">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-wide bg-gradient-to-r from-royal via-ember to-moss bg-clip-text text-transparent">
            ⚔️ Greenwood Outskirts ⚔️
          </h1>
          <p className="text-sm text-dusk/80 max-w-2xl mx-auto">
            Daily orders arrive at dawn. Long expeditions reward rare scraps, while patrols can be run endlessly for
            modest gains. Craft, trade, and conquer!
          </p>
        </div>
      </Panel>
      <Game />
    </div>
  )
}
