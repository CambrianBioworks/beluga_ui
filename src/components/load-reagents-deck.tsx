"use client"

import { useRunStore } from "@/lib/store"
import NavigationButtons from "./navigation-buttons"
import { useState } from "react"

export function LoadReagentsDeck() {
    const { setCurrentPage, runData } = useRunStore()

    // Check if sample type is cfDNA
    const isCfDNA = runData.sampleType && runData.sampleType.toLowerCase() === 'cfdna'

    // Define reagent data based on sample type
    // Parse reagent data from store's reagentVolumes
    const parseReagentVolumes = () => {
        if (!runData.reagentVolumes || runData.reagentVolumes.length === 0) {
            return []
        }

        // Define color mapping for reagents
        const colorMap: { [key: string]: string } = {
            "Proteinase K": "#50D57B",
            "Lysis Buffer": "#FC6468",
            "LE Buffer": "#3A7FFF",
            "Beads": "#FFD700",
            "Wash Buffer 2": "#FF933A",
            "Wash Buffer 3": "#FF933A",
            "Binding Buffer": "#9D4EDD"
        }

        return runData.reagentVolumes
            .filter(volumeString => {
                const [name] = volumeString.split(': ')
                return name.trim() !== "Wash Buffer 3" // Filter out Wash Buffer 3
            })
            .map(volumeString => {
                // Parse "Reagent Name: Volume" format
                const [name, volume] = volumeString.split(': ')
                return {
                    name: name.trim(),
                    color: colorMap[name.trim()] || "#999999", // Default gray if not found
                    requiredVolume: volume.trim(),
                    loaded: false,
                }
            })
    }

    const reagentDeckData = parseReagentVolumes()

    const [loadedReagents, setLoadedReagents] = useState<boolean[]>(
        new Array(reagentDeckData.length).fill(false)
    )

    if (reagentDeckData.length === 0) {
        return (
            <div className="w-full min-h-screen bg-[var(--pcr-bg)] flex flex-col items-center py-25 px-6">
                <div className="max-w-[912px] w-full mb-8">
                    <h1 className="text-[52px] font-normal text-[var(--pcr-text-primary)]" style={{ fontFamily: "Space Grotesk" }}>
                        Load reagents
                    </h1>
                    <p className="mt-4 text-[28px] font-light text-[var(--pcr-text-primary)]" style={{ fontFamily: "Space Grotesk" }}>
                        No reagent data available. Please go back and complete the run setup.
                    </p>
                </div>
                <NavigationButtons
                    showBack={true}
                    showNext={false}
                    backDisabled={false}
                    nextDisabled={true}
                    onBack={() => setCurrentPage("load-plastics")}
                    onNext={() => { }}
                />
            </div>
        )
    }

    const toggleReagentLoaded = (index: number) => {
        const newLoadedReagents = [...loadedReagents]
        newLoadedReagents[index] = !newLoadedReagents[index]
        setLoadedReagents(newLoadedReagents)
    }

    const allReagentsLoaded = loadedReagents.every((loaded) => loaded)

    // Define deck positions based on sample type
    const renderDeckPositions = () => {
        if (isCfDNA) {
            return (
                <div className="relative w-[700px] h-[350px]">
                    {/* Top row circles */}
                    <div className="absolute w-[196px] h-[196px] left-0 top-0 border-2 border-white rounded-full" />
                    {/* Middle big circle - Wash Buffer 2 (orange) */}
                    <div className="absolute w-[169px] h-[169px] left-[271px] top-[27px] border-2 border-white rounded-full">
                        <div className="absolute w-[149px] h-[149px] left-[9px] top-[9px] bg-[#FF933A] rounded-full" />
                    </div>
                    <div className="absolute w-[146px] h-[146px] left-[514px] top-[50px] border-2 border-white rounded-full" />

                    {/* Bottom row circles - cfDNA pattern: empty, blue, yellow, green, red */}
                    <div className="absolute w-[110px] h-[110px] left-0 top-[232px] border-2 border-white rounded-full" />
                    {/* Blue circle (second position) */}
                    <div className="absolute w-[110px] h-[110px] left-[156px] top-[232px] border-2 border-white rounded-full">
                        <div className="absolute w-[89px] h-[89px] left-[9px] top-[9px] bg-[#3A7FFF] rounded-full" />
                    </div>
                    {/* Yellow circle (Beads) - third position */}
                    <div className="absolute w-[85px] h-[84px] left-[312px] top-[245px] border-2 border-white rounded-full">
                        <div className="absolute w-[68px] h-[69px] left-[7.5px] top-[6.5px] bg-[#FFD700] rounded-full" />
                    </div>
                    {/* Green circle (Proteinase K) - fourth position */}
                    <div className="absolute w-[85px] h-[84px] left-[443px] top-[245px] border-2 border-white rounded-full">
                        <div className="absolute w-[68px] h-[69px] left-[7px] top-[6.5px] bg-[#50D57B] rounded-full" />
                    </div>
                    {/* Red circle (Lysis Buffer) - fifth position */}
                    <div className="absolute w-[85px] h-[84px] left-[574px] top-[245px] border-2 border-white rounded-full">
                        <div className="absolute w-[69px] h-[69px] left-[7px] top-[6px] bg-[#FC6468] rounded-full" />
                    </div>
                </div>
            )
        } else {
            // Original layout for non-cfDNA
            return (
                <div className="relative w-[700px] h-[350px]">
                    <div className="absolute w-[196px] h-[196px] left-0 top-0 border-2 border-white rounded-full" />
                    <div className="absolute w-[169px] h-[169px] left-[271px] top-[27px] border-2 border-white rounded-full" />
                    <div className="absolute w-[146px] h-[146px] left-[514px] top-[50px] border-2 border-white rounded-full" />
                    <div className="absolute w-[110px] h-[110px] left-0 top-[232px] border-2 border-white rounded-full" />
                    <div className="absolute w-[110px] h-[110px] left-[156px] top-[232px] border-2 border-white rounded-full">
                        <div className="absolute w-[89px] h-[89px] left-[8.5px] top-[9.5px] bg-[#3A7FFF] rounded-full" />
                    </div>
                    <div className="absolute w-[85px] h-[84px] left-[312px] top-[245px] border-2 border-white rounded-full" />
                    <div className="absolute w-[85px] h-[84px] left-[443px] top-[245px] border-2 border-white rounded-full">
                        <div className="absolute w-[68px] h-[69px] left-[7.5px] top-[7.5px] bg-[#50D57B] rounded-full" />
                    </div>
                    <div className="absolute w-[85px] h-[84px] left-[574px] top-[245px] border-2 border-white rounded-full">
                        <div className="absolute w-[69px] h-[69px] left-[7px] top-[7px] bg-[#FC6468] rounded-full" />
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="w-full min-h-screen bg-[var(--pcr-bg)] flex flex-col items-center py-25 px-6 overflow-y-auto">
            {/* Header */}
            <div className="max-w-[912px] w-full mb-8">
                <h1
                    className="text-[52px] font-normal text-[var(--pcr-text-primary)]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Load reagents
                </h1>
                <p
                    className="mt-4 text-[28px] font-light text-[var(--pcr-text-primary)]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Position reagents in the highlighted deck positions and verify minimum
                    volumes
                </p>
                <div className="mt-6 h-[2px] bg-[var(--pcr-accent)] rounded" />
            </div>

            {/* Deck section */}
            <div className="max-w-[912px] w-full mb-8">
                <h2
                    className="text-[36px] font-normal text-[var(--pcr-text-primary)] mb-10"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Reagent deck
                </h2>

                <div className="w-full h-[417px] border-2 border-black dark:border-white rounded-[20px] flex items-center justify-center">
                    {/* Deck container (centred inside main rectangle) */}
                    {renderDeckPositions()}
                </div>
            </div>

            <div className="flex flex-col gap-8 max-w-[912px] w-full">
                {reagentDeckData.map((reagent, index) => (
                    <button
                        key={index}
                        onClick={() => toggleReagentLoaded(index)}
                        className="bg-[#212429] rounded-[20px] h-[268px] w-full flex flex-col justify-between p-6 text-left hover:bg-[#2a2e35] active:bg-[var(--pcr-accent)] transition-colors cursor-pointer"
                        style={{ touchAction: 'manipulation' }}
                    >
                        {/* Top row: dot + name */}
                        <div className="flex items-center gap-4">
                            <div
                                className="w-[32px] h-[32px] rounded-full"
                                style={{ backgroundColor: reagent.color }}
                            />
                            <h3
                                className="text-[32px] font-normal text-white"
                                style={{ fontFamily: "Space Grotesk" }}
                            >
                                {reagent.name}
                            </h3>
                        </div>

                        {/* Middle details */}
                        <div className="ml-[48px] space-y-2">
                            <p className="text-[24px] font-light text-white">
                                Required volume: {reagent.requiredVolume}
                            </p>
                        </div>

                        {/* Bottom row: visual checkbox + loaded */}
                        <div className="ml-[48px] flex items-center gap-3">
                            <div
                                className={`w-[25px] h-[26px] border-2 rounded-[5px] flex items-center justify-center transition-colors ${loadedReagents[index]
                                    ? 'bg-[var(--pcr-accent)] border-[var(--pcr-accent)]'
                                    : 'bg-transparent border-[#C2C2C2]'
                                    }`}
                            >
                                {loadedReagents[index] && (
                                    <svg
                                        className="w-[16px] h-[16px] text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </div>
                            <span className="text-[28px] font-light text-white">
                                Loaded
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Navigation buttons at bottom */}
            <div className="max-w-[912px] w-full flex justify-center mt-16">
                <NavigationButtons
                    showBack={true}
                    showNext={true}
                    backDisabled={false}
                    nextDisabled={!allReagentsLoaded}
                    onBack={() => setCurrentPage("load-plastics")}
                    onNext={() => setCurrentPage("load-samples")}
                />
            </div>
        </div>
    )
}