import { BrowserRouter } from 'react-router-dom'
import RoutesView from './routes.jsx'
import Layout from '../components/Layout.jsx'

export default function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<Layout>
				<RoutesView />
			</Layout>
		</BrowserRouter>
	)
}
