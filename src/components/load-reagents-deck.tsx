"use client"

import { useRunStore } from "@/lib/store"
import NavigationButtons from "./navigation-buttons"
import { useState } from "react"

export function LoadReagentsDeck() {
    const { setCurrentPage } = useRunStore()

    const reagentDeckData = [
        {
            name: "Lysis Buffer",
            color: "#FC6468",
            requiredVolume: "900 µL",
            tubeType: "500mL falcon tube",
            loaded: false,
        },
        {
            name: "Protienase K",
            color: "#50D57B",
            requiredVolume: "90 µL",
            tubeType: "1.5 mL eppendorf tube",
            loaded: false,
        },
        {
            name: "LE Buffer",
            color: "#3A7FFF",
            requiredVolume: "450 µL",
            tubeType: "15 mL falcon tube",
            loaded: false,
        },
    ]

    const [loadedReagents, setLoadedReagents] = useState<boolean[]>(new Array(reagentDeckData.length).fill(false))

    const toggleReagentLoaded = (index: number) => {
        const newLoadedReagents = [...loadedReagents]
        newLoadedReagents[index] = !newLoadedReagents[index]
        setLoadedReagents(newLoadedReagents)
    }

    const allReagentsLoaded = loadedReagents.every((loaded) => loaded)

    return (
        <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] overflow-hidden">
            <div className="absolute w-[912px] h-[181px] left-[84px] top-[115px]">
                <h1
                    className="absolute w-[503.37px] h-[61.97px] left-0 top-0 text-[var(--pcr-text-primary)] text-[52px] font-normal leading-[54px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Load reagents
                </h1>

                <p
                    className="absolute w-[888px] h-[80px] left-[calc(50%-888px/2+12px)] top-[72px] text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Position reagents in the highlighted deck positions and verify minimum volumes
                </p>

                <div className="absolute w-[912px] h-[2px] left-0 top-[179px] bg-[var(--pcr-accent)] rounded-[20px]" />
            </div>

            <h2
                className="absolute w-[362px] h-[41px] left-[84px] top-[356px] text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px]"
                style={{ fontFamily: "Space Grotesk" }}
            >
                Reagent deck
            </h2>

            <div className="absolute w-[912px] h-[226px] left-[84px] top-[447px] border-2 border-black dark:border-white rounded-[20px]">
                <div className="absolute w-[85px] h-[84px] left-[95px] top-[71px] border-2 border-black dark:border-white rounded-full">
                    <div className="absolute w-[69px] h-[69px] left-[6.5px] top-[6.5px] bg-[#FC6468] rounded-full" />
                </div>
                <div className="absolute w-[85px] h-[84px] left-[218px] top-[71px] border-2 border-black dark:border-white rounded-full">
                    <div className="absolute w-[68px] h-[69px] left-[6.5px] top-[6.5px] bg-[#50D57B] rounded-full" />
                </div>
                <div className="absolute w-[110px] h-[110px] left-[340px] top-[59px] border-2 border-black dark:border-white rounded-full">
                    <div className="absolute w-[89px] h-[89px] left-[8.5px] top-[8.5px] bg-[#3A7FFF] rounded-full" />
                </div>
                <div className="absolute w-[146px] h-[146px] left-[487px] top-[40px] border-2 border-black dark:border-white rounded-full" />
                <div className="absolute w-[146px] h-[146px] left-[670px] top-[40px] border-2 border-black dark:border-white rounded-full" />
            </div>

            {reagentDeckData.map((reagent, index) => (
                <div
                    key={index}
                    className="absolute w-[912.36px] h-[268.85px] left-[84px] bg-[var(--pcr-card)] rounded-[20px] cursor-pointer active:bg-[var(--pcr-card-dark)] transition-colors duration-150"
                    style={{ top: `${733 + index * 298}px` }}
                    onClick={() => toggleReagentLoaded(index)}
                >
                    <div
                        className="absolute w-[32px] h-[32px] left-[38px] top-[27px] rounded-full"
                        style={{ backgroundColor: reagent.color }}
                    />

                    <h3
                        className="absolute w-[283px] h-[39px] left-[84px] top-[23px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px]"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        {reagent.name}
                    </h3>

                    <p
                        className="absolute w-[482px] h-[39px] left-[84px] top-[85px] text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px]"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Required volume: {reagent.requiredVolume}
                    </p>

                    <p
                        className="absolute w-[482px] h-[39px] left-[84px] top-[135px] text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px]"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Tube type: {reagent.tubeType}
                    </p>

                    <div className="absolute left-[84px] top-[204px] flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={loadedReagents[index]}
                            onChange={(e) => {
                                e.stopPropagation()
                                toggleReagentLoaded(index)
                            }}
                            className="w-[25px] h-[26px] border border-[#C2C2C2] rounded-[5px] bg-transparent accent-[var(--pcr-accent)]"
                        />
                        <span
                            className="text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]"
                            style={{ fontFamily: "Space Grotesk" }}
                        >
                            Loaded
                        </span>
                    </div>
                </div>
            ))}
            <div className="absolute bottom-20 left-0 right-0 flex justify-center py-4">
                <NavigationButtons
                    showBack={true}
                    showNext={true}
                    backDisabled={false}
                    nextDisabled={!allReagentsLoaded}
                    onBack={() => setCurrentPage("load-plastics")}
                    onNext={() => setCurrentPage("load-samples")} // Navigate to load-samples page
                />
            </div>
        </div>
    )
}
