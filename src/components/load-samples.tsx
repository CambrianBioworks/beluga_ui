"use client"

import { useRunStore } from "@/lib/store"
import NavigationButtons from "./navigation-buttons"
import { useState } from "react"
import { Camera, Check } from "lucide-react"

export default function LoadSamples() {
    const { setCurrentPage } = useRunStore()
    const [manualBarcode, setManualBarcode] = useState("")
    const [scannedSamples, setScannedSamples] = useState([
        { id: 1, barcode: "1234567", scanned: true },
        { id: 2, barcode: "4568574", scanned: true },
        { id: 3, barcode: "5638290", scanned: true },
        { id: 4, barcode: "4820947", scanned: true },
    ])

    const handleAddBarcode = () => {
        if (manualBarcode.trim()) {
            const newSample = {
                id: scannedSamples.length + 1,
                barcode: manualBarcode.trim(),
                scanned: true,
            }
            setScannedSamples([...scannedSamples, newSample])
            setManualBarcode("")
        }
    }

    const handleScanBarcode = () => {
        // Simulate barcode scanning
        console.log("[v0] Scan barcode functionality triggered")
    }

    const handleKeyPress = (e: { key: string }) => {
        if (e.key === "Enter") {
            handleAddBarcode()
        }
    }

    return (
        <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] overflow-hidden">
            {/* Header Section */}
            <div className="absolute w-[912px] h-[181px] left-[84px] top-[115px]">
                <h1
                    className="absolute w-[503.37px] h-[61.97px] left-0 top-0 text-[var(--pcr-text-primary)] text-[52px] font-normal leading-[54px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Load samples
                </h1>

                <p
                    className="absolute w-[888px] h-[80px] left-[calc(50%-888px/2+12px)] top-[72px] text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Load EDTA tube in the rack and scan barcodes to identify the samples
                </p>

                <div className="absolute w-[912px] h-[2px] left-0 top-[179px] bg-[var(--pcr-accent)] rounded-[20px]" />
            </div>

            {/* EDTA tube rack title */}
            <h2
                className="absolute w-[329px] h-[42px] left-[calc(50%-329px/2-291.5px)] top-[356px] text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px]"
                style={{ fontFamily: "Space Grotesk" }}
            >
                EDTA tube rack
            </h2>

            {/* Left tube rack container */}
            <div className="absolute w-[74px] h-[984px] left-[84px] top-[448px]">
                {/* Rack outline */}
                <div className="absolute inset-0 border-2 border-black dark:border-white rounded-[20px]" />

                {/* Sample positions */}
                {Array.from({ length: 16 }, (_, index) => {
                    const isFilled = index < 4
                    const yPosition = 20 + index * 60

                    return (
                        <div
                            key={index + 1}
                            className="absolute left-1/2 transform -translate-x-1/2"
                            style={{ top: `${yPosition}px` }}
                        >
                            <div
                                className={`w-[35px] h-[35px] rounded-full border-2 flex items-center justify-center ${isFilled ? "bg-black dark:bg-white border-black dark:border-white" : "border-black dark:border-white"
                                    }`}
                            >
                                {isFilled && (
                                    <span
                                        className="text-white dark:text-black text-[16px] font-light leading-[16px] text-center"
                                        style={{ fontFamily: "Space Grotesk" }}
                                    >
                                        {index + 1}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Right tube rack container */}
            <div className="absolute w-[74px] h-[984px] left-[189px] top-[448px]">
                {/* Rack outline */}
                <div className="absolute inset-0 border-2 border-black dark:border-white rounded-[20px]" />

                {/* Sample positions */}
                {Array.from({ length: 16 }, (_, index) => {
                    const yPosition = 20 + index * 60

                    return (
                        <div
                            key={index + 17}
                            className="absolute left-1/2 transform -translate-x-1/2"
                            style={{ top: `${yPosition}px` }}
                        >
                            <div className="w-[35px] h-[35px] rounded-full border-2 border-black dark:border-white" />
                        </div>
                    )
                })}
            </div>

            {/* Scan barcode button */}
            <div className="absolute w-[670px] h-[93px] left-[326px] top-[448px]">
                <button
                    onClick={handleScanBarcode}
                    className="w-full h-full bg-[var(--pcr-card)] rounded-[20px] active:bg-[var(--pcr-card-dark)] transition-colors duration-150 flex items-center justify-center gap-4 hover:bg-[var(--pcr-card-dark)]"
                >
                    <Camera className="w-[50px] h-[50px] text-[var(--pcr-text-primary)]" />
                    <span
                        className="text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Scan barcode
                    </span>
                </button>
            </div>

            {/* Manual barcode entry section */}
            <div className="absolute w-[670px] h-[185px] left-[326px] top-[601px]">
                <h3
                    className="absolute w-[421px] h-[42px] left-[calc(50%-421px/2+2.89px)] top-0 text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Manual barcode entry
                </h3>

                <div className="absolute w-[502.54px] h-[93px] left-0 top-[92px] flex">
                    <input
                        type="text"
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter barcode manually"
                        className="flex-1 h-full bg-[var(--pcr-card)] rounded-l-[20px] px-6 text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px] placeholder-[#B3B3B3] border-none outline-none focus:ring-2 focus:ring-[var(--pcr-accent)]"
                        style={{ fontFamily: "Space Grotesk" }}
                        inputMode="text"
                        enterKeyHint="done"
                        autoComplete="off"
                    />
                </div>

                <button
                    onClick={handleAddBarcode}
                    disabled={!manualBarcode.trim()}
                    className="absolute w-[151.86px] h-[93px] left-[518.14px] top-[92px] bg-[var(--pcr-card)] rounded-[20px] transition-colors duration-150 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--pcr-card-dark)] active:bg-[var(--pcr-card-dark)]"
                >
                    <span
                        className="text-[#B3B3B3] text-[24px] font-normal leading-[40px] text-center"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Add
                    </span>
                </button>
            </div>

            {/* Scanned samples section */}
            <div className="absolute w-[669.61px] h-[585.61px] left-[326px] top-[846px]">
                <h3
                    className="absolute w-[414px] h-[42px] left-[calc(50%-414px/2-0.61px)] top-0 text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Scanned samples ({scannedSamples.length})
                </h3>

                <div className="absolute w-[669.61px] h-[493.61px] left-0 top-[92px] bg-[var(--pcr-card)] rounded-[20px] overflow-y-auto">
                    {scannedSamples.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <span
                                className="text-[#B3B3B3] text-[24px] font-light leading-[40px]"
                                style={{ fontFamily: "Space Grotesk" }}
                            >
                                No samples scanned yet
                            </span>
                        </div>
                    ) : (
                        scannedSamples.map((sample, index) => (
                            <div
                                key={sample.id}
                                className="absolute w-[608.57px] h-[75.57px] left-[31.2px] pb-10 bg-[var(--pcr-bg)] rounded-[20px] transition-colors hover:bg-[#3A3D42]"
                                style={{ top: `${44.61 + index * 104.27}px` }}
                            >
                                <div className="absolute w-[48px] h-[48px] left-[15px] top-[14px] bg-[var(--pcr-card)] rounded-full flex items-center justify-center">
                                    <span
                                        className="text-[#B3B3B3] text-[20px] font-light leading-[20px] text-center"
                                        style={{ fontFamily: "Space Grotesk" }}
                                    >
                                        {sample.id}
                                    </span>
                                </div>

                                <span
                                    className="absolute w-[278px] h-[39px] left-[85px] top-[18px] text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px]"
                                    style={{ fontFamily: "Space Grotesk" }}
                                >
                                    {sample.barcode}
                                </span>

                                {sample.scanned && (
                                    <div className="absolute w-[50px] h-[50px] right-[15px] top-[13px] flex items-center justify-center">
                                        <div className="w-[37.5px] h-[37.5px] border-2 border-[#179824] rounded-full flex items-center justify-center">
                                            <Check className="w-[12.5px] h-[12.5px] text-[#179824]" strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="absolute bottom-20 left-0 right-0 flex justify-center py-4">

                <NavigationButtons
                    showBack={true}
                    showNext={true}
                    backDisabled={false}
                    nextDisabled={scannedSamples.length === 0}
                    onBack={() => setCurrentPage("load-reagents-deck")}
                    onNext={() => setCurrentPage("load-samples-rack")}
                />
            </div>
        </div>
    )
}
