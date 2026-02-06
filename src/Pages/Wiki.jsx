import { Panel } from '../components/Ui.jsx'

export default function Wiki() {
	return (
		<Panel title="Age of Ash and Iron">
			<div className="my-2 space-y-4 text-sm text-dusk/80">
				<p>
					The world never promised mercy. After the Sundering War, thrones turned to ash and banners to rags.
					Roads exist because the desperate keep walking them. Steel is rare, food rarer, and trust is a
					currency most can’t afford.
				</p>
				<p className="font-semibold text-dusk">
					You are not chosen. You are not blessed. You are alive — and that is already a victory.
				</p>
				<div className="my-2 space-y-2">
					<h3 className="text-xs font-bold uppercase tracking-[0.2em] text-dusk">The Low Kingdoms</h3>
					<ul className="list-disc space-y-1 pl-5">
						<li>Fields must be worked daily or they die.</li>
						<li>Mines collapse as often as they yield ore.</li>
						<li>Forests breed beasts warped by old spells.</li>
						<li>Ruins whisper power — and curses that never fade.</li>
					</ul>
					<p className="text-xs text-ink">Travel is slow. Death is fast.</p>
				</div>
				<div className="my-2 space-y-2">
					<h3 className="text-xs font-bold uppercase tracking-[0.2em] text-dusk">The People</h3>
					<ul className="list-disc space-y-1 pl-5">
						<li>Peasants trade blood for bread.</li>
						<li>Mercenaries sell years for a handful of silver.</li>
						<li>Blacksmiths spend weeks forging blades that may shatter in one fight.</li>
						<li>Clerics heal with poultices and exhaustion, not miracles.</li>
						<li>Lords remain — but most are warlords with titles older than their morals.</li>
					</ul>
				</div>
				<div className="my-2 space-y-2">
					<h3 className="text-xs font-bold uppercase tracking-[0.2em] text-dusk">Power & Progress</h3>
					<ul className="list-disc space-y-1 pl-5">
						<li>Skills rise only when pain has taught them.</li>
						<li>Armor protects but drags you toward the grave.</li>
						<li>Weapons dull, break, and must be repaired or reforged.</li>
						<li>Hunger, sickness, and cold kill faster than monsters.</li>
					</ul>
					<p className="text-xs text-ink">
						Magic exists, but it drains the body, twists the mind, and marks the soul.
					</p>
				</div>
				<div className="my-2 space-y-2">
					<h3 className="text-xs font-bold uppercase tracking-[0.2em] text-dusk">Death</h3>
					<p>
						Most die unnamed in ditches. A few are remembered in songs — usually wrong. The dead leave tools,
						not legends. Graves are shallow because digging steals time from survival.
					</p>
				</div>
				<div className="my-2 space-y-2">
					<h3 className="text-xs font-bold uppercase tracking-[0.2em] text-dusk">Your Place in It</h3>
					<p>No land. No title. No prophecy. Only rough hands, a tired body, and the will to keep moving.</p>
					<p className="text-xs text-ink">
						Maybe you become a veteran soldier. Maybe a master craftsman. Maybe a feared bandit. Maybe a ruler
						carved out of blood and iron. Or maybe you just last longer than most.
					</p>
					<p className="font-semibold text-dusk">In this world, endurance is the highest virtue.</p>
				</div>
			</div>
		</Panel>
	)
}
