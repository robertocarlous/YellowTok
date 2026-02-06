import { Link } from 'react-router-dom'
import { useEnsName } from 'wagmi'
import { LiveVideoCard } from '../components/LiveVideoCard'
import { ENS_CHAIN_ID } from '../config/chains'

// Get streamer address from environment
const STREAMER_ADDRESS = import.meta.env.VITE_STREAMER_ADDRESS as `0x${string}` | undefined

export function HomePage() {
  // Fallback address if env not set
  const streamerAddress: `0x${string}` = STREAMER_ADDRESS ?? '0xb3173d618e51277372B473e02E8ab05e97A3626c'

  // Get ENS name for profile link
  const { data: ensName } = useEnsName({
    address: streamerAddress,
    chainId: ENS_CHAIN_ID,
  })

  const profilePath = ensName ? `/streamer/${ensName}` : `/streamer/${streamerAddress}`

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-yt-bg">
      {/* Main content - Full screen video feed like TikTok */}
      <div className="h-[calc(100vh-4rem)] w-full max-w-lg mx-auto md:py-4">
        <LiveVideoCard streamerAddress={streamerAddress} />
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-yt-bg border-t border-yt-border">
        <div className="flex items-center justify-around h-16">
          <button className="flex flex-col items-center gap-1 text-yt-primary">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-yt-text-secondary">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">Explore</span>
          </button>

          {/* Center button - Go Live */}
          <button className="relative -top-4">
            <div className="w-14 h-10 bg-gradient-to-r from-yt-primary to-yt-primary-light rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yt-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>

          <button className="flex flex-col items-center gap-1 text-yt-text-secondary">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs">Messages</span>
          </button>

          <Link to={profilePath} className="flex flex-col items-center gap-1 text-yt-text-secondary hover:text-yt-primary transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
