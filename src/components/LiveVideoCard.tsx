import { useEnsName, useEnsAvatar, useEnsText } from 'wagmi'
import { normalize } from 'viem/ens'
import { Link } from 'react-router-dom'
import { ENS_CHAIN_ID } from '../config/chains'
import { TipSystem } from './TipSystem'

interface LiveVideoCardProps {
  streamerAddress: `0x${string}`
}

export function LiveVideoCard({ streamerAddress }: LiveVideoCardProps) {
  // ENS data
  const { data: ensName, isLoading: isLoadingName } = useEnsName({
    address: streamerAddress,
    chainId: ENS_CHAIN_ID,
  })

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: ENS_CHAIN_ID,
  })

  const { data: description } = useEnsText({
    name: ensName ? normalize(ensName) : undefined,
    key: 'description',
    chainId: ENS_CHAIN_ID,
  })

  const displayName = ensName ?? `${streamerAddress.slice(0, 6)}...${streamerAddress.slice(-4)}`
  const linkPath = ensName ? `/streamer/${ensName}` : `/streamer/${streamerAddress}`

  return (
    <div className="relative w-full h-full bg-yt-bg-elevated rounded-2xl overflow-hidden group">
      {/* Tip System - Área interactiva con animaciones */}
      <TipSystem className="absolute inset-0 z-10" />

      {/* Video Background (simulated) */}
      <div className="absolute inset-0 bg-gradient-to-br from-yt-surface via-yt-bg-elevated to-yt-surface">
        {/* Animated gradient background simulating video */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yt-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yt-primary-light/10 rounded-full blur-2xl animate-pulse delay-700" />
        </div>

        {/* Streamer Avatar Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Avatar ring */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-r from-yt-primary to-yt-primary-light">
              <div className="w-full h-full rounded-full overflow-hidden bg-yt-bg">
                {ensAvatar ? (
                  <img 
                    src={ensAvatar} 
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yt-primary/50 to-yt-primary-light/50 flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-bold text-yt-text">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Live indicator */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-yt-live text-white text-xs font-bold rounded-md animate-pulse-live flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full" />
                LIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 video-gradient" />

      {/* Content overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
        {/* Top section */}
        <div className="flex items-start justify-between z-20 pointer-events-auto">
          {/* Viewers count */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
            <svg className="w-4 h-4 text-yt-text" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-yt-text">1.2K</span>
          </div>

          {/* Duration */}
          <div className="px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
            <span className="text-sm font-medium text-yt-text">02:34:15</span>
          </div>
        </div>

        {/* Bottom section */}
        <div className="space-y-4 z-20 pointer-events-auto">
          {/* Streamer info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yt-primary flex-shrink-0">
              {ensAvatar ? (
                <img src={ensAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yt-primary to-yt-primary-light" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link 
                to={linkPath}
                className="font-bold text-yt-text hover:text-yt-primary transition-colors truncate block"
              >
                {isLoadingName ? (
                  <span className="inline-block w-24 h-5 bg-yt-surface animate-pulse rounded" />
                ) : (
                  displayName
                )}
              </Link>
              <p className="text-sm text-yt-text-secondary truncate">
                {description ?? 'Streaming on YellowTok'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Link
              to={linkPath}
              className="flex-1 btn-yellow py-3 bg-yt-primary text-yt-bg font-semibold rounded-xl text-center hover:bg-yt-primary-hover transition-all"
            >
              View profile
            </Link>
            <button className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6 text-yt-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6 text-yt-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Side action bar (TikTok style) */}
      <div className="absolute right-4 bottom-48 flex flex-col items-center gap-6 z-40 pointer-events-auto">
        {/* Like button */}
        <button className="flex flex-col items-center gap-1 group/btn">
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full group-hover/btn:bg-yt-primary/20 transition-colors">
            <svg className="w-7 h-7 text-yt-text group-hover/btn:text-yt-primary transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs text-yt-text font-medium">24.5K</span>
        </button>

        {/* Comments */}
        <button className="flex flex-col items-center gap-1 group/btn">
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full group-hover/btn:bg-yt-primary/20 transition-colors">
            <svg className="w-7 h-7 text-yt-text group-hover/btn:text-yt-primary transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs text-yt-text font-medium">1.2K</span>
        </button>
      </div>
    </div>
  )
}
