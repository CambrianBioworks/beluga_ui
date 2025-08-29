"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface NavigationButtonsProps {
  onBack?: () => void
  onNext?: () => void
  backDisabled?: boolean
  nextDisabled?: boolean
  backLabel?: string
  nextLabel?: string
  showBack?: boolean
  showNext?: boolean
}

export default function NavigationButtons({
  onBack,
  onNext,
  backDisabled = false,
  nextDisabled = false,
  backLabel = "Back",
  nextLabel = "Next",
  showBack = true,
  showNext = true,
}: NavigationButtonsProps) {
  return (
// In NavigationButtons component
    <div className="w-[1080px] h-[148px] flex gap-[300px] justify-center items-center">
      {showBack && (
        <button
          onClick={onBack}
          disabled={backDisabled}
          className={`w-[309px] h-[148px] rounded-[8px] flex items-center justify-center gap-4 transition-colors ${
            backDisabled ? "bg-[var(--pcr-card)] cursor-not-allowed" : "bg-[#5B77C6] active:bg-[#4a66b3]"
          }`}
        >
          <ChevronLeft
            className={`w-[49px] h-[46px] ${backDisabled ? "text-[var(--pcr-text-light)]" : "text-white"}`}
          />
          <span className={`text-[36px] font-normal ${backDisabled ? "text-[var(--pcr-text-light)]" : "text-white"}`}>
            {backLabel}
          </span>
        </button>
      )}

      {/* Next Button */}
      {showNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`w-[309px] h-[148px] rounded-[8px] flex items-center justify-center gap-4 transition-colors ${
            nextDisabled ? "bg-[var(--pcr-card)] cursor-not-allowed" : "bg-[#5B77C6] active:bg-[#4a66b3]"
          }`}
        >
          <span className={`text-[36px] font-normal ${nextDisabled ? "text-[var(--pcr-text-light)]" : "text-white"}`}>
            {nextLabel}
          </span>
          <ChevronRight
            className={`w-[49px] h-[46px] ${nextDisabled ? "text-[var(--pcr-text-light)]" : "text-white"}`}
          />
        </button>
      )}
    </div>
  )
}
