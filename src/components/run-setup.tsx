"use client"

import { useState } from "react"
import { useRunStore } from "@/lib/store"
import NavigationButtons from "./navigation-buttons"
import { Delete, Space } from "lucide-react"

interface KeyboardProps {
    onKeyPress: (key: string) => void
    onBackspace: () => void
    onClose: () => void
    type: 'normal' | 'number'
}

function OnScreenKeyboard({ onKeyPress, onBackspace, onClose, type }: KeyboardProps) {
    const normalKeys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ]

    const numberKeys = [
        ['1', '2', '3'],
        ['4', '5', '6'], 
        ['7', '8', '9'],
        ['0']
    ]

    const keys = type === 'number' ? numberKeys : normalKeys

    return (
        <>
            {/* Fully transparent backdrop - only for closing keyboard */}
            <div className="fixed inset-0 z-40" onClick={onClose} />
            
            {/* Keyboard */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--pcr-card)] border-t-2 border-[var(--pcr-card-dark)] p-[40px] shadow-2xl">
                <div className="max-w-[1080px] mx-auto">
                    
                    {/* Keyboard rows */}
                    <div className="space-y-[16px]">
                        {keys.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center gap-[12px]">
                                {row.map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => onKeyPress(key)}
                                        className="w-[100px] h-[80px] bg-[var(--pcr-card-dark)] rounded-[12px] text-[28px] font-normal text-[var(--pcr-text-primary)] active:bg-[var(--pcr-accent)] transition-colors shadow-lg border border-[var(--pcr-card-dark)]"
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                        ))}
                        
                        {/* Bottom row with special keys */}
                        <div className="flex justify-center gap-[12px] mt-[24px]">
                            {type === 'normal' && (
                                <button
                                    onClick={() => onKeyPress(' ')}
                                    className="w-[320px] h-[80px] bg-[var(--pcr-card-dark)] rounded-[12px] text-[24px] font-normal text-[var(--pcr-text-primary)] active:bg-[var(--pcr-accent)] transition-colors flex items-center justify-center gap-[12px] shadow-lg border border-[var(--pcr-card-dark)]"
                                >
                                    <Space className="w-[24px] h-[24px]" />
                                    Space
                                </button>
                            )}
                            
                            <button
                                onClick={onBackspace}
                                className="w-[150px] h-[80px] bg-red-500 rounded-[12px] text-[24px] font-normal text-white active:bg-red-600 transition-colors flex items-center justify-center gap-[12px] shadow-lg border border-red-400"
                            >
                                <Delete className="w-[24px] h-[24px]" />
                                Delete
                            </button>
                            
                            <button
                                onClick={onClose}
                                className="w-[150px] h-[80px] bg-[var(--pcr-accent)] rounded-[12px] text-[24px] font-normal text-white active:bg-[#4a66b3] transition-colors shadow-lg border border-[var(--pcr-accent)]"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function RunSetup() {
    const { runData, setOperatorName, setNumberOfSamples, setCurrentPage } = useRunStore()
    const [activeKeyboard, setActiveKeyboard] = useState<'operator' | 'samples' | null>(null)
    const [activeField, setActiveField] = useState<string>('')

    const handleBack = () => {
        setCurrentPage("dashboard")
    }

    const handleNext = () => {
        setCurrentPage("run-setup-2")
    }

    const handleFieldFocus = (field: 'operator' | 'samples') => {
        setActiveKeyboard(field)
        setActiveField(field)
    }

    const handleKeyPress = (key: string) => {
        switch (activeField) {
            case 'operator':
                setOperatorName(runData.operatorName + key)
                break
            case 'samples':
                setNumberOfSamples(runData.numberOfSamples + key)
                break
        }
    }

    const handleBackspace = () => {
        switch (activeField) {
            case 'operator':
                setOperatorName(runData.operatorName.slice(0, -1))
                break
            case 'samples':
                setNumberOfSamples(runData.numberOfSamples.slice(0, -1))
                break
        }
    }

    const handleCloseKeyboard = () => {
        setActiveKeyboard(null)
        setActiveField('')
    }

    const isFormValid =
        runData.operatorName.trim() !== "" && runData.numberOfSamples.trim() !== ""

    return (
        <>
            <div className={`relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] overflow-hidden ${activeKeyboard ? 'pb-[400px]' : ''}`}>
                {/* Header Section */}
                <div className="absolute w-[912px] h-[140px] left-[84px] top-[115px] z-10">
                    {/* Title */}
                    <h1 className="absolute w-[503px] h-[62px] left-0 top-0 text-[var(--pcr-text-primary)] text-[52px] font-normal leading-[54px]">
                        Run setup
                    </h1>

                    {/* Subtitle */}
                    <p className="absolute w-[888px] h-[39px] left-[12px] top-[72px] text-[var(--pcr-text-primary)] text-[32px] font-light leading-[40px]">
                        Configure your DNA extraction run parameters
                    </p>

                    {/* Blue accent line */}
                    <div className="absolute w-[912px] h-[2px] left-0 top-[138px] bg-[var(--pcr-accent)] rounded-[20px]"></div>
                </div>

                {/* Run Configuration Section */}
                <h2 className="absolute w-[329px] h-[42px] left-[84px] top-[315px] text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px]">
                    Run configuration
                </h2>

                {/* Main Configuration Card - Reduced height since no Run ID */}
                <div className="absolute w-[912px] h-[534px] left-[84px] top-[407px] bg-[var(--pcr-card)] rounded-[20px]">
                    
                    {/* Operator Name - Moved up and centered */}
                    <div className="absolute w-[835px] h-[158px] left-[39px] top-[80px]">
                        <label className="absolute w-[249px] h-[41px] left-0 top-0 text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px]">
                            Operator name
                        </label>
                        <button
                            onClick={() => handleFieldFocus('operator')}
                            className={`absolute w-[835px] h-[92px] left-0 top-[66px] bg-[var(--pcr-input-bg)] rounded-[20px] px-[32px] text-left text-[24px] font-light border-2 transition-colors z-60 ${
                                activeField === 'operator' 
                                    ? 'border-[var(--pcr-accent)] text-[var(--pcr-accent)]' 
                                    : 'border-transparent text-[var(--pcr-text-primary)]'
                            }`}
                        >
                            {runData.operatorName || (
                                <span className="text-[var(--pcr-text-light)]">Enter operator name</span>
                            )}
                        </button>
                    </div>

                    {/* Number of Samples - Moved up and centered */}
                    <div className="absolute w-[835px] h-[158px] left-[39px] top-[296px]">
                        <label className="absolute w-[298px] h-[41px] left-0 top-0 text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px]">
                            Number of samples
                        </label>
                        <button
                            onClick={() => handleFieldFocus('samples')}
                            className={`absolute w-[835px] h-[92px] left-0 top-[66px] bg-[var(--pcr-input-bg)] rounded-[20px] px-[32px] text-left text-[24px] font-light border-2 transition-colors z-60 ${
                                activeField === 'samples' 
                                    ? 'border-[var(--pcr-accent)] text-[var(--pcr-accent)]' 
                                    : 'border-transparent text-[var(--pcr-text-primary)]'
                            }`}
                        >
                            {runData.numberOfSamples || (
                                <span className="text-[var(--pcr-text-light)]">Enter number of samples</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Auto Calculated Requirements Section - Moved up */}
                <h2 className="absolute w-[547px] h-[44px] left-[79px] top-[1001px] text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px]">
                    Auto calculated requirements
                </h2>

                {/* Reagent Volumes Card - Moved up */}
                <div className="absolute w-[429px] h-[365px] left-[79px] top-[1095px] bg-[var(--pcr-card)] rounded-[20px]">
                    <h3 className="absolute w-[284px] h-[41px] left-[72px] top-[21px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px]">
                        Reagent volumes
                    </h3>

                    {/* Reagent Volume Fields */}
                    {[0, 1, 2].map((index) => (
                        <div
                            key={index}
                            className="absolute w-[353px] h-[68px] left-[39px] bg-[var(--pcr-input-bg)] rounded-[20px]"
                            style={{ top: `${91 + index * 92}px` }}
                        >
                            <div className="flex items-center justify-center h-full text-[var(--pcr-text-light)] text-[38px] font-light">
                                -
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pipette Tips Card - Moved up */}
                <div className="absolute w-[429px] h-[281px] left-[567px] top-[1095px] bg-[var(--pcr-card)] rounded-[20px]">
                    <h3 className="absolute w-[284px] h-[41px] left-[72px] top-[22px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px]">
                        Pipette tips
                    </h3>

                    {/* Pipette Tip Fields */}
                    {[0, 1].map((index) => (
                        <div
                            key={index}
                            className="absolute w-[353px] h-[68px] left-[38px] bg-[var(--pcr-input-bg)] rounded-[20px]"
                            style={{ top: `${92 + index * 92}px` }}
                        >
                            <div className="flex items-center justify-center h-full text-[var(--pcr-text-light)] text-[38px] font-light">
                                -
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="absolute bottom-20 left-0 right-0 flex justify-center py-4">
                    <NavigationButtons onBack={handleBack} onNext={handleNext} nextDisabled={!isFormValid} backDisabled={false} />
                </div>
            </div>

            {/* On-Screen Keyboards */}
            {activeKeyboard === 'operator' && (
                <OnScreenKeyboard
                    type="normal"
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onClose={handleCloseKeyboard}
                />
            )}
            
            {activeKeyboard === 'samples' && (
                <OnScreenKeyboard
                    type="number"
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onClose={handleCloseKeyboard}
                />
            )}
        </>
    )
}