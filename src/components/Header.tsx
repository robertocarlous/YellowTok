import { Link } from 'react-router-dom'
import { ConnectButton } from './ConnectButton'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-blur border-b border-yt-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-yt-primary flex items-center justify-center group-hover:glow-yellow-sm transition-all duration-300">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              className="w-6 h-6"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path 
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xl font-bold">
            <span className="text-yt-text">Yellow</span>
            <span className="text-yt-primary">Tok</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className="text-yt-text-secondary hover:text-yt-text transition-colors duration-200 font-medium"
          >
            Lives
          </Link>
          <Link 
            to="/" 
            className="text-yt-text-secondary hover:text-yt-text transition-colors duration-200 font-medium"
          >
            Explore
          </Link>
        </nav>

        {/* Connect Wallet */}
        <ConnectButton />
      </div>
    </header>
  )
}
