import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { StreamerPage } from './pages/StreamerPage'
import LandingPage from './pages/LandingPage'
import PlaygroundPage from './pages/PlaygroundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/streamer/:ensName" element={<StreamerPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/test" element={<PlaygroundPage />} />
      </Route>
    </Routes>
  )
}
