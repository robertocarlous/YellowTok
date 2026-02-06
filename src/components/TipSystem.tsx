import { useState, useCallback, useEffect } from 'react'
import { TipModal, TipOption } from './TipModal'
import { TipAnimationLayer, TipAnimation } from './TipAnimationLayer'
import { SpendLimitModal } from './SpendLimitModal'
import { SpendMeter } from './SpendMeter'

interface TipSystemProps {
  className?: string
}

const SPEND_LIMIT_KEY = 'yellowtok_spend_limit'
const SPENT_AMOUNT_KEY = 'yellowtok_spent_amount'

export function TipSystem({ className = '' }: TipSystemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false)
  const [currentTip, setCurrentTip] = useState<TipOption | null>(null)
  const [animations, setAnimations] = useState<TipAnimation[]>([])
  const [totalTips, setTotalTips] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [spendLimit, setSpendLimit] = useState<number | null>(null)

  // Check for existing limit on mount
  useEffect(() => {
    const savedLimit = localStorage.getItem(SPEND_LIMIT_KEY)
    const savedSpent = localStorage.getItem(SPENT_AMOUNT_KEY)
    
    if (savedLimit) {
      setSpendLimit(parseFloat(savedLimit))
      if (savedSpent) {
        setTotalSpent(parseFloat(savedSpent))
      }
    } else {
      // Show limit modal on first visit
      setIsLimitModalOpen(true)
    }
  }, [])

  // Save spent amount to localStorage
  useEffect(() => {
    if (spendLimit !== null) {
      localStorage.setItem(SPENT_AMOUNT_KEY, totalSpent.toString())
    }
  }, [totalSpent, spendLimit])

  const handleConfirmLimit = (limit: number) => {
    setSpendLimit(limit)
    localStorage.setItem(SPEND_LIMIT_KEY, limit.toString())
    localStorage.setItem(SPENT_AMOUNT_KEY, '0')
    setTotalSpent(0)
    setIsLimitModalOpen(false)
  }

  const handleEditLimit = () => {
    setIsLimitModalOpen(true)
  }

  // Abrir modal de tips
  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  // Cerrar modal de tips
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // Cuando el usuario selecciona un tip del modal
  const handleSelectTip = useCallback((tip: TipOption) => {
    setCurrentTip(tip)
    setIsModalOpen(false)
  }, [])

  // Click en la pantalla para enviar el tip
  const handleScreenClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Solo activar si hay un tip seleccionado
      if (!currentTip) return

      // Check if limit is reached
      if (spendLimit !== null && totalSpent >= spendLimit) {
        return
      }

      // Check if this tip would exceed limit
      if (spendLimit !== null && totalSpent + currentTip.priceValue > spendLimit) {
        return
      }

      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((rect.bottom - e.clientY) / rect.height) * 100

      // Crear nueva animación
      const newAnimation: TipAnimation = {
        id: `${Date.now()}-${Math.random()}`,
        icon: currentTip.icon,
        x: Math.max(10, Math.min(90, x)), // Límites para que no se salga
        y: Math.max(5, Math.min(95, y)),
      }

      setAnimations((prev) => [...prev, newAnimation])
      setTotalTips((prev) => prev + 1)
      setTotalSpent((prev) => prev + currentTip.priceValue)
    },
    [currentTip, spendLimit, totalSpent]
  )

  // Cuando termina una animación, la removemos
  const handleAnimationComplete = useCallback((id: string) => {
    setAnimations((prev) => prev.filter((anim) => anim.id !== id))
  }, [])

  return (
    <>
      {/* Área clickeable para enviar tips */}
      <div
        className={`relative w-full h-full ${className}`}
        onClick={handleScreenClick}
      >
        {/* Capa de animaciones */}
        <TipAnimationLayer
          animations={animations}
          onAnimationComplete={handleAnimationComplete}
        />

        {/* Indicador del tip actual seleccionado */}
        {currentTip && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full border border-yt-primary/30 shadow-lg">
              <span className="text-2xl">{currentTip.icon}</span>
              <div className="flex flex-col">
                <span className="text-xs text-yt-text-secondary">Tap to send</span>
                <span className="text-sm font-semibold text-yt-primary">{currentTip.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Spend Meter - replaces old counter */}
        {spendLimit !== null && (
          <SpendMeter 
            spent={totalSpent} 
            limit={spendLimit} 
            onEditLimit={handleEditLimit}
            className="absolute top-16 left-4 z-20"
          />
        )}
      </div>

      {/* Botón flotante para abrir modal */}
      <button
        onClick={handleOpenModal}
        className="absolute bottom-[390px] right-4 z-40 w-14 h-14 flex items-center justify-center bg-gradient-to-r from-yt-primary to-yt-primary-light rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform group pointer-events-auto"
      >
        <div className="absolute inset-0 bg-yt-primary rounded-full animate-ping-slow opacity-75" />
        <svg
          className="w-7 h-7 text-yt-bg relative z-10"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
            clipRule="evenodd"
          />
        </svg>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Send tip
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-black/90" />
        </div>
      </button>

      {/* Modal */}
      <TipModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectTip={handleSelectTip}
      />

      {/* Spend Limit Modal */}
      <SpendLimitModal
        isOpen={isLimitModalOpen}
        onConfirm={handleConfirmLimit}
      />

      <style>{`
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  )
}
