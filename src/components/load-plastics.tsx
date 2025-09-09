"use client"

import { useRunStore } from "@/lib/store"
import NavigationButtons from "./navigation-buttons"
import { Clock } from "lucide-react"

export function LoadPlastics() {
    const { setCurrentPage } = useRunStore()

    const reagentData = [
        { quantity: "32", label: "Cartridges", position: { left: "84px", top: "470px" } },
        { quantity: "32", label: "Elution tubes", position: { left: "398.52px", top: "470px" } },
        { quantity: "32", label: "1000μL pipette tips", position: { left: "713.99px", top: "470px" } },
        { quantity: "72", label: "200μL pipette tips", position: { left: "84px", top: "681px" } },
        { quantity: "960μL", label: "Proteinase K", position: { left: "398.52px", top: "681px" } },
        { quantity: "16mL", label: "Binding buffer", position: { left: "713.03px", top: "681px" } },
        { quantity: "4", label: "Combs", position: { left: "84px", top: "895px" } },
    ]

    return (
        <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] overflow-y-auto pb-[148px]">
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

            <p
                className="absolute w-[862px] h-[44px] left-[calc(50%-862px/2-25px)] top-[361px] text-[var(--pcr-text-primary)] text-[36px] font-light leading-[40px]"
                style={{ fontFamily: "Space Grotesk" }}
            >
                Choose an entry to see its corresponding spot
            </p>

            {reagentData.map((reagent, index) => (
                <div
                    key={index}
                    className="absolute w-[282.01px] h-[168px] bg-[var(--pcr-card)] rounded-[20px] active:bg-[var(--pcr-card-dark)] transition-colors duration-150 cursor-pointer"
                    style={{
                        left: reagent.position.left,
                        top: reagent.position.top,
                    }}
                >
                    <div
                        className="absolute text-[var(--pcr-text-primary)] text-[40px] font-normal leading-[41px] text-right"
                        style={{
                            fontFamily: "Space Grotesk",
                            right: "20px",
                            top: "20px",
                            width: "fit-content",
                        }}
                    >
                        {reagent.quantity}
                    </div>
                    <div
                        className="absolute text-[var(--pcr-text-primary)] text-[24px] font-light leading-[31px] text-center"
                        style={{
                            fontFamily: "Space Grotesk",
                            left: "50%",
                            bottom: "30px",
                            transform: "translateX(-50%)",
                            width: "240px",
                        }}
                    >
                        {reagent.label}
                    </div>
                </div>
            ))}

            <div className="absolute w-[596.53px] h-[168px] left-[398.52px] top-[895px] bg-[var(--pcr-accent)] rounded-[20px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
                <div className="absolute w-[548.16px] h-[40px] left-[24px] top-[64px] flex items-center justify-center gap-4">
                    <Clock className="w-[39px] h-[39px] text-white" strokeWidth={2} />
                    <span className="text-white text-[32px] font-light leading-[40px]" style={{ fontFamily: "Space Grotesk" }}>
                        Estimated run time: 60 minutes
                    </span>
                </div>
            </div>

            <div
                className="absolute w-[812px] h-[469px] left-[calc(50%-812px/2+5px)] top-[1125px] bg-cover bg-center"
                style={{
                    backgroundImage: `url(/placeholder.svg?height=469&width=812&query=PCR+extraction+device+equipment+deck+with+reagent+positions)`,
                }}
            />
            <div className="absolute bottom-20 left-0 right-0 flex justify-center py-4">
                <NavigationButtons
                    showBack={true}
                    showNext={true}
                    backDisabled={false}
                    nextDisabled={false}
                    onBack={() => setCurrentPage("run-setup")}
                    onNext={() => setCurrentPage("load-reagents-deck")}
                />
            </div>
        </div>
    )
}
