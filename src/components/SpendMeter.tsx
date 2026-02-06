interface SpendMeterProps {
  spent: number
  limit: number
  onEditLimit?: () => void
  className?: string
}

export function SpendMeter({ spent, limit, onEditLimit, className = '' }: SpendMeterProps) {
  const percentage = Math.min((spent / limit) * 100, 100)
  const remaining = Math.max(limit - spent, 0)
  
  // Color based on percentage
  const getColor = () => {
    if (percentage >= 90) return 'text-red-500 border-red-500/30'
    if (percentage >= 70) return 'text-orange-500 border-orange-500/30'
    return 'text-yt-primary border-yt-primary/30'
  }

  const getBarColor = () => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-orange-500'
    return 'bg-yt-primary'
  }

  return (
    <div className={`${className} pointer-events-auto`}>
      <div className="px-4 py-2.5 bg-black/70 backdrop-blur-md rounded-xl border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 gap-3">
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 ${getColor().split(' ')[0]}`}
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
            <span className="text-xs font-semibold text-yt-text-secondary uppercase tracking-wide">
              Session Budget
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${getColor().split(' ')[0]}`}>
              {percentage.toFixed(0)}%
            </span>
            {onEditLimit && (
              <button
                onClick={onEditLimit}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                title="Edit limit"
              >
                <svg
                  className="w-3.5 h-3.5 text-yt-text-secondary hover:text-yt-primary transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
          <div
            className={`absolute inset-y-0 left-0 ${getBarColor()} transition-all duration-300 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-yt-text">${spent.toFixed(2)}</span>
            <span className="text-yt-text-muted">spent</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-yt-text">${remaining.toFixed(2)}</span>
            <span className="text-yt-text-muted">left</span>
          </div>
        </div>

        {/* Warning message */}
        {percentage >= 90 && remaining > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-xs text-red-400 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Almost at your limit!
            </p>
          </div>
        )}

        {/* Limit reached */}
        {remaining === 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-xs text-red-400 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Limit reached
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
