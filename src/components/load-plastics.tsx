"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRunStore } from "@/lib/store"
import NavigationButtons from "./navigation-buttons"
import { Clock, Loader2 } from "lucide-react"

export function LoadPlastics() {
    const { setCurrentPage, runData } = useRunStore()

    const [selectedPlastics, setSelectedPlastics] = useState<boolean[]>(new Array(6).fill(false))
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
    const [imagesLoaded, setImagesLoaded] = useState<boolean>(false)
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

    const numberOfSamples = parseInt(runData.numberOfSamples) || 0
    const combsNeeded = Math.ceil(numberOfSamples / 8)
    const combsToShow = Math.min(combsNeeded, 4)

    const formatMethodName = (method: string, count: number) => {
        if (!method) return { formattedName: "", isPlate: false }

        const methodLower = method.toLowerCase()
        let formattedName = ""
        let isPlate = false

        if (methodLower.includes('mct')) {
            formattedName = count === 1 ? "MCT tube" : "MCT tubes"
        } else if (methodLower.includes('edta')) {
            formattedName = count === 1 ? "EDTA tube" : "EDTA tubes"
        } else if (methodLower.includes('falcon')) {
            formattedName = count === 1 ? "Falcon tube" : "Falcon tubes"
        } else if (methodLower.includes('2d') || methodLower.includes('barcode')) {
            formattedName = count === 1 ? "2D barcode tube" : "2D barcode tubes"
        } else if (methodLower.includes('96') || methodLower.includes('deep')) {
            formattedName = "96 deep well plate"
            isPlate = true
        } else if (methodLower.includes('pcr') && methodLower.includes('plate')) {
            formattedName = "PCR plate"
            isPlate = true
        } else {
            formattedName = method
            isPlate = methodLower.includes('plate')
        }

        return { formattedName, isPlate }
    }

    let sampleInputDisplay = numberOfSamples.toString()
    let sampleInputLabel = runData.sampleInputMethod || "Sample Input"
    if (runData.sampleInputMethod) {
        const { formattedName, isPlate } = formatMethodName(runData.sampleInputMethod, numberOfSamples)
        sampleInputLabel = formattedName
        if (isPlate) {
            sampleInputDisplay = numberOfSamples === 1 ? "1 well" : `${numberOfSamples} wells`
        } else {
            sampleInputDisplay = numberOfSamples.toString()
        }
    }

    let elutionDisplay = numberOfSamples.toString()
    let elutionLabel = runData.elutionType || "Elution Type"
    if (runData.elutionType) {
        const { formattedName, isPlate } = formatMethodName(runData.elutionType, numberOfSamples)
        elutionLabel = formattedName
        if (isPlate) {
            elutionDisplay = numberOfSamples === 1 ? "1 well" : `${numberOfSamples} wells`
        } else {
            elutionDisplay = numberOfSamples.toString()
        }
    }

    let tips1000 = "-"
    let tips200 = "-"
    if (runData.pipetteTips && runData.pipetteTips.length > 0) {
        runData.pipetteTips.forEach(tip => {
            if (tip.includes("1000")) {
                tips1000 = tip.split(":")[1]?.trim() || "-"
            }
            if (tip.includes("200")) {
                tips200 = tip.split(":")[1]?.trim() || "-"
            }
        })
    }

    const cartridgesLabel = numberOfSamples === 1 ? "Cartridge" : "Cartridges"
    const combsLabel = combsToShow === 1 ? "Comb" : "Combs"

    const tips1000Value = parseInt(tips1000) || 0
    const tips200Value = parseInt(tips200) || 0
    const tips1000Label = tips1000Value === 1 ? "1000μL pipette tip" : "1000μL pipette tips"
    const tips200Label = tips200Value === 1 ? "200μL pipette tip" : "200μL pipette tips"

    const reagentData = [
        { quantity: numberOfSamples.toString(), label: cartridgesLabel, position: { left: "84px", top: "470px" } },
        { quantity: sampleInputDisplay, label: sampleInputLabel, position: { left: "398.52px", top: "470px" } },
        { quantity: tips1000, label: tips1000Label, position: { left: "713.99px", top: "470px" } },
        { quantity: tips200, label: tips200Label, position: { left: "84px", top: "681px" } },
        { quantity: elutionDisplay, label: elutionLabel, position: { left: "398.52px", top: "681px" } },
        { quantity: combsToShow.toString(), label: combsLabel, position: { left: "713.99px", top: "681px" } },
    ]

    const getElutionDeckImage = () => {
        if (runData.elutionType &&
            (runData.elutionType.toLowerCase().includes('2d') ||
                runData.elutionType.toLowerCase().includes('barcode'))) {
            return "/deck-2dbct.png"
        }
        return "/deck-elution.png"
    }

    const deckImages = [
        "/deck-cartridges.png",
        "/deck-sample-input.png",
        "/deck-tips-1000.png",
        "/deck-tips-200.png",
        getElutionDeckImage(),
        "/deck-combs.png"
    ]

    const defaultImage = "/deck-default.png"
    
    // All unique images that need to be preloaded
    const allImages = [...new Set([...deckImages, defaultImage])]

    // Preload all images
useEffect(() => {
    const preloadImages = async () => {
        const imagePromises = allImages.map((src, index) => {
            return new Promise<string>((resolve, reject) => {
                const img = new window.Image()
                
                // Add timeout for slow RPi
                const timeoutId = setTimeout(() => {
                    console.warn(`Image timeout: ${src}`)
                    reject(new Error(`Timeout loading ${src}`))
                }, 15000) // 15 second timeout for RPi
                
                img.onload = () => {
                    clearTimeout(timeoutId)
                    console.log(`✅ Image loaded: ${src}`)
                    resolve(src)
                }
                
                img.onerror = (error) => {
                    clearTimeout(timeoutId)
                    console.error(`❌ Image failed: ${src}`, error)
                    reject(new Error(`Failed to load ${src}`))
                }
                
                // Add a small delay between image loads to prevent overwhelming RPi
                setTimeout(() => {
                    img.src = src
                }, index * 100) // 100ms delay between each image
            })
        })

        try {
            const results = await Promise.allSettled(imagePromises)
            const successful = new Set<string>()
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    successful.add(result.value as string)
                } else {
                    console.error(`Image ${allImages[index]} failed:`, result.reason)
                }
            })
            
            setLoadedImages(successful)
            setImagesLoaded(true)
            console.log(`Loaded ${successful.size}/${allImages.length} images`)
            
        } catch (error) {
            console.error('Preload error:', error)
            setImagesLoaded(true) // Show page anyway
        }
    }

    preloadImages()
}, [])

    const handlePlasticClick = (index: number) => {
        const newSelected = [...selectedPlastics]
        newSelected[index] = !newSelected[index]
        setSelectedPlastics(newSelected)
        setCurrentImageIndex(index)
    }

    const allPlasticsSelected = selectedPlastics.every(selected => selected)

    // Show loading spinner while images are loading
    if (!imagesLoaded) {
        return (
            <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="w-16 h-16 text-[var(--pcr-accent)] animate-spin" />
                    <p className="text-[var(--pcr-text-primary)] text-[28px] font-light" style={{ fontFamily: "Space Grotesk" }}>
                        Loading images...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] overflow-y-auto pb-[148px]">
            {/* Hidden preloaded images */}
            <div className="hidden">
                {allImages.map((src, index) => (
                    <Image
                        key={`preload-${index}`}
                        src={src}
                        alt=""
                        width={1}
                        height={1}
                        priority
                    />
                ))}
            </div>

            <div className="absolute w-[912px] h-[181px] left-[84px] top-[115px]">
                <h1
                    className="absolute w-[503.37px] h-[61.97px] left-0 top-0 text-[var(--pcr-text-primary)] text-[52px] font-normal leading-[54px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Load Plastics
                </h1>

                <p
                    className="absolute w-[888px] h-[80px] top-[72px] text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Position plastics in the highlighted deck positions and verify minimum quantity
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
                <button
                    key={index}
                    onClick={() => handlePlasticClick(index)}
                    className={`absolute w-[282.01px] h-[168px] rounded-[20px] transition-all duration-200 cursor-pointer ${selectedPlastics[index]
                            ? 'bg-[var(--pcr-card)] border-4 border-[var(--pcr-accent)] shadow-lg transform scale-[1.02]'
                            : 'bg-[var(--pcr-card)] border-2 border-transparent active:bg-[var(--pcr-card-dark)]'
                        }`}
                    style={{
                        left: reagent.position.left,
                        top: reagent.position.top,
                    }}
                >
                    <div
                        className="absolute text-[var(--pcr-text-primary)] text-[40px] font-normal leading-[41px] text-right"
                        style={{
                            fontFamily: "Space Grotesk",
                            right: "30px",
                            top: "30px",
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
                </button>
            ))}

            <div className="absolute w-[911px] left-[84px] top-[895px] bg-[var(--pcr-accent)] rounded-[20px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
                <div className="w-full h-[168px] flex items-center justify-center gap-4">
                    <Clock className="w-[39px] h-[39px] text-white" strokeWidth={2} />
                    <span className="text-white text-[32px] font-light leading-[40px]" style={{ fontFamily: "Space Grotesk" }}>
                        Estimated run time: 60 minutes
                    </span>
                </div>
            </div>

            <div className="absolute w-[877px] h-[535px] left-[103px] top-[1095px]">
                <img
                    src={selectedPlastics.some(selected => selected) ? deckImages[currentImageIndex] : defaultImage}
                    alt="Deck position layout"
                    style={{ width: '877px', height: '535px', objectFit: 'contain' }}
                    className="transition-opacity duration-300"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement
                        console.error('Image display failed:', target.src)
                        target.src = '/fallback-image.png' // Add a fallback
                    }}
                />
            </div>

            <div className="absolute bottom-20 left-0 right-0 flex justify-center py-4">
                <NavigationButtons
                    showBack={true}
                    showNext={true}
                    backDisabled={false}
                    nextDisabled={!allPlasticsSelected}
                    onBack={() => setCurrentPage("run-setup-2")}
                    onNext={() => setCurrentPage("load-reagents-deck")}
                />
            </div>
        </div>
    )
}