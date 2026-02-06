import { useParams, Link } from 'react-router-dom'
import { useEnsAddress, useEnsAvatar, useEnsText } from 'wagmi'
import { normalize } from 'viem/ens'
import { isAddress } from 'viem'
import { ENS_CHAIN_ID } from '../config/chains'

export function StreamerPage() {
  const { ensName } = useParams<{ ensName: string }>()
  
  // Check if ensName is actually an address
  const isAddressParam = ensName && isAddress(ensName)
  
  // Get address from ENS name (if it's an ENS name, not an address)
  const { data: resolvedAddress, isLoading: isLoadingAddress } = useEnsAddress({
    name: !isAddressParam && ensName ? normalize(ensName) : undefined,
    chainId: ENS_CHAIN_ID,
  })

  const address = isAddressParam ? ensName as `0x${string}` : resolvedAddress

  // ENS data
  const { data: ensAvatar, isLoading: isLoadingAvatar } = useEnsAvatar({
    name: ensName && !isAddressParam ? normalize(ensName) : undefined,
    chainId: ENS_CHAIN_ID,
  })

  const { data: description } = useEnsText({
    name: ensName && !isAddressParam ? normalize(ensName) : undefined,
    key: 'description',
    chainId: ENS_CHAIN_ID,
  })

  const { data: twitter } = useEnsText({
    name: ensName && !isAddressParam ? normalize(ensName) : undefined,
    key: 'com.twitter',
    chainId: ENS_CHAIN_ID,
  })

  const { data: url } = useEnsText({
    name: ensName && !isAddressParam ? normalize(ensName) : undefined,
    key: 'url',
    chainId: ENS_CHAIN_ID,
  })

  const { data: email } = useEnsText({
    name: ensName && !isAddressParam ? normalize(ensName) : undefined,
    key: 'email',
    chainId: ENS_CHAIN_ID,
  })

  const displayName = isAddressParam 
    ? `${ensName?.slice(0, 6)}...${ensName?.slice(-4)}` 
    : ensName

  const isLoading = isLoadingAddress || isLoadingAvatar

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-yt-bg pb-20">
      {/* Profile Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-yt-primary/30 via-yt-surface to-yt-bg-elevated relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-yt-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yt-primary-light/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>
          
          {/* Back button */}
          <Link 
            to="/"
            className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Avatar */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-r from-yt-primary to-yt-primary-light">
            <div className="w-full h-full rounded-full overflow-hidden bg-yt-bg border-4 border-yt-bg">
              {isLoadingAvatar ? (
                <div className="w-full h-full bg-yt-surface animate-pulse" />
              ) : ensAvatar ? (
                <img src={ensAvatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yt-primary to-yt-primary-light flex items-center justify-center">
                  <span className="text-4xl font-bold text-yt-bg">
                    {displayName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Live badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1 bg-yt-live text-white text-xs font-bold rounded-full animate-pulse-live flex items-center gap-1.5">
              <span className="w-2 h-2 bg-white rounded-full" />
              LIVE NOW
            </span>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-20 px-4 max-w-2xl mx-auto">
        {/* Name & Handle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-yt-text mb-1">
            {isLoading ? (
              <span className="inline-block w-32 h-8 bg-yt-surface animate-pulse rounded" />
            ) : (
              displayName
            )}
          </h1>
          {address && (
            <p className="text-sm text-yt-text-muted font-mono">
              {`${address.slice(0, 10)}...${address.slice(-8)}`}
            </p>
          )}
        </div>

        {/* Description */}
        {(description || isLoading) && (
          <div className="text-center mb-8">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-yt-surface animate-pulse rounded w-3/4 mx-auto" />
                <div className="h-4 bg-yt-surface animate-pulse rounded w-1/2 mx-auto" />
              </div>
            ) : (
              <p className="text-yt-text-secondary">{description}</p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-xl font-bold text-yt-text">24.5K</p>
            <p className="text-sm text-yt-text-muted">Followers</p>
          </div>
          <div className="w-px h-8 bg-yt-border" />
          <div className="text-center">
            <p className="text-xl font-bold text-yt-text">156</p>
            <p className="text-sm text-yt-text-muted">Following</p>
          </div>
          <div className="w-px h-8 bg-yt-border" />
          <div className="text-center">
            <p className="text-xl font-bold text-yt-primary">2.1M</p>
            <p className="text-sm text-yt-text-muted">Tips</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mb-8">
          <button className="flex-1 btn-yellow py-3 bg-yt-primary text-yt-bg font-bold rounded-xl hover:bg-yt-primary-hover transition-all">
            Follow
          </button>
          <button className="flex-1 py-3 bg-yt-surface text-yt-text font-bold rounded-xl border border-yt-border hover:border-yt-primary transition-colors">
            Send Tip
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-yt-surface rounded-xl border border-yt-border hover:border-yt-primary transition-colors">
            <svg className="w-5 h-5 text-yt-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        {/* ENS Records */}
        <div className="bg-yt-surface rounded-2xl border border-yt-border overflow-hidden">
          <div className="p-4 border-b border-yt-border">
            <h2 className="font-semibold text-yt-text flex items-center gap-2">
              <svg className="w-5 h-5 text-yt-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ENS Information
            </h2>
          </div>
          
          <div className="divide-y divide-yt-border">
            {/* Address */}
            {address && (
              <div className="p-4 flex items-center justify-between">
                <span className="text-yt-text-secondary">Address</span>
                <span className="font-mono text-sm text-yt-text">{`${address.slice(0, 10)}...${address.slice(-8)}`}</span>
              </div>
            )}
            
            {/* Twitter */}
            {twitter && (
              <div className="p-4 flex items-center justify-between">
                <span className="text-yt-text-secondary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter
                </span>
                <a 
                  href={`https://twitter.com/${twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yt-primary hover:underline"
                >
                  @{twitter}
                </a>
              </div>
            )}

            {/* Website */}
            {url && (
              <div className="p-4 flex items-center justify-between">
                <span className="text-yt-text-secondary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Website
                </span>
                <a 
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yt-primary hover:underline truncate max-w-[200px]"
                >
                  {url}
                </a>
              </div>
            )}

            {/* Email */}
            {email && (
              <div className="p-4 flex items-center justify-between">
                <span className="text-yt-text-secondary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </span>
                <a 
                  href={`mailto:${email}`}
                  className="text-yt-primary hover:underline"
                >
                  {email}
                </a>
              </div>
            )}

            {/* No ENS data message */}
            {!twitter && !url && !email && !isLoading && (
              <div className="p-8 text-center">
                <p className="text-yt-text-muted">No additional ENS records available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent streams section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-yt-text mb-4">Recent streams</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[9/16] bg-yt-surface rounded-xl overflow-hidden relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-yt-primary/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">
                    {i * 12}K views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
