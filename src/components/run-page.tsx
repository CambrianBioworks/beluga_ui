"use client"

import { useState, useEffect } from "react"
import { useRunStore } from "../lib/store"
import { Check, Pause, AlertTriangle } from "lucide-react"

export default function RunPage() {
    const { runData, setCurrentPage } = useRunStore()
    const { runId } = runData
    const [totalTimeSeconds, setTotalTimeSeconds] = useState(30) // 30 seconds for demo
    const [timeRemaining, setTimeRemaining] = useState("00:30")
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [stepProgress, setStepProgress] = useState(0)
    const [overallProgress, setOverallProgress] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [showAbortModal, setShowAbortModal] = useState(false)

    // Protocol steps with their durations (each 6 seconds for 30 total)
    const protocolSteps = [
        { name: "Lysis", duration: "6s", timeSeconds: 6 },
        { name: "Binding", duration: "6s", timeSeconds: 6 },
        { name: "Wash 1", duration: "6s", timeSeconds: 6 },
        { name: "Wash 2", duration: "6s", timeSeconds: 6 },
        { name: "Wash 3", duration: "6s", timeSeconds: 6 },
    ]

    // System status items
    const systemStatus = [
        { label: "Temperature: 37°C", isOk: true },
        { label: "Pressure: Normal", isOk: true },
        { label: "Liquid detection: OK", isOk: true },
        { label: "Tips remaining: 156", isOk: true },
    ]

    useEffect(() => {
        if (isPaused) return

        const timer = setInterval(() => {
            setTotalTimeSeconds(prev => {
                if (prev <= 0) {
                    clearInterval(timer)
                    // Run complete - could navigate to completion page
                    return 0
                }
                
                const newTime = prev - 1
                
                // Update time display
                const minutes = Math.floor(newTime / 60)
                const seconds = newTime % 60
                setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
                
                // Calculate overall progress
                const totalProgress = ((30 - newTime) / 30) * 100
                setOverallProgress(Math.round(totalProgress))
                
                // Calculate which step we're in
                const elapsedTime = 30 - newTime
                let currentStep = 0
                let stepElapsed = 0
                
                for (let i = 0; i < protocolSteps.length; i++) {
                    if (elapsedTime <= (i + 1) * 6) {
                        currentStep = i
                        stepElapsed = elapsedTime - (i * 6)
                        break
                    }
                }
                
                setCurrentStepIndex(currentStep)
                const stepProgressPercent = Math.round((stepElapsed / protocolSteps[currentStep].timeSeconds) * 100)
                setStepProgress(Math.min(stepProgressPercent, 100))
                
                return newTime
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isPaused, protocolSteps])

    const handlePauseRun = () => {
        setIsPaused(!isPaused)
    }

    const handleAbortRun = () => {
        setShowAbortModal(true)
    }

    const confirmAbort = () => {
        setCurrentPage("dashboard")
    }

    const cancelAbort = () => {
        setShowAbortModal(false)
    }

    return (
        <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] mx-auto overflow-hidden">
            
            {/* Header with Run ID */}
            <div className="absolute w-[544px] h-[62px] left-[84px] top-[115px]">
                <h1 className="text-[52px] font-normal leading-[54px] text-[var(--pcr-text-primary)]">
                    Run ID: {runId || "123456"}
                </h1>
            </div>

            {/* Time and Progress Section */}
            <div className="absolute w-[912px] h-[445px] left-[84px] top-[227px]">
                <div className="absolute w-full h-full bg-[var(--pcr-card)] rounded-[20px]">
                    
                    {/* Estimated time remaining */}
                    <div className="absolute w-[398px] h-[43px] left-[calc(50%-398px/2-209px)] top-[42px]">
                        <h2 className="text-[32px] font-normal leading-[54px] text-[var(--pcr-text-primary)]">
                            Estimated time remaining
                        </h2>
                    </div>

                    {/* Time display */}
                    <div className="absolute w-[286px] h-[97px] left-[47px] top-[101px]">
                        <div className="text-[100px] font-light leading-[100px] text-[var(--pcr-text-primary)]">
                            {timeRemaining}
                        </div>
                    </div>

                    {/* Progress section */}
                    <div className="absolute left-[48px] top-[250px] right-[48px]">
                        {/* Progress label and percentage */}
                        <div className="flex items-center justify-between mb-[16px]">
                            <span className="text-[24px] font-light leading-[40px] text-[var(--pcr-text-primary)]">
                                Progress
                            </span>
                            <span className="text-[24px] font-light leading-[40px] text-[var(--pcr-text-primary)]">
                                {overallProgress}%
                            </span>
                        </div>

                        {/* Progress bar container */}
                        <div className="relative w-[816px] h-[19px] bg-[var(--pcr-card-dark)] rounded-[9.5px]">
                            {/* Progress bar fill */}
                            <div 
                                className="absolute h-[19px] bg-[var(--pcr-accent)] rounded-[9.5px] transition-all duration-300 ease-out"
                                style={{ width: `${(overallProgress / 100) * 816}px` }}
                            />
                        </div>
                    </div>

                    {/* Current step */}
                    <div className="absolute w-[558px] h-[42px] left-[calc(50%-558px/2-129px)] top-[362px]">
                        <div className="text-[36px] font-normal leading-[40px] text-[var(--pcr-text-primary)]">
                            Current step: {protocolSteps[currentStepIndex]?.name || "Complete"} ({stepProgress}%)
                        </div>
                    </div>
                </div>
            </div>

            {/* Protocol Steps Section */}
            <div className="absolute w-[912px] h-[471px] left-[84px] top-[732px]">
                <div className="absolute w-full h-full bg-[var(--pcr-card)] rounded-[20px] px-[54px] py-[42px]">
                    
                    {/* Section title */}
                    <div className="mb-[32px]">
                        <h2 className="text-[36px] font-normal leading-[40px] text-[var(--pcr-text-primary)]">
                            Protocol steps
                        </h2>
                    </div>

                    {/* Steps list */}
                    <div className="space-y-[33px]">
                        {protocolSteps.map((step, index) => {
                            const isCompleted = index < currentStepIndex
                            const isCurrent = index === currentStepIndex
                            const isPending = index > currentStepIndex
                            
                            // Calculate total progress through the entire pipeline
                            const totalSteps = protocolSteps.length
                            const currentProgress = currentStepIndex + (stepProgress / 100)
                            const stepPosition = index
                            
                            // Calculate fill percentage for this step (top-down flow)
                            let fillPercentage = 0
                            if (currentProgress > stepPosition + 1) {
                                fillPercentage = 100 // Fully filled
                            } else if (currentProgress > stepPosition) {
                                fillPercentage = ((currentProgress - stepPosition) * 100) // Partial fill
                            }
                            
                            // Calculate connector line fill
                            let connectorFill = 0
                            if (currentProgress > stepPosition + 1) {
                                connectorFill = 100 // Fully filled
                            } else if (currentProgress > stepPosition + 0.5) {
                                connectorFill = ((currentProgress - stepPosition - 0.5) * 200) // Fill after circle is half done
                            }
                            
                            return (
                                <div key={step.name} className="relative flex items-center">
                                    {/* Step indicator circle with top-down fill */}
                                    <div className="relative w-[38px] h-[38px] rounded-full flex-shrink-0 bg-white overflow-hidden">
                                        {/* Top-down animated fill */}
                                        <div 
                                            className="absolute inset-x-0 top-0 bg-[var(--pcr-accent)] transition-all duration-300 ease-out"
                                            style={{
                                                height: `${fillPercentage}%`,
                                                borderRadius: fillPercentage === 100 ? '50%' : fillPercentage > 50 ? '50% 50% 0 0' : '0'
                                            }}
                                        />
                                        
                                        {/* Connecting line container */}
                                        {index < protocolSteps.length - 1 && (
                                            <div className="absolute w-[4px] h-[33px] left-[17px] top-[38px] bg-white">
                                                {/* Top-down animated fill for connecting line */}
                                                <div 
                                                    className="absolute inset-x-0 top-0 bg-[var(--pcr-accent)] transition-all duration-300 ease-out"
                                                    style={{
                                                        height: `${Math.min(connectorFill, 100)}%`
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Step content */}
                                    <div className="flex justify-between items-center w-full ml-[60px]">
                                        {/* Step name */}
                                        <span className={`text-[24px] font-normal leading-[40px] transition-colors duration-300 ${
                                            isCurrent ? 'text-[var(--pcr-accent)]' : 'text-[var(--pcr-text-primary)]'
                                        }`}>
                                            {step.name}
                                        </span>

                                        {/* Step duration */}
                                        <span className="text-[24px] font-light leading-[40px] text-center text-[var(--pcr-text-primary)]">
                                            {step.duration}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Run Status Section */}
            <div className="absolute w-[912px] h-[343px] left-[84px] top-[1263px]">
                
                {/* Section title */}
                <div className="absolute w-[275px] h-[42px] left-[calc(50%-275px/2-318.5px)] top-0">
                    <h2 className="text-[36px] font-normal leading-[40px] text-[var(--pcr-text-primary)]">
                        Run status
                    </h2>
                </div>

                {/* Status container */}
                <div className="absolute w-full h-[251px] top-[92px] bg-[var(--pcr-card)] rounded-[20px]">
                    <div className="absolute left-[48px] top-[31px]">
                        {systemStatus.map((status, index) => (
                            <div key={index} className="flex items-center" style={{ marginBottom: index < systemStatus.length - 1 ? '9px' : '0' }}>
                                {/* Status icon */}
                                <div className="w-[36px] h-[36px] mr-[40px] flex items-center justify-center">
                                    <div className="w-[27px] h-[27px] rounded-full border-2 border-green-500 flex items-center justify-center">
                                        <Check className="w-[12px] h-[12px] text-green-500" strokeWidth={3} />
                                    </div>
                                </div>
                                
                                {/* Status text */}
                                <span className="text-[24px] font-light leading-[40px] text-[var(--pcr-text-primary)]">
                                    {status.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="absolute w-[670.89px] h-[97.24px] left-[325px] top-[1707px]">
                
                {/* Pause/Resume button */}
                <button 
                    onClick={handlePauseRun}
                    className="absolute w-[308.89px] h-[97.24px] left-0 top-0 bg-[var(--pcr-card-dark)] rounded-[8px] flex items-center justify-center gap-4 active:bg-[var(--pcr-accent)] transition-colors"
                >
                    <Pause className="w-[25px] h-[34px] text-[var(--pcr-text-primary)]" fill="currentColor" />
                    <span className="text-[36px] font-light leading-[40px] text-[var(--pcr-text-primary)]">
                        {isPaused ? 'Resume run' : 'Pause run'}
                    </span>
                </button>

                {/* Abort button */}
                <button 
                    onClick={handleAbortRun}
                    className="absolute w-[308.89px] h-[97.12px] right-0 top-0 border-2 border-red-500 rounded-[8px] flex items-center justify-center gap-4 active:bg-red-500 active:bg-opacity-10 transition-colors"
                >
                    <AlertTriangle className="w-[25px] h-[34px] text-red-500" fill="currentColor" />
                    <span className="text-[36px] font-light leading-[40px] text-red-500">
                        Abort run
                    </span>
                </button>
            </div>

            {/* Emergency Abort Modal */}
            {showAbortModal && (
                <>
                    {/* Backdrop with blur - blur the run page content */}
                    <div className="fixed inset-0 backdrop-blur-sm z-50" />
                    
                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-[20px]">
                        <div className="relative w-[600px] bg-[var(--pcr-card)] rounded-[20px] p-[48px] shadow-2xl border border-[var(--pcr-card-dark)]">
                            
                            {/* Emergency icon and title */}
                            <div className="flex flex-col items-center mb-[32px]">
                                <div className="w-[80px] h-[80px] bg-red-500 rounded-full flex items-center justify-center mb-[24px]">
                                    <AlertTriangle className="w-[40px] h-[40px] text-white" strokeWidth={2} />
                                </div>
                                <h2 className="text-[36px] font-normal leading-[40px] text-[var(--pcr-text-primary)] text-center mb-[16px]">
                                    Emergency Stop
                                </h2>
                                <p className="text-[24px] font-light leading-[32px] text-[var(--pcr-text-secondary)] text-center">
                                    Are you sure you want to abort the current run? This action cannot be undone.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-[24px] justify-center">
                                <button
                                    onClick={cancelAbort}
                                    className="w-[200px] h-[60px] bg-[var(--pcr-card-dark)] rounded-[8px] text-[24px] font-normal text-[var(--pcr-text-primary)] active:bg-[var(--pcr-accent)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAbort}
                                    className="w-[200px] h-[60px] bg-red-500 rounded-[8px] text-[22px] font-normal text-white active:bg-red-600 transition-colors"
                                >
                                    Emergency Stop
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}