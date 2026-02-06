import { useEffect, useState } from 'react'

export interface TipAnimation {
  id: string
  icon: string
  x: number
  y: number
}

interface TipAnimationLayerProps {
  animations: TipAnimation[]
  onAnimationComplete: (id: string) => void
}

export function TipAnimationLayer({ animations, onAnimationComplete }: TipAnimationLayerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {animations.map((animation) => (
        <FloatingIcon
          key={animation.id}
          animation={animation}
          onComplete={() => onAnimationComplete(animation.id)}
        />
      ))}
    </div>
  )
}

interface FloatingIconProps {
  animation: TipAnimation
  onComplete: () => void
}

function FloatingIcon({ animation, onComplete }: FloatingIconProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Animación completa después de 2 segundos
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onComplete(), 300) // Tiempo para la animación de fade out
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`absolute transition-all duration-[2000ms] ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`}
      style={{
        left: `${animation.x}%`,
        bottom: `${animation.y}%`,
        transform: 'translate(-50%, 0)',
        animation: 'floatUp 2s ease-out forwards',
      }}
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 blur-lg opacity-50 bg-yt-primary rounded-full scale-150" />
        
        {/* Icon */}
        <div className="relative text-5xl animate-bounce-slow">
          {animation.icon}
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translate(-50%, 0) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translate(-50%, -20px) scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -200px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
