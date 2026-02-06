import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="min-h-screen bg-yt-bg">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}
