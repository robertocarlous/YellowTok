import { useState } from 'react'

interface SpendLimitModalProps {
  isOpen: boolean
  onConfirm: (limit: number) => void
}

const PRESET_LIMITS = [10, 25, 50, 100, 250]

export function SpendLimitModal({ isOpen, onConfirm }: SpendLimitModalProps) {
  const [selectedLimit, setSelectedLimit] = useState<number>(50)
  const [customLimit, setCustomLimit] = useState<string>('')
  const [useCustom, setUseCustom] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    const finalLimit = useCustom && customLimit ? parseFloat(customLimit) : selectedLimit
    if (finalLimit > 0) {
      onConfirm(finalLimit)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-yt-surface rounded-3xl border border-yt-border shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="p-6 border-b border-yt-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-yt-primary/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yt-primary"
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
              </div>
              <div>
                <h3 className="text-2xl font-bold text-yt-text">Set Spending Limit</h3>
                <p className="text-sm text-yt-text-secondary">Control your tips budget per session</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Preset options */}
            <div>
              <label className="text-sm font-medium text-yt-text-secondary mb-3 block">
                Quick Select
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_LIMITS.map((limit) => (
                  <button
                    key={limit}
                    onClick={() => {
                      setSelectedLimit(limit)
                      setUseCustom(false)
                    }}
                    className={`py-3 px-4 rounded-xl font-bold text-center transition-all ${
                      !useCustom && selectedLimit === limit
                        ? 'bg-yt-primary text-yt-bg border-2 border-yt-primary'
                        : 'bg-yt-bg-elevated text-yt-text border-2 border-yt-border hover:border-yt-primary/50'
                    }`}
                  >
                    ${limit}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-yt-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-yt-surface text-yt-text-muted">or</span>
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <label className="text-sm font-medium text-yt-text-secondary mb-3 block">
                Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yt-text-muted font-bold">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter amount"
                  value={customLimit}
                  onChange={(e) => {
                    setCustomLimit(e.target.value)
                    setUseCustom(true)
                  }}
                  onFocus={() => setUseCustom(true)}
                  className={`w-full pl-8 pr-4 py-3 bg-yt-bg-elevated border-2 rounded-xl text-yt-text font-semibold placeholder:text-yt-text-muted focus:outline-none transition-colors ${
                    useCustom
                      ? 'border-yt-primary'
                      : 'border-yt-border focus:border-yt-primary'
                  }`}
                />
              </div>
            </div>

            {/* Info note */}
            <div className="p-4 bg-yt-primary/10 rounded-xl border border-yt-primary/20">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-yt-primary flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-yt-text">
                  This limit will be saved for your session. You can adjust it anytime from settings.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-yt-border">
            <button
              onClick={handleConfirm}
              className="w-full py-3 bg-yt-primary text-yt-bg font-bold rounded-xl hover:bg-yt-primary-hover transition-all hover:scale-[1.02] active:scale-95"
            >
              Confirm & Start Tipping
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
