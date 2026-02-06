import { Route, Routes } from 'react-router-dom'
import Play from '../Pages/Play.jsx'
import Wiki from '../Pages/Wiki.jsx'
import Guides from '../Pages/Guides.jsx'
import Tools from '../Pages/Tools.jsx'

export default function RoutesView() {
	return (
		<Routes>
			<Route path="/" element={<Play />} />
			<Route path="/play" element={<Play />} />
			<Route path="/wiki" element={<Wiki />} />
			<Route path="/guides" element={<Guides />} />
			<Route path="/tools" element={<Tools />} />
		</Routes>
	)
}
