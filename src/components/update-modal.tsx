"use client"

import { useState } from "react"
import { X, AlertTriangle, Download, Loader2, CheckCircle } from "lucide-react"

interface UpdateData {
  update_available: boolean
  mandatory: boolean
  timestamp: string
  message: string
  notes?: string
  components: {
    frontend?: {
      update: boolean
      current_version: string
      new_version: string
    }
    backend?: {
      update: boolean
      current_version: string
      new_version: string
    }
    roles?: string[]
  }
}

interface UpdateModalProps {
  isOpen: boolean
  onClose: () => void
  updateData: UpdateData
  onUpdate: () => void
  isUpdating: boolean
  updateComplete: boolean
  updateError: string | null
}

export default function UpdateModal({
  isOpen,
  onClose,
  updateData,
  onUpdate,
  isUpdating,
  updateComplete,
  updateError
}: UpdateModalProps) {
  if (!isOpen) return null

  const isMandatory = updateData.mandatory

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 backdrop-blur-sm z-50"
        onClick={isMandatory ? undefined : onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-[20px]">
        <div className="relative w-[680px] bg-[var(--pcr-card)] rounded-[20px] p-[48px] shadow-2xl border border-[var(--pcr-card-dark)]">

          {/* Close button - only show if not mandatory */}
          {!isMandatory && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-[var(--pcr-text-primary)] active:text-gray-300 transition-colors duration-150"
            >
              <X className="w-10 h-10" />
            </button>
          )}

          {/* Icon and title */}
          <div className="flex flex-col items-center mb-[32px]">
            <div className={`w-[80px] h-[80px] ${isMandatory ? 'bg-red-500' : 'bg-[var(--pcr-accent)]'} rounded-full flex items-center justify-center mb-[24px]`}>
              {isMandatory ? (
                <AlertTriangle className="w-[40px] h-[40px] text-white" strokeWidth={2} />
              ) : (
                <Download className="w-[40px] h-[40px] text-white" strokeWidth={2} />
              )}
            </div>
            <h2 className="text-[36px] font-normal leading-[40px] text-[var(--pcr-text-primary)] text-center mb-[16px]">
              {isMandatory ? 'Critical Update Required' : 'Software Update Available'}
            </h2>
            <p className="text-[24px] font-light leading-[32px] text-[var(--pcr-text-secondary)] text-center">
              {updateData.message}
            </p>
          </div>

          {/* Release notes */}
          {updateData.notes && (
            <div className="mb-[32px]">
              <p className="text-[20px] font-light leading-[28px] text-[var(--pcr-text-primary)]">
                {updateData.notes}
              </p>
            </div>
          )}

          {/* Update status messages */}
          {isUpdating && (
            <div className="mb-[24px] flex items-center justify-center gap-3 text-[var(--pcr-accent)]">
              <Loader2 className="w-[24px] h-[24px] animate-spin" />
              <span className="text-[20px] font-light">Update in progress... (5-10 minutes)</span>
            </div>
          )}

          {updateComplete && (
            <div className="mb-[24px] flex items-center justify-center gap-3 text-green-500">
              <CheckCircle className="w-[24px] h-[24px]" />
              <span className="text-[20px] font-light">Update completed successfully!</span>
            </div>
          )}

          {updateError && (
            <div className="mb-[24px] bg-red-500/10 border border-red-500 rounded-[12px] p-[16px] flex items-center gap-3">
              <AlertTriangle className="w-[24px] h-[24px] text-red-500" />
              <span className="text-[18px] text-red-400">{updateError}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-[24px] justify-center">
            {!isMandatory && !isUpdating && !updateComplete && (
              <button
                onClick={onClose}
                className="w-[200px] h-[60px] bg-[var(--pcr-card-dark)] rounded-[8px] text-[24px] font-normal text-[var(--pcr-text-primary)] active:bg-[var(--pcr-accent)] transition-colors"
              >
                Remind Later
              </button>
            )}
            {!updateComplete && (
              <button
                onClick={onUpdate}
                disabled={isUpdating}
                className={`w-[200px] h-[60px] ${isMandatory ? 'bg-red-500' : 'bg-[var(--pcr-accent)]'} rounded-[8px] text-[24px] font-normal text-white transition-colors ${
                  isUpdating ? 'opacity-50 cursor-not-allowed' : 'active:opacity-80'
                }`}
              >
                {isUpdating ? 'Updating...' : 'Update Now'}
              </button>
            )}
            {updateComplete && (
              <button
                onClick={onClose}
                className="w-[200px] h-[60px] bg-[var(--pcr-accent)] rounded-[8px] text-[24px] font-normal text-white active:opacity-80 transition-opacity"
              >
                Close
              </button>
            )}
          </div>

          {/* Warning for mandatory updates */}
          {isMandatory && !isUpdating && !updateComplete && (
            <div className="mt-[24px] text-center">
              <p className="text-[18px] font-light text-[var(--pcr-text-secondary)]">
                This update must be installed to continue using the device
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
