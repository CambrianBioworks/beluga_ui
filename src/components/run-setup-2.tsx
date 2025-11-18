"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRunStore } from "@/lib/store"
import NavigationButtons from "./navigation-buttons"
import { Loader2 } from "lucide-react"

export default function RunSetup2() {
    const { runData, setCurrentPage, setSampleInputMethod, setElutionType } = useRunStore()
    const [selectedSampleInput, setSelectedSampleInput] = useState<string>(runData.sampleInputMethod || "")
    const [selectedElutionType, setSelectedElutionType] = useState<string>(runData.elutionType || "")
    const [imagesLoaded, setImagesLoaded] = useState<boolean>(false)
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

    const allImages = [
        "/icons/EDTA_tube.png",
        "/icons/MCT_tube.png",
        "/icons/Falcon_tube.png",
        "/icons/96_dwp.png",
        "/icons/2D_barcode_tube.png",
        "/icons/PCR_plate.png"
    ]

    useEffect(() => {
        const preloadImages = async () => {
            const imagePromises = allImages.map((src, index) => {
                return new Promise<string>((resolve, reject) => {
                    const img = new window.Image()
                    
                    const timeoutId = setTimeout(() => {
                        console.warn(`Image timeout: ${src}`)
                        reject(new Error(`Timeout loading ${src}`))
                    }, 15000)
                    
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
                    
                    setTimeout(() => {
                        img.src = src
                    }, index * 100)
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
                setImagesLoaded(true)
            }
        }

        preloadImages()
    }, [])

    const handleBack = () => {
        setCurrentPage("run-setup")
    }

    const handleNext = () => {
        setSampleInputMethod(selectedSampleInput)
        setElutionType(selectedElutionType)
        setCurrentPage("load-plastics")
    }

    const handleSampleInputSelect = (input: string) => {
        setSelectedSampleInput(input)
    }

    const handleElutionTypeSelect = (elution: string) => {
        setSelectedElutionType(elution)
    }

    const isFormValid = selectedSampleInput !== "" && selectedElutionType !== ""

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
        <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] overflow-hidden">
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
            {/* Header Section */}
            <div className="absolute w-[912px] h-[140px] left-[84px] top-[115px]">
                {/* Title */}
                <h1
                    className="absolute w-[503px] h-[62px] left-0 top-0 text-[var(--pcr-text-primary)] text-[52px] font-normal leading-[54px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Run setup
                </h1>

                {/* Subtitle */}
                <p
                    className="absolute w-[888px] h-[39px] left-[12px] top-[72px] text-[var(--pcr-text-primary)] text-[32px] font-light leading-[40px]"
                    style={{ fontFamily: "Space Grotesk" }}
                >
                    Configure your DNA extraction run parameters
                </p>

                {/* Blue accent line */}
                <div className="absolute w-[912px] h-[2px] left-0 top-[138px] bg-[var(--pcr-accent)] rounded-[20px]"></div>
            </div>

            {/* Sample input section */}
            <h2
                className="absolute w-[329px] h-[42px] left-[84px] top-[315px] text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px]"
                style={{ fontFamily: "Space Grotesk" }}
            >
                Sample input
            </h2>

            <p
                className="absolute w-[769px] h-[39px] left-[84px] top-[367px] text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px]"
                style={{ fontFamily: "Space Grotesk" }}
            >
                Choose your sample input method.
            </p>

            {/* Sample Input Options - First Row */}
            <div className="absolute w-[912px] h-[198px] left-[84px] top-[456px]">
                {/* EDTA tube - Left */}
                <div
                    className={`absolute w-[437px] h-[198px] left-0 top-0 bg-[var(--pcr-card)] rounded-[20px] cursor-pointer transition-colors ${
                        selectedSampleInput === "edta-tube" ? "ring-4 ring-[var(--pcr-accent)]" : ""
                    }`}
                    onClick={() => handleSampleInputSelect("edta-tube")}
                >
                    {/* Icon container */}
                    <div className="absolute w-[159px] h-[159px] left-[26px] top-[19px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center justify-center">
                        <Image src="/icons/EDTA_tube.png" alt="EDTA Tube Icon" width={159} height={159} className="object-contain" />
                    </div>

                    {/* Label */}
                    <span
                        className="absolute w-[220px] h-[79px] right-[20px] top-[80px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px] text-center"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        EDTA tube
                    </span>
                </div>

                {/* MCT tube - Right */}
                <div
                    className={`absolute w-[437px] h-[198px] left-[475px] top-0 bg-[var(--pcr-card)] rounded-[20px] cursor-pointer transition-colors ${
                        selectedSampleInput === "mct-tube" ? "ring-4 ring-[var(--pcr-accent)]" : ""
                    }`}
                    onClick={() => handleSampleInputSelect("mct-tube")}
                >
                    {/* Icon container */}
                    <div className="absolute w-[159px] h-[159px] left-[26px] top-[19px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center justify-center">
                        <Image src="/icons/MCT_tube.png" alt="MCT Tube Icon" width={134} height={134} className="object-contain" />
                    </div>

                    {/* Label */}
                    <span
                        className="absolute w-[220px] h-[79px] right-[20px] top-[80px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px] text-center"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        MCT tube
                    </span>
                </div>
            </div>

            {/* Sample Input Options - Second Row */}
            <div className="absolute w-[912px] h-[198px] left-[84px] top-[691px]">
                {/* Falcon tube - Left */}
                <div
                    className={`absolute w-[437px] h-[198px] left-0 top-0 bg-[var(--pcr-card)] rounded-[20px] cursor-pointer transition-colors ${
                        selectedSampleInput === "falcon-tube" ? "ring-4 ring-[var(--pcr-accent)]" : ""
                    }`}
                    onClick={() => handleSampleInputSelect("falcon-tube")}
                >
                    {/* Icon container */}
                    <div className="absolute w-[159px] h-[159px] left-[26px] top-[19px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center justify-center">
                        <Image src="/icons/Falcon_tube.png" alt="Falcon Tube Icon" width={105} height={80} className="object-contain" />
                    </div>

                    {/* Label */}
                    <span
                        className="absolute w-[220px] h-[79px] right-[20px] top-[80px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px] text-center"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Falcon tube
                    </span>
                </div>

                {/* 96 deep well plate - Right */}
                <div
                    className={`absolute w-[437px] h-[198px] left-[475px] top-0 bg-[var(--pcr-card)] rounded-[20px] cursor-pointer transition-colors ${
                        selectedSampleInput === "96-deep-well" ? "ring-4 ring-[var(--pcr-accent)]" : ""
                    }`}
                    onClick={() => handleSampleInputSelect("96-deep-well")}
                >
                    {/* Icon container */}
                    <div className="absolute w-[159px] h-[159px] left-[26px] top-[19px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center justify-center">
                        <Image src="/icons/96_dwp.png" alt="96 Deep Well Plate Icon" width={119} height={119} className="object-contain" />
                    </div>

                    {/* Label */}
                    <span
                        className="absolute w-[220px] h-[79px] right-[20px] top-[60px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px] text-center"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        96 deep well plate
                    </span>
                </div>
            </div>

            {/* Elution type section */}
            <h2
                className="absolute w-[329px] h-[42px] left-[84px] top-[949px] text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px]"
                style={{ fontFamily: "Space Grotesk" }}
            >
                Elution type
            </h2>

            <p
                className="absolute w-[769px] h-[39px] left-[84px] top-[1001px] text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px]"
                style={{ fontFamily: "Space Grotesk" }}
            >
                Choose your elution type.
            </p>

            {/* Elution Type Options - First Row */}
            <div className="absolute w-[912px] h-[198px] left-[84px] top-[1090px]">
                {/* 2D barcode tube - Left */}
                <div
                    className={`absolute w-[437px] h-[198px] left-0 top-0 bg-[var(--pcr-card)] rounded-[20px] cursor-pointer transition-colors ${
                        selectedElutionType === "2d-barcode" ? "ring-4 ring-[var(--pcr-accent)]" : ""
                    }`}
                    onClick={() => handleElutionTypeSelect("2d-barcode")}
                >
                    {/* Icon container */}
                    <div className="absolute w-[159px] h-[159px] left-[26px] top-[19px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center justify-center">
                        <Image src="/icons/2D_barcode_tube.png" alt="2D Barcode Tube Icon" width={144} height={108} className="object-contain" />
                    </div>

                    {/* Label */}
                    <span
                        className="absolute w-[220px] h-[79px] right-[20px] top-[60px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px] text-center"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        2D barcode tube
                    </span>
                </div>

                {/* MCT tube - Right */}
                <div
                    className={`absolute w-[437px] h-[198px] left-[475px] top-0 bg-[var(--pcr-card)] rounded-[20px] cursor-pointer transition-colors ${
                        selectedElutionType === "mct-tube-elution" ? "ring-4 ring-[var(--pcr-accent)]" : ""
                    }`}
                    onClick={() => handleElutionTypeSelect("mct-tube-elution")}
                >
                    {/* Icon container */}
                    <div className="absolute w-[159px] h-[159px] left-[26px] top-[19px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center justify-center">
                        <Image src="/icons/MCT_tube.png" alt="MCT Tube Icon" width={134} height={134} className="object-contain" />
                    </div>

                    {/* Label */}
                    <span
                        className="absolute w-[220px] h-[79px] right-[20px] top-[80px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px] text-center"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        MCT tube
                    </span>
                </div>
            </div>

            {/* Elution Type Options - Second Row */}
            <div className="absolute w-[912px] h-[198px] left-[84px] top-[1325px]">
                {/* PCR plate - Left */}
                <div
                    className={`absolute w-[437px] h-[198px] left-0 top-0 bg-[var(--pcr-card)] rounded-[20px] cursor-pointer transition-colors ${
                        selectedElutionType === "pcr-plate" ? "ring-4 ring-[var(--pcr-accent)]" : ""
                    }`}
                    onClick={() => handleElutionTypeSelect("pcr-plate")}
                >
                    {/* Icon container */}
                    <div className="absolute w-[159px] h-[159px] left-[26px] top-[19px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center justify-center">
                        <Image src="/icons/PCR_plate.png" alt="PCR Plate Icon" width={146} height={98} className="object-contain" />
                    </div>

                    {/* Label */}
                    <span
                        className="absolute w-[220px] h-[79px] right-[20px] top-[80px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px] text-center"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        PCR plate
                    </span>
                </div>

                {/* 96 deep well plate - Right */}
                <div
                    className={`absolute w-[437px] h-[198px] left-[475px] top-0 bg-[var(--pcr-card)] rounded-[20px] cursor-pointer transition-colors ${
                        selectedElutionType === "96-deep-well-elution" ? "ring-4 ring-[var(--pcr-accent)]" : ""
                    }`}
                    onClick={() => handleElutionTypeSelect("96-deep-well-elution")}
                >
                    {/* Icon container */}
                    <div className="absolute w-[159px] h-[159px] left-[26px] top-[19px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center justify-center">
                        <Image src="/icons/96_dwp.png" alt="96 Deep Well Plate Icon" width={119} height={119} className="object-contain" />
                    </div>

                    {/* Label */}
                    <span
                        className="absolute w-[220px] h-[79px] right-[20px] top-[60px] text-[var(--pcr-text-primary)] text-[32px] font-normal leading-[40px] text-center"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        96 deep well plate
                    </span>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute bottom-20 left-0 right-0 flex justify-center py-4">
                <NavigationButtons onBack={handleBack} onNext={handleNext} nextDisabled={!isFormValid} backDisabled={false} />
            </div>
        </div>
    )
}
