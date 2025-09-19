"use client"

import { useRunStore } from "@/lib/store"
import NavigationButtons from "./navigation-buttons"
import { useState, useEffect } from "react"
import { Camera, Check, Loader2 } from "lucide-react"
import { useSocket } from "@/lib/useSocket"

export default function LoadSamples() {
    const { setCurrentPage, runData } = useRunStore()
    const [manualBarcode, setManualBarcode] = useState("")
    const [isScanning, setIsScanning] = useState(false)  // Add this
    const { scanBarcode, isConnected } = useSocket()
    const [scannedSamples, setScannedSamples] = useState<{ id: number, barcode: string, scanned: boolean }[]>([])
    const [imageLoaded, setImageLoaded] = useState<boolean>(false)

    const isCfDNA = runData.sampleType && runData.sampleType.toLowerCase() === 'cfdna'
    const numberOfSamples = parseInt(runData.numberOfSamples) || 0

    // Check if input method is 96-well plate
    const is96WellPlate = runData.sampleInputMethod && (
        runData.sampleInputMethod.toLowerCase().includes('96') ||
        runData.sampleInputMethod.toLowerCase().includes('deep well')
    )

    const isMCT = runData.sampleInputMethod && runData.sampleInputMethod.toLowerCase().includes('mct')
    const isPCR = runData.sampleInputMethod && runData.sampleInputMethod.toLowerCase().includes('pcr')

    // Preload MCT plate image if needed
    useEffect(() => {
        if (isMCT) {
            const preloadImage = async () => {
                const imagePromises = ["/MCT_plate.png"].map((src, index) => {
                    return new Promise<string>((resolve, reject) => {
                        const img = new window.Image()

                        // Add timeout for slow RPi
                        const timeoutId = setTimeout(() => {
                            console.warn(`Image timeout: ${src}`)
                            reject(new Error(`Timeout loading ${src}`))
                        }, 15000) // 15 second timeout for RPi

                        img.onload = () => {
                            clearTimeout(timeoutId)
                            console.log(`✅ MCT Image loaded: ${src}`)
                            resolve(src)
                        }

                        img.onerror = (error) => {
                            clearTimeout(timeoutId)
                            console.error(`❌ MCT Image failed: ${src}`, error)
                            reject(new Error(`Failed to load ${src}`))
                        }

                        img.src = src
                    })
                })

                try {
                    await Promise.all(imagePromises)
                    setImageLoaded(true)
                    console.log('MCT image loaded successfully')
                } catch (error) {
                    console.error('MCT image failed to load:', error)
                    setImageLoaded(true) // Still show page even if image fails
                }
            }

            preloadImage()
        } else {
            setImageLoaded(true) // No image to load for other layouts
        }
    }, [isMCT])

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

    const handleScanBarcode = async () => {
        if (!isConnected) {
            console.error("Not connected to server")
            return
        }

        setIsScanning(true)

        try {
            const result = await scanBarcode()
            console.log("Barcode scan result:", result)

            // Convert the result object to scanned samples format
            const newSamples = Object.entries(result).map(([id, barcode]) => ({
                id: parseInt(id),
                barcode: barcode as string,
                scanned: true
            }))

            setScannedSamples(newSamples)

        } catch (error) {
            console.error("Barcode scan failed:", error)
            // Optionally show error to user
        } finally {
            setIsScanning(false)
        }
    }

    const handleKeyPress = (e: { key: string }) => {
        if (e.key === "Enter") {
            handleAddBarcode()
        }
    }

    if (isMCT && !imageLoaded) {
        return (
            <div className="w-full min-h-screen bg-[var(--pcr-bg)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="w-16 h-16 text-[var(--pcr-accent)] animate-spin" />
                    <p className="text-[var(--pcr-text-primary)] text-[28px] font-light" style={{ fontFamily: "Space Grotesk" }}>
                        Loading...
                    </p>
                </div>
            </div>
        )
    }

    // For 96-well plate layout
    if (is96WellPlate || isMCT || isPCR) {
        return (
            <div className="w-full min-h-screen bg-[var(--pcr-bg)] flex flex-col items-center py-25 px-6 overflow-y-auto">
                {/* Header */}
                <div className="max-w-[912px] w-full mb-8">
                    <h1 className="text-[52px] font-normal text-[var(--pcr-text-primary)]" style={{ fontFamily: "Space Grotesk" }}>
                        Load samples
                    </h1>
                    <p className="mt-4 text-[28px] font-light text-[var(--pcr-text-primary)]" style={{ fontFamily: "Space Grotesk" }}>
                        {isMCT
                            ? "Load the MCT tube and scan barcode to identify the sample"
                            : "Load the samples into the 96-deep well plate and scan barcodes to identify the samples"
                        }
                    </p>
                    <div className="mt-6 h-[2px] bg-[var(--pcr-accent)] rounded" />
                </div>

                {/* 96 Deep well plate title */}
                <div className="max-w-[912px] w-full mb-8">
                    <h2 className="text-[36px] font-normal text-[var(--pcr-text-primary)]" style={{ fontFamily: "Space Grotesk" }}>
                        {isMCT ? "MCT tube" : "96 deep well plate"}
                    </h2>
                </div>

                {isMCT && (
                    <div className="max-w-[956px] w-full mb-12">
                        <div className="flex justify-center">
                            <div className="relative">
                                <img
                                    src="/MCT_plate.png"
                                    alt="MCT Plate"
                                    style={{ width: '956px', height: '610px', objectFit: 'contain' }}
                                    className="object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        console.error('MCT Image display failed:', target.src)
                                    }}
                                />

                                {/* Overlay 32 circles positioned equally across the plate */}
                                <div className="absolute inset-0 w-[956px] h-[610px]">
                                    {/* Generate 32 circles in a 4x8 grid layout */}
                                    {Array.from({ length: 32 }, (_, index) => {
                                        const row = Math.floor(index / 8); // 4 rows (0-3)
                                        const col = index % 8; // 8 columns (0-7)

                                        // Calculate position with margins and equal spacing
                                        const marginX = 96.5; // Left/right margin
                                        const marginY = 54; // Top/bottom margin
                                        const availableWidth = 956 - (marginX * 2);
                                        const availableHeight = 610 - (marginY * 2);
                                        const spacingX = availableWidth / 7.1; // 7 gaps between 8 columns
                                        const spacingY = availableHeight / 3.41; // 3 gaps between 4 rows

                                        const x = marginX + (col * spacingX);
                                        const y = marginY + (row * spacingY);

                                        // Calculate sample number for vertical fill (column by column, top to bottom)
                                        const sampleNumber = col * 4 + row + 1; // Fill vertically: column-first order
                                        const isFilled = sampleNumber <= numberOfSamples;

                                        return (
                                            <div
                                                key={index}
                                                className={`absolute w-[70px] h-[70px] rounded-full border-2 flex items-center justify-center transition-colors ${isFilled
                                                    ? "bg-[var(--pcr-text-primary)] border-[var(--pcr-text-primary)]"
                                                    : "bg-transparent border-[var(--pcr-text-primary)] border-opacity-50"
                                                    }`}
                                                style={{
                                                    left: `${x - 11}px`, // Subtract half of circle width to center
                                                    top: `${y + 28}px`,  // Subtract half of circle height to center
                                                }}
                                            >
                                                {isFilled && (
                                                    <span className="text-[var(--pcr-bg)] text-[16px] font-medium">
                                                        {sampleNumber}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 96-well plate grid */}
                {!isMCT && (
                    <div className="max-w-[912px] w-full mb-12">
                        <div className="relative w-[912px] h-[628px]">
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
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <span key={i + 1} className="text-[var(--pcr-text-primary)] text-[17.5px] font-normal">
                                            {i + 1}
                                        </span>
                                    ))}
                                </div>

                                {/* Row letter labels positioned between borders */}
                                <div className="absolute top-[80px] left-[20px] flex flex-col gap-[40px]">
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((row) => (
                                        <span key={row} className="text-[var(--pcr-text-primary)] text-[18px] font-normal">
                                            {row}
                                        </span>
                                    ))}
                                </div>

                                {/* Inner border container for well grid */}
                                <div className="absolute top-[50px] left-[56px] w-[831px] h-[553px] bg-[var(--pcr-card)] rounded-[15px] border border-[var(--pcr-text-light)]/20">
                                    {/* Well grid positioned within inner container */}
                                    <div className="absolute top-[8px] left-[10px]">
                                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((row, rowIndex) => (
                                            <div key={row} className="flex gap-[8.3px] mb-[8px] last:mb-0">
                                                {Array.from({ length: 12 }, (_, colIndex) => {
                                                    // Calculate well number in column-by-column order
                                                    const wellNumber = colIndex * 8 + rowIndex + 1
                                                    const isFilled = wellNumber <= numberOfSamples
                                                    const wellId = `${row}${colIndex + 1}`

                                                    return (
                                                        <div
                                                            key={wellId}
                                                            className={`w-[60px] h-[60px] rounded-full border-2 flex items-center justify-center ${isFilled
                                                                ? "bg-[var(--pcr-text-primary)] border-[var(--pcr-text-primary)]"
                                                                : "border-[var(--pcr-text-primary)]"
                                                                }`}
                                                        >
                                                            {isFilled && (
                                                                <span className="text-[var(--pcr-bg)] text-[20px] font-medium">
                                                                    {wellId}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scan barcode button */}
                <div className="max-w-[912px] w-full mb-8">
                    <button
                        onClick={handleScanBarcode}
                        disabled={!isConnected || isScanning}
                        className="w-full h-[93px] bg-[var(--pcr-card)] rounded-[20px] active:bg-[var(--pcr-card-dark)] transition-colors duration-150 flex items-center justify-center gap-4 hover:bg-[var(--pcr-card-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isScanning ? (
                            <>
                                <Loader2 className="w-[50px] h-[50px] text-[var(--pcr-accent)] animate-spin" />
                                <span className="text-[var(--pcr-text-primary)] text-[28px] font-light" style={{ fontFamily: "Space Grotesk" }}>
                                    Scanning...
                                </span>
                            </>
                        ) : (
                            <>
                                <Camera className="w-[50px] h-[50px] text-[var(--pcr-text-primary)]" />
                                <span className="text-[var(--pcr-text-primary)] text-[28px] font-light" style={{ fontFamily: "Space Grotesk" }}>
                                    Scan barcode
                                </span>
                            </>
                        )}
                    </button>
                </div>

                {/* Manual barcode entry section */}
                <div className="max-w-[912px] w-full mb-8">
                    <h3 className="text-[36px] font-normal text-[var(--pcr-text-primary)] mb-6" style={{ fontFamily: "Space Grotesk" }}>
                        Manual barcode entry
                    </h3>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter barcode manually"
                            className="flex-1 h-[93px] bg-[var(--pcr-card)] rounded-[20px] px-6 text-[var(--pcr-text-primary)] text-[24px] font-light placeholder-[#B3B3B3] border-none outline-none focus:ring-2 focus:ring-[var(--pcr-accent)]"
                            style={{ fontFamily: "Space Grotesk" }}
                        />
                        <button
                            onClick={handleAddBarcode}
                            disabled={!manualBarcode.trim()}
                            className="w-[172px] h-[93px] bg-[var(--pcr-card)] rounded-[20px] transition-colors duration-150 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--pcr-card-dark)] active:bg-[var(--pcr-card-dark)]"
                        >
                            <span className="text-[#B3B3B3] text-[24px] font-normal" style={{ fontFamily: "Space Grotesk" }}>
                                Add
                            </span>
                        </button>
                    </div>
                </div>

                {/* Scanned samples section */}
                <div className="max-w-[912px] w-full mb-12">
                    <h3 className="text-[36px] font-normal text-[var(--pcr-text-primary)] mb-6" style={{ fontFamily: "Space Grotesk" }}>
                        Scanned samples ({scannedSamples.length})
                    </h3>
                    <div className="bg-[var(--pcr-card)] rounded-[20px] min-h-[493px] p-8">
                        {scannedSamples.length === 0 ? (
                            <div className="flex items-center justify-center h-[400px]">
                                <span className="text-[#B3B3B3] text-[24px] font-light" style={{ fontFamily: "Space Grotesk" }}>
                                    No samples scanned yet
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {scannedSamples.map((sample) => (
                                    <div key={sample.id} className="bg-[var(--pcr-bg)] rounded-[20px] p-4 flex items-center">
                                        <div className="w-[48px] h-[48px] bg-[var(--pcr-card)] rounded-full flex items-center justify-center mr-6">
                                            <span className="text-[#B3B3B3] text-[20px] font-light" style={{ fontFamily: "Space Grotesk" }}>
                                                {sample.id}
                                            </span>
                                        </div>
                                        <span className="flex-1 text-[var(--pcr-text-primary)] text-[24px] font-light" style={{ fontFamily: "Space Grotesk" }}>
                                            {sample.barcode}
                                        </span>
                                        {sample.scanned && (
                                            <div className="w-[37.5px] h-[37.5px] border-2 border-[#179824] rounded-full flex items-center justify-center">
                                                <Check className="w-[12.5px] h-[12.5px] text-[#179824]" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className="max-w-[912px] w-full flex justify-center mt-10">
                    <NavigationButtons
                        showBack={true}
                        showNext={true}
                        backDisabled={false}
                        nextDisabled={scannedSamples.length === 0}
                        onBack={() => setCurrentPage("load-reagents-deck")}
                        onNext={() => setCurrentPage("tip-box")}
                    />
                </div>
            </div>
        )
    }
    // Original EDTA tube rack layout (for all other input methods)
    return (
        <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] overflow-hidden">
            {/* Header Section - same as before */}
            <div className="absolute w-[912px] h-[181px] left-[84px] top-[115px]">
                <h1
                    className="absolute w-[503.37px] h-[61.97px] left-0 top-0 text-[var(--pcr-text-primary)] text-[52px] font-normal leading-[54px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Load samples
                </h1>

                <p
                    className="absolute w-[888px] h-[80px] top-[72px] text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    {isCfDNA ? "Load cfDNA samples in the rack and scan barcodes to identify the samples" : "Load EDTA tube in the rack and scan barcodes to identify the samples"}
                </p>

                <div className="absolute w-[912px] h-[2px] left-0 top-[179px] bg-[var(--pcr-accent)] rounded-[20px]" />
            </div>

            {/* Tube rack title */}
            <h2
                className="absolute w-[329px] h-[42px] left-[calc(50%-329px/2-291.5px)] top-[356px] text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px]"
                style={{ fontFamily: "Space Grotesk" }}
            >
                {isCfDNA ? "cfDNA tube rack" : "EDTA tube rack"}
            </h2>

            {/* Left tube rack container */}
            <div className="absolute w-[74px] h-[984px] left-[84px] top-[448px]">
                {/* Rack outline */}
                <div className="absolute inset-0 border-2 border-black dark:border-white rounded-[20px]" />

                {/* Sample positions */}
                {Array.from({ length: 16 }, (_, index) => {
                    let isFilled = false
                    let sampleNumber = null

                    if (isCfDNA) {
                        // For cfDNA, fill from bottom to top (max 16)
                        const positionFromBottom = 16 - index
                        isFilled = positionFromBottom <= Math.min(numberOfSamples, 16)
                        sampleNumber = isFilled ? positionFromBottom : null
                    } else {
                        // For others, fill from top to bottom (first rack)
                        const positionFromBottom = 16 - index
                        isFilled = positionFromBottom <= numberOfSamples
                        sampleNumber = isFilled ? positionFromBottom : null
                    }

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
                                        {sampleNumber}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Right tube rack container - only show if NOT cfDNA */}
            {!isCfDNA && (
                <div className="absolute w-[74px] h-[984px] left-[189px] top-[448px]">
                    {/* Rack outline */}
                    <div className="absolute inset-0 border-2 border-black dark:border-white rounded-[20px]" />

                    {/* Sample positions for second rack (17-32) */}
                    {Array.from({ length: 16 }, (_, index) => {
                        // Calculate from bottom to top for cfDNA style
                        const positionFromBottom = 16 - index
                        const sampleNumber = 16 + positionFromBottom  // This gives us 32, 31, 30... down to 17
                        const isFilled = numberOfSamples >= (32 - index)  // Fill from bottom when we have enough samples
                        const yPosition = 20 + index * 60

                        return (
                            <div
                                key={sampleNumber}
                                className="absolute left-1/2 transform -translate-x-1/2"
                                style={{ top: `${yPosition}px` }}
                            >
                                <div className={`w-[35px] h-[35px] rounded-full border-2 ${isFilled ? "bg-black dark:bg-white border-black dark:border-white" : "border-black dark:border-white"
                                    } flex items-center justify-center`}>
                                    {isFilled && (
                                        <span
                                            className="text-white dark:text-black text-[16px] font-light leading-[16px] text-center"
                                            style={{ fontFamily: "Space Grotesk" }}
                                        >
                                            {sampleNumber}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Scan barcode button */}
            <div className="absolute w-[670px] h-[93px] left-[326px] top-[448px]">
                <button
                    onClick={handleScanBarcode}
                    disabled={!isConnected || isScanning}
                    className="w-full h-full bg-[var(--pcr-card)] rounded-[20px] active:bg-[var(--pcr-card-dark)] transition-colors duration-150 flex items-center justify-center gap-4 hover:bg-[var(--pcr-card-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isScanning ? (
                        <>
                            <Loader2 className="w-[50px] h-[50px] text-[var(--pcr-accent)] animate-spin" />
                            <span
                                className="text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]"
                                style={{ fontFamily: "Space Grotesk" }}
                            >
                                Scanning...
                            </span>
                        </>
                    ) : (
                        <>
                            <Camera className="w-[50px] h-[50px] text-[var(--pcr-text-primary)]" />
                            <span
                                className="text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]"
                                style={{ fontFamily: "Space Grotesk" }}
                            >
                                Scan barcode
                            </span>
                        </>
                    )}
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
                    {scannedSamples.length === 0 && !isScanning ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="text-[#B3B3B3] text-[24px] font-light" style={{ fontFamily: "Space Grotesk" }}>
                                No samples scanned yet
                            </span>
                        </div>
                    ) : isScanning ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Loader2 className="w-16 h-16 text-[var(--pcr-accent)] animate-spin" />
                            <span className="text-[var(--pcr-text-primary)] text-[24px] font-light" style={{ fontFamily: "Space Grotesk" }}>
                                Scanning barcodes...
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-4">

                            {scannedSamples.map((sample, index) => (
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
                            ))}
                        </div>
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
                    onNext={() => setCurrentPage("tip-box")}
                />
            </div>
        </div>
    )
}