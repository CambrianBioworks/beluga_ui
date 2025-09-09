"use client"

import { useState, useEffect } from "react"
import { useRunStore } from "../lib/store"
import NavigationButtons from "./navigation-buttons"
import { Check } from "lucide-react"
import { useSocket } from "../lib/useSocket"
import { AlertTriangle } from "lucide-react"

export default function PreRunSummary() {
    const { runData, setCurrentPage } = useRunStore()
    const [isStarting, setIsStarting] = useState(false)
    const [startError, setStartError] = useState<string | null>(null)
    const { isConnected, startPCRRun } = useSocket()

    const { runId, operatorName, numberOfSamples, selectedWells, pipetteTips } = runData
    const [showSystemCheckModal, setShowSystemCheckModal] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentCheck, setCurrentCheck] = useState("Checking tip pickup")

    const handleBack = () => setCurrentPage("elution-well-selection")

    const handleStartRun = async () => {
        setIsStarting(true)
        setStartError(null)
        setShowSystemCheckModal(true)

        try {
            // First simulate the system check UI
            await simulateSystemCheck()

            // Send the run data to Python server (don't await)
            console.log('Sending run data to Python server:', runData)
            
            startPCRRun({
                run_id: runData.runId,
                operator_name: runData.operatorName,
                number_of_samples: runData.numberOfSamples,
                protocol_type: runData.protocolType,
                sample_type: runData.sampleType,
                selected_wells: runData.selectedWells,
                reagent_volumes: runData.reagentVolumes,
                pipette_tips: runData.pipetteTips
            })

            // Immediately hide modal and navigate
            setShowSystemCheckModal(false)
            setCurrentPage("run-page")

        } catch (error) {
            console.error('Failed during system check:', error)
            setStartError(error instanceof Error ? error.message : 'Unknown error')
            setShowSystemCheckModal(false)
        } finally {
            setIsStarting(false)
        }
    }

    const simulateSystemCheck = (): Promise<void> => {
        return new Promise((resolve) => {
            // Your existing simulateSystemCheck code, but replace the setTimeout with resolve()
            const checks = [
                "Initializing system",
                "Checking tip pickup",
                "Validating reagent positions",
                "Testing pipette movement",
                "Verifying sample positions",
                "Final system validation"
            ]

            let currentProgress = 0
            let checkIndex = 0

            const interval = setInterval(() => {
                currentProgress += Math.random() * 15 + 5
                setProgress(Math.min(currentProgress, 100))

                if (currentProgress > (checkIndex + 1) * 16.67) {
                    checkIndex++
                    if (checkIndex < checks.length) {
                        setCurrentCheck(checks[checkIndex])
                    }
                }

                if (currentProgress >= 100) {
                    clearInterval(interval)
                    resolve() // Change this from the setTimeout to resolve()
                }
            }, 800)
        })
    }

    const closeModal = () => {
        setShowSystemCheckModal(false)
        setProgress(0)
        setCurrentCheck("Checking tip pickup")
        setStartError(null)
    }

    return (
        <>
            <div className="w-full max-w-[1080px] mx-auto bg-[var(--pcr-bg)] text-[var(--pcr-text-primary)] flex flex-col min-h-screen px-[84px] pt-[80px]">
                {/* Header */}
                <h1 className="text-[52px] font-normal leading-[54px] mb-[20px]">
                    Pre-run summary and checks
                </h1>
                <p className="text-[32px] font-light leading-[40px] mb-[40px]">
                    Review configuration and start the DNA extraction run
                </p>

                {/* Blue accent line */}
                <div className="w-[912px] h-[2px] bg-[var(--pcr-accent)] rounded-[20px] mb-[60px]" />

                {/* WebSocket Status Indicator */}
                <div className="flex items-center gap-3 mb-[20px]">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-[20px]">
                        Server: {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>

                {/* Error Message */}
                {startError && (
                    <div className="bg-red-500/10 border border-red-500 rounded-[12px] p-4 mb-[20px] flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <span className="text-red-400">Failed to start run: {startError}</span>
                    </div>
                )}

                {/* Run configuration */}
                <div className="mb-[80px]">
                    <h2 className="text-[36px] font-normal mb-[32px]">Run configuration</h2>
                    <div className="relative w-[912px] h-[92px] bg-[var(--pcr-card)] rounded-[20px] flex items-center justify-between px-[40px]">
                        <span className="text-[24px]">Run ID: {runId || "12345"}</span>
                        <span className="text-[24px]">Sample count: {numberOfSamples || "4"}</span>
                        <span className="text-[24px]">Operator: {operatorName || "ABCD"}</span>
                        <span className="text-[24px]">Liquid QC: Disabled</span>
                    </div>
                </div>

                {/* Consumables summary */}
                <div className="mb-[80px]">
                    <h2 className="text-[36px] font-normal leading-[40px] mb-[32px]">
                        Consumables summary
                    </h2>

                    {/* Outer container */}
                    <div className="relative w-[912px] h-[282px] bg-[var(--pcr-card)] rounded-[20px] flex justify-between px-[35px] py-[35px]">

                        {/* Reagent volumes card */}
                        <div className="w-[395px] h-[212px] bg-[var(--pcr-card-dark)] rounded-[20px] px-[35px] py-[20px] flex flex-col justify-start">
                            <span className="text-[24px] font-normal leading-[40px] mb-[16px] text-[var(--pcr-text-primary)]">
                                Reagent volumes:
                            </span>
                            <span className="text-[24px] font-light leading-[40px] text-[var(--pcr-text-primary)]">Lysis buffer: 1800 μL</span>
                            <span className="text-[24px] font-light leading-[40px] text-[var(--pcr-text-primary)]">Proteinase K: 280 μL</span>
                            <span className="text-[24px] font-light leading-[40px] text-[var(--pcr-text-primary)]">LE buffer: 900 μL</span>
                        </div>

                        {/* Pipette tips card */}
                        <div className="w-[395px] h-[212px] bg-[var(--pcr-card-dark)] rounded-[20px] px-[35px] py-[20px] flex flex-col justify-start">
                            <span className="text-[24px] font-normal leading-[40px] mb-[16px] text-[var(--pcr-text-primary)]">
                                Pipette tips: {192 - pipetteTips.length} available / 192 total
                            </span>
                        </div>
                    </div>
                </div>

                {/* Elution well map */}
                <div className="mb-[80px]">
                    <h2 className="text-[36px] font-normal mb-[32px]">Elution well map</h2>
                    <div className="w-[912px] bg-[var(--pcr-card)] rounded-[20px] px-[35px] py-[24px]">
                        <div className="text-[24px] mb-[20px]">Selected wells:</div>
                        <div className="flex flex-wrap gap-[24px]">
                            {selectedWells?.length ? (
                                selectedWells.map((well, index) => (
                                    <div
                                        key={well}
                                        className="w-[190px] h-[68px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center justify-between px-[24px]"
                                    >
                                        <span className="text-[24px] font-light text-[var(--pcr-text-primary)]">{well}</span>
                                        <div className="w-[37px] h-[37px] bg-[var(--pcr-text-primary)] rounded-full flex items-center justify-center">
                                            <span className="text-[20px] text-[var(--pcr-bg)]">{index + 1}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span className="text-[20px] text-[var(--pcr-text-secondary)]">
                                    No wells selected
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* System ready */}
                <div className="mb-[100px]">
                    <div className="w-[912px] h-[280px] bg-[var(--pcr-card)] rounded-[20px] flex flex-col items-center justify-center">
                        <div className="w-[64px] h-[64px] bg-green-500 rounded-full flex items-center justify-center mb-[24px]">
                            <Check className="w-[32px] h-[32px] text-white" />
                        </div>
                        <h3 className="text-[36px] mb-[16px]">System ready</h3>
                        <p className="text-[24px] text-[var(--pcr-text-secondary)]">
                            All validation checks passed. Ready to start run
                        </p>
                    </div>
                </div>

                {/* Navigation buttons at bottom */}
                <div className="mt-auto flex justify-center mb-14">
                    <NavigationButtons
                        showBack
                        showNext
                        nextLabel="Start run"
                        nextDisabled={!isConnected || isStarting} // Add this line
                        onBack={handleBack}
                        onNext={handleStartRun}
                    />
                </div>
            </div>

            {/* System Check Modal */}
            {showSystemCheckModal && (
                <>
                    {/* Backdrop with blur */}
                    <div
                        className="fixed inset-0 backdrop-blur-sm z-50"
                        onClick={closeModal}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="relative w-[912px] h-[350px] bg-[var(--pcr-card)] rounded-[20px] flex flex-col items-center justify-center px-[48px] shadow-2xl border border-[var(--pcr-text-primary)]/10">

                            {/* System check in progress title */}
                            <div className="w-[558px] h-[42px] mb-[32px]">
                                <h2 className="font-normal text-[36px] leading-[40px] text-[var(--pcr-text-primary)] text-center">
                                    System check in progress
                                </h2>
                            </div>

                            {/* Progress section */}
                            <div className="w-[817px] mb-[24px]">
                                {/* Progress label and percentage */}
                                <div className="flex items-center justify-between mb-[16px]">
                                    <div className="w-[110px] h-[39px]">
                                        <span className="font-light text-[24px] leading-[40px] text-[var(--pcr-text-primary)]">
                                            Progress
                                        </span>
                                    </div>
                                    <div className="w-[48px] h-[39px]">
                                        <span className="font-light text-[24px] leading-[40px] text-[var(--pcr-text-primary)]">
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Progress bar container */}
                                <div className="relative w-[816px] h-[19px] bg-[var(--pcr-card-dark)] rounded-[9.5px]">
                                    {/* Progress bar fill */}
                                    <div
                                        className="absolute h-[19px] bg-[var(--pcr-accent)] rounded-[9.5px] transition-all duration-300 ease-out"
                                        style={{ width: `${(progress / 100) * 816}px` }}
                                    />
                                </div>
                            </div>

                            {/* Current check status */}
                            <div className="w-[232px] h-[39px] mb-[20px]">
                                <p className="font-light text-[24px] leading-[40px] text-[var(--pcr-text-primary)] text-center">
                                    {currentCheck}
                                </p>
                            </div>

                            {/* Bottom message */}
                            <div className="w-[643px] h-[39px]">
                                <p className="font-normal text-[24px] leading-[40px] text-[var(--pcr-text-primary)] text-center">
                                    Please wait while the system performs pre run checks
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}