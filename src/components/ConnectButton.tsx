import { useAccount, useConnect, useDisconnect, useEnsName, useEnsAvatar, useSwitchChain, useReadContract } from 'wagmi'
import { useState, useRef, useEffect } from 'react'
import { PRIMARY_CHAIN, ENS_CHAIN_ID } from '../config/chains'
import { USDC_SEPOLIA_ADDRESS, ERC20_ABI } from '../config/contracts'
import { formatUnits } from 'viem'

export function ConnectButton() {
  const { address, isConnected, chain, chainId } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ENS resolution
  const { data: ensName } = useEnsName({ 
    address,
    chainId: ENS_CHAIN_ID,
  })
  const { data: ensAvatar } = useEnsAvatar({ 
    name: ensName ?? undefined,
    chainId: ENS_CHAIN_ID,
  })

  // USDC Balance on Sepolia
  const { data: usdcBalance } = useReadContract({
    address: USDC_SEPOLIA_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: PRIMARY_CHAIN.id,
  })

  // Auto-switch to Sepolia when connected to wrong network
  useEffect(() => {
    if (isConnected && chain?.id !== PRIMARY_CHAIN.id && switchChain) {
      switchChain({ chainId: PRIMARY_CHAIN.id })
    }
  }, [isConnected, chain?.id, switchChain])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatUsdcBalance = () => {
    if (!usdcBalance) return '0.00'
    const formatted = formatUnits(usdcBalance as bigint, 6) // USDC has 6 decimals
    return parseFloat(formatted).toFixed(2)
  }

  const isWrongNetwork = isConnected && chain?.id !== PRIMARY_CHAIN.id

  if (!isConnected) {
    const metaMaskConnector = connectors.find(c => c.name === 'MetaMask')
    
    return (
      <button
        onClick={() => metaMaskConnector && connect({ connector: metaMaskConnector, chainId: PRIMARY_CHAIN.id })}
        disabled={isPending}
        className="btn-yellow px-5 py-2.5 bg-yt-primary text-yt-bg font-semibold rounded-xl hover:bg-yt-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Conectando...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Conectar Wallet
          </>
        )}
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-200 ${
          isWrongNetwork 
            ? 'border-yt-error bg-yt-error/10 hover:bg-yt-error/20' 
            : 'border-yt-border bg-yt-surface hover:border-yt-primary'
        }`}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-yt-bg-elevated flex items-center justify-center">
          {ensAvatar ? (
            <img src={ensAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yt-primary to-yt-primary-light" />
          )}
        </div>

        {/* Name & Network */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-yt-text">
            {ensName ?? formatAddress(address!)}
          </span>
          <span className={`text-xs ${isWrongNetwork ? 'text-yt-error' : 'text-yt-text-muted'}`}>
            {isWrongNetwork ? 'Red incorrecta' : chain?.name}
          </span>
        </div>

        {/* Dropdown arrow */}
        <svg 
          className={`w-4 h-4 text-yt-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-yt-surface border border-yt-border rounded-xl shadow-xl overflow-hidden">
          {/* Address */}
          <div className="p-4 border-b border-yt-border">
            <p className="text-xs text-yt-text-muted mb-1">Address</p>
            <p className="text-sm font-mono text-yt-text truncate">{address?.slice(0,12)}...{address?.slice(-3)}</p>
          </div>
          {/* USDC Balance */}
          <div className="p-4 border-b border-yt-border bg-yt-bg-elevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">$</span>
                </div>
                <span className="text-sm text-yt-text-secondary">USDC Balance</span>
              </div>
              <span className="text-lg font-bold text-yt-primary">
                {formatUsdcBalance()}
              </span>
            </div>
            <p className="text-xs text-yt-text-muted mt-1">Sepolia Testnet</p>
          </div>
          {/* Wrong network warning */}
          {isWrongNetwork && (
            <div className="p-4 bg-yt-error/10 border-b border-yt-border">
              <p className="text-sm text-yt-error">
                Por favor cambia a Sepolia, network actual: {chainId}
              </p>
            </div>
          )}

          {/* Disconnect */}
          <button
            onClick={() => {
              disconnect()
              setIsOpen(false)
            }}
            className="w-full p-4 text-left text-sm text-yt-error hover:bg-yt-surface-hover transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
