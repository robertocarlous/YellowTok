import { useState } from 'react'

export interface TipOption {
  id: string
  name: string
  icon: string
  price: string
  priceValue: number
  description: string
  color: string
}

export const TIP_OPTIONS: TipOption[] = [
  {
    id: 'heart',
    name: 'Heart',
    icon: '❤️',
    price: '1 USDC',
    priceValue: 1,
    description: 'Pure love',
    color: 'from-red-500 to-pink-500',
  },
  {
    id: 'fire',
    name: 'Fire',
    icon: '🔥',
    price: '2 USDC',
    priceValue: 2,
    description: 'This is hot!',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'star',
    name: 'Star',
    icon: '⭐',
    price: '5 USDC',
    priceValue: 5,
    description: 'You\'re a star',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: '💎',
    price: '10 USDC',
    priceValue: 10,
    description: 'Premium content',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'rocket',
    name: 'Rocket',
    icon: '🚀',
    price: '20 USDC',
    priceValue: 20,
    description: 'To the moon!',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'crown',
    name: 'Crown',
    icon: '👑',
    price: '50 USDC',
    priceValue: 50,
    description: 'The king/queen',
    color: 'from-yellow-500 to-amber-500',
  },
]

interface TipModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTip: (tip: TipOption) => void
}

export function TipModal({ isOpen, onClose, onSelectTip }: TipModalProps) {
  const [selectedTip, setSelectedTip] = useState<TipOption | null>(null)

  if (!isOpen) return null

  const handleSelectTip = (tip: TipOption) => {
    setSelectedTip(tip)
    onSelectTip(tip)
    
    // Pequeña vibración visual al seleccionar
    setTimeout(() => {
      setSelectedTip(null)
    }, 200)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal - Bottom Sheet Style */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="bg-yt-surface rounded-t-3xl border-t border-yt-border shadow-2xl max-h-[80vh] overflow-hidden">
          {/* Handle bar */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1.5 bg-yt-text-muted/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-yt-text">Send Tip</h3>
                <p className="text-sm text-yt-text-secondary mt-1">
                  Support the streamer with your favorite tip
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-yt-bg-elevated hover:bg-yt-border transition-colors"
              >
                <svg
                  className="w-5 h-5 text-yt-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tips Grid */}
          <div className="px-6 pb-8 overflow-y-auto max-h-[calc(80vh-120px)]">
            <div className="grid grid-cols-2 gap-3">
              {TIP_OPTIONS.map((tip) => (
                <button
                  key={tip.id}
                  onClick={() => handleSelectTip(tip)}
                  className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                    selectedTip?.id === tip.id
                      ? 'border-yt-primary scale-95'
                      : 'border-yt-border hover:border-yt-primary/50 hover:scale-[1.02]'
                  }`}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tip.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  
                  {/* Content */}
                  <div className="relative p-4 flex flex-col items-center gap-2">
                    {/* Icon */}
                    <div className="text-4xl mb-1 transform group-hover:scale-110 transition-transform">
                      {tip.icon}
                    </div>
                    
                    {/* Name */}
                    <div className="font-semibold text-yt-text">
                      {tip.name}
                    </div>
                    
                    {/* Price */}
                    <div className="text-yt-primary font-bold text-lg">
                      {tip.price}
                    </div>
                    
                    {/* Description */}
                    <div className="text-xs text-yt-text-secondary text-center">
                      {tip.description}
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-yt-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Info Footer */}
            <div className="mt-6 p-4 bg-yt-bg-elevated rounded-xl border border-yt-border">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div className="flex-1">
                  <p className="text-sm text-yt-text-secondary">
                    <span className="font-semibold text-yt-primary">Demo Version:</span> Tips are simulated.
                    In production, they will be processed with Yellow Network for instant, uninterrupted payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </>
  )
}
