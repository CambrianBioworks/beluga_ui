"use client"

import { useState } from "react"
import { useRunStore } from "@/lib/store"
import NavigationButtons from "./navigation-buttons"
import { RotateCcw } from "lucide-react"

export default function ElutionWellSelection() {
    const { setCurrentPage, setSelectedWells: setStoreSelectedWells, runData } = useRunStore()
    const [selectedWells, setSelectedWells] = useState<string[]>([])
    console.log("Number of samples from store:", runData)

    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"]
    const columns = Array.from({ length: 12 }, (_, i) => i + 1)

    const maxWells = parseInt(runData.numberOfSamples) || 4

    const toggleWell = (well: string) => {
        if (selectedWells.length < maxWells || selectedWells.includes(well)) {
            setSelectedWells((prev) =>
                prev.includes(well) ? prev.filter((w) => w !== well) : prev.length < maxWells ? [...prev, well] : prev,
            )
        }
    }

    const fillPattern1 = () => {
        const wells = []
        for (const row of rows) {
            for (let col = 1; col <= 12; col++) {
                wells.push(`${row}${col}`)
                if (wells.length >= maxWells) break
            }
            if (wells.length >= maxWells) break
        }
        setSelectedWells(wells.slice(0, maxWells))
    }

    const fillPattern2 = () => {
        const wells = []
        for (let col = 1; col <= 12; col++) {
            for (const row of rows) {
                wells.push(`${row}${col}`)
                if (wells.length >= maxWells) break
            }
            if (wells.length >= maxWells) break
        }
        setSelectedWells(wells.slice(0, maxWells))
    }

    const clearSelection = () => {
        setSelectedWells([])
    }

    const handleBack = () => {
        setCurrentPage("load-samples-rack")
    }

    const handleNext = () => {
        setStoreSelectedWells(selectedWells)
        setCurrentPage("pre-run-summary")
    }

    return (
        <div className="relative w-full max-w-[1080px] mx-auto h-[1920px] bg-[var(--pcr-bg)] text-[var(--pcr-text-primary)] overflow-hidden">
            {/* Header */}
            <div className="absolute left-[calc(50%-544px/2-184px)] top-[115px] w-[544px] h-[62px]">
                <h1 className="font-normal text-[52px] leading-[54px] text-[var(--pcr-text-primary)]">
                    Elution well selection
                </h1>
            </div>

            {/* Subtitle */}
            <div className="absolute left-[calc(50%-888px/2-12px)] top-[187px] w-[888px] h-[39px]">
                <p className="font-light text-[32px] leading-[40px] text-[var(--pcr-text-primary)]">
                    Choose {maxWells} wells for DNA elution on the 96-well plate
                </p>
            </div>

            {/* Blue accent line */}
            <div className="absolute left-[84px] top-[253px] w-[912px] h-[2px] bg-[var(--pcr-accent)] rounded-[20px]" />

            {/* 96-well elution plate header */}
            <div className="absolute left-[calc(50%-360px/2-276px)] top-[315px] w-[360px] h-[42px]">
                <h2 className="font-normal text-[36px] leading-[40px] text-[var(--pcr-text-primary)]">96-well elution plate</h2>
            </div>

            {/* Selection counter */}
            <div className="absolute right-[84px] top-[315px]">
                <span className="font-normal text-[36px] leading-[40px] text-[var(--pcr-text-secondary)]">
                    {selectedWells.length}/{maxWells} selected
                </span>
            </div>

            {/* Well plate container */}
            <div className="absolute left-[84px] top-[380px] w-[912px] h-[628px]">
                {/* Outer border with 6-sided polygon shape using SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 912 628">
                    <path
                        d="M 60 0 L 912 0 L 912 628 L 60 628 L 0 568 L 0 60 Z"
                        fill="none"
                        stroke="var(--pcr-text-light)"
                        strokeWidth="2"
                    />
                </svg>

                <div className="relative w-[912px] h-[628px]">
                    {/* Column number labels positioned between borders */}
                    <div className="absolute top-[14px] left-[94px] flex gap-[56.4px]">
                        {columns.map((col) => (
                            <span key={col} className="text-[var(--pcr-text-primary)] text-[17.5px] font-normal">
                                {col}
                            </span>
                        ))}
                    </div>

                    {/* Row letter labels positioned between borders */}
                    <div className="absolute top-[80px] left-[20px] flex flex-col gap-[40px]">
                        {rows.map((row) => (
                            <span key={row} className="text-[var(--pcr-text-primary)] text-[18px] font-normal">
                                {row}
                            </span>
                        ))}
                    </div>

                    {/* Inner border container for well grid */}
                    <div className="absolute top-[50px] left-[56px] w-[831px] h-[553px] bg-[var(--pcr-card)] rounded-[15px] border border-[var(--pcr-text-light)]/20">
                        {/* Well grid positioned within inner container */}
                        <div className="absolute top-[8px] left-[10px]">
                            {rows.map((row) => (
                                <div key={row} className="flex gap-[8.3px] mb-[8px] last:mb-0">
                                    {columns.map((col) => {
                                        const wellId = `${row}${col}`
                                        const isSelected = selectedWells.includes(wellId)
                                        return (
                                            <button
                                                key={wellId}
                                                onClick={() => toggleWell(wellId)}
                                                className="w-[60px] h-[60px] rounded-full border-2 flex items-center justify-center active:scale-95 transition-transform"
                                                style={{
                                                    backgroundColor: isSelected ? "var(--pcr-text-primary)" : "transparent",
                                                    borderColor: isSelected ? "var(--pcr-text-primary)" : "var(--pcr-text-primary)",
                                                }}
                                            >
                                                {isSelected && (
                                                    <span className="text-[var(--pcr-bg)] text-[20px] font-medium">
                                                        {selectedWells.indexOf(wellId) + 1}
                                                    </span>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-fill options */}
            <div className="absolute left-[84px] top-[1077px] w-[429px] h-[457px]">
                {/* Auto-fill options header */}
                <div className="absolute left-[calc(50%-291px/2-69px)] top-0 w-[291px] h-[42px]">
                    <h3 className="font-normal text-[36px] leading-[40px] text-[var(--pcr-text-primary)]">Auto-fill options</h3>
                </div>

                {/* Auto-fill container */}
                <div className="absolute top-[92px] w-[429px] h-[365px] bg-[var(--pcr-card)] rounded-[20px]">
                    {/* Button container */}
                    <div className="absolute left-[39px] top-[46px] w-[352.56px] h-[274px] space-y-[23px]">
                        <button
                            onClick={fillPattern1}
                            className="w-[352.56px] h-[68px] bg-[var(--pcr-card-dark)] rounded-[20px] py-10 flex items-center justify-center text-[24px] font-light text-[var(--pcr-text-primary)] active:bg-[var(--pcr-accent)] transition-colors"
                        >
                            Fill by rows (A1→A12, B1→B12...)
                        </button>

                        <button
                            onClick={fillPattern2}
                            className="w-[352.56px] h-[68px] bg-[var(--pcr-card-dark)] rounded-[20px] py-10 flex items-center justify-center text-[24px] font-light text-[var(--pcr-text-primary)] active:bg-[var(--pcr-accent)] transition-colors"
                        >
                            Fill by columns (A1→H1, A2→H2...)
                        </button>

                        <button
                            onClick={clearSelection}
                            className="w-[352.56px] h-[68px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center justify-center gap-[12px] text-[24px] font-light text-[var(--pcr-text-primary)] active:bg-[var(--pcr-accent)] transition-colors"
                        >
                            <RotateCcw className="w-[24px] h-[24px] text-[#D94343]" />
                            Clear selection
                        </button>
                    </div>
                </div>
            </div>

            {/* Selected wells */}
            <div className="absolute left-[566px] top-[1077px] w-[429px] h-[457px]">
                {/* Selected wells header */}
                <div className="absolute left-[calc(50%-360px/2+34.5px)] top-0 w-[360px] h-[42px]">
                    <h3 className="font-normal text-[36px] leading-[40px] text-[var(--pcr-text-primary)]">Selected wells</h3>
                </div>

                {/* Selected wells container */}
                <div className="absolute top-[92px] w-[429px] h-[365px] bg-[var(--pcr-card)] rounded-[20px]">
                    {selectedWells.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="font-light text-[24px] leading-[40px] text-center text-[var(--pcr-text-secondary)]">
                                No wells selected
                            </span>
                        </div>
                    ) : (
                        <div className="p-4 h-full overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                {selectedWells.map((well, index) => (
                                    <div key={well} className="relative w-full h-[60px]">
                                        {/* Well card background */}
                                        <div className="absolute inset-0 bg-[var(--pcr-card-dark)] rounded-[15px]" />

                                        {/* Well position text */}
                                        <div className="absolute left-4 top-[50%] transform -translate-y-1/2">
                                            <span className="font-light text-[20px] text-[var(--pcr-text-primary)]">{well}</span>
                                        </div>

                                        {/* Number circle */}
                                        <div className="absolute right-3 top-[50%] transform -translate-y-1/2 w-[32px] h-[32px] bg-[var(--pcr-text-primary)] rounded-full flex items-center justify-center">
                                            <span className="font-light text-[16px] text-[var(--pcr-bg)]">{index + 1}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center p-8">
                <NavigationButtons
                    showBack={true}
                    showNext={true}
                    nextDisabled={selectedWells.length !== maxWells}
                    onBack={handleBack}
                    onNext={handleNext}
                />
            </div>
        </div>
    )
}