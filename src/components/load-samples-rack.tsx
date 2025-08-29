"use client"

import { useState, useEffect, useRef } from "react"
import { Check, X } from "lucide-react"
import NavigationButtons from "./navigation-buttons"
import { useRunStore } from "../lib/store"

export default function LoadSamplesRack() {
    const { setCurrentPage, setPipetteTips } = useRunStore()
    const [isPainting, setIsPainting] = useState(false)
    const [paintValue, setPaintValue] = useState<boolean | null>(null)
    const lastCell = useRef<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const hasDragged = useRef(false)

    // Prevent scrolling during painting
    useEffect(() => {
        const preventScroll = (e: TouchEvent) => {
            if (isPainting) {
                e.preventDefault()
            }
        }

        if (containerRef.current) {
            containerRef.current.addEventListener("touchmove", preventScroll, { passive: false })
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener("touchmove", preventScroll)
            }
        }
    }, [isPainting])

    // State for tip boxes - true means available (green), false means used (empty)
    const [tipBox1, setTipBox1] = useState<boolean[][]>(
        Array(8)
            .fill(null)
            .map(() => Array(12).fill(true)),
    )
    const [tipBox2, setTipBox2] = useState<boolean[][]>(
        Array(8)
            .fill(null)
            .map(() => Array(12).fill(true)),
    )

    const handleMarkAllAvailable = () => {
        setTipBox1(
            Array(8)
                .fill(null)
                .map(() => Array(12).fill(true)),
        )
        setTipBox2(
            Array(8)
                .fill(null)
                .map(() => Array(12).fill(true)),
        )
    }

    const handleMarkAllUsed = () => {
        setTipBox1(
            Array(8)
                .fill(null)
                .map(() => Array(12).fill(false)),
        )
        setTipBox2(
            Array(8)
                .fill(null)
                .map(() => Array(12).fill(false)),
        )
    }

    const toggleTip = (boxNumber: number, row: number, col: number, value?: boolean) => {
        const update = (box: boolean[][], setBox: (b: boolean[][]) => void) => {
            const newBox = box.map((r) => [...r])
            newBox[row][col] = value !== undefined ? value : !box[row][col]
            setBox(newBox)
        }
        if (boxNumber === 1) {
            update(tipBox1, setTipBox1)
        } else {
            update(tipBox2, setTipBox2)
        }
    }

    const startPainting = (
        boxNumber: number,
        row: number,
        col: number,
        e: React.MouseEvent | React.TouchEvent
    ) => {
        e.preventDefault()
        setPaintValue(!(boxNumber === 1 ? tipBox1[row][col] : tipBox2[row][col]))
        setIsPainting(true)
        lastCell.current = `${boxNumber}-${row}-${col}`
        hasDragged.current = false // reset
    }

    const continuePainting = (boxNumber: number, row: number, col: number) => {
        if (isPainting && paintValue !== null) {
            const cellKey = `${boxNumber}-${row}-${col}`
            if (lastCell.current !== cellKey) {
                toggleTip(boxNumber, row, col, paintValue)
                lastCell.current = cellKey
                hasDragged.current = true
            }
        }
    }

    const stopPainting = () => {
        setIsPainting(false)
        setPaintValue(null)
        lastCell.current = null
    }

    // Single click/tap handler
    const handleSingleTap = (boxNumber: number, row: number, col: number) => {
        if (!hasDragged.current) {
            toggleTip(boxNumber, row, col) // toggle once
        }
    }

    const handleTouchMove = (e: React.TouchEvent, boxNumber: number) => {
        if (!isPainting || paintValue === null) return

        e.preventDefault()
        const touch = e.touches[0]
        const element = document.elementFromPoint(touch.clientX, touch.clientY)

        if (element && element.hasAttribute('data-cell')) {
            const cellData = element.getAttribute('data-cell')
            if (cellData) {
                const [r, c] = cellData.split('-').map(Number)
                continuePainting(boxNumber, r, c)
            }
        }
    }

    const countAvailable = (tipBox: boolean[][]) => {
        return tipBox.flat().filter((tip) => tip).length
    }

    const totalAvailable = countAvailable(tipBox1) + countAvailable(tipBox2)

    const renderTipGrid = (tipBox: boolean[][], boxNumber: number) => {
        const rows = ["A", "B", "C", "D", "E", "F", "G", "H"]
        const cols = Array.from({ length: 12 }, (_, i) => i + 1)

        return (
            <div className="relative w-[912px] h-[628px] bg-[var(--pcr-bg)] rounded-[20px] border-2 border-[var(--pcr-text-primary)]/30">
                {/* Column number labels */}
                <div className="absolute top-[15px] left-[80.5px] flex gap-[35.3px]">
                    {cols.map((col) => (
                        <div key={col} className="w-[33px] h-[33px] bg-[var(--pcr-card-dark)] rounded-[5px] flex items-center justify-center">
                            <span className="text-[var(--pcr-text-primary)] text-[14px] font-normal">{col}</span>
                        </div>
                    ))}
                </div>

                {/* Row letter labels */}
                <div className="absolute top-[80px] left-[15px] flex flex-col gap-[34.8px]">
                    {rows.map((row) => (
                        <div key={row} className="w-[33px] h-[33px] bg-[var(--pcr-card-dark)] rounded-[5px] flex items-center justify-center">
                            <span className="text-[var(--pcr-text-primary)] text-[14px] font-normal">{row}</span>
                        </div>
                    ))}
                </div>

                {/* Inner container for tip grid */}
                <div className="absolute top-[57px] left-[56px] w-[831px] h-[553px] bg-[var(--pcr-card)] rounded-[15px] border border-[var(--pcr-text-primary)]/20">
                    {/* Tip grid */}
                    <div
                        className="absolute top-[8px] left-[10px]"
                        onTouchMove={(e) => handleTouchMove(e, boxNumber)}
                        onTouchEnd={stopPainting}
                        onMouseUp={stopPainting}
                        onMouseLeave={stopPainting}
                        style={{ touchAction: isPainting ? 'none' : 'auto' }}
                    >
                        {rows.map((row, rowIndex) => (
                            <div key={row} className="flex gap-[8.3px] mb-[8px] last:mb-0">
                                {cols.map((col, colIndex) => (
                                    <button
                                        key={`${row}-${col}`}
                                        data-cell={`${rowIndex}-${colIndex}`}
                                        className="w-[60px] h-[60px] rounded-full border-2 flex items-center justify-center select-none transition-transform duration-75"
                                        style={{
                                            backgroundColor: tipBox[rowIndex][colIndex] ? "#82E18C" : "#CE6969",
                                            borderColor: tipBox[rowIndex][colIndex] ? "#179824" : "#D94343",
                                            touchAction: 'none',
                                            transform: isPainting && lastCell.current === `${boxNumber}-${rowIndex}-${colIndex}` ? 'scale(0.95)' : 'scale(1)'
                                        }}
                                        onMouseDown={(e) => startPainting(boxNumber, rowIndex, colIndex, e)}
                                        onMouseEnter={() => continuePainting(boxNumber, rowIndex, colIndex)}
                                        onMouseUp={() => handleSingleTap(boxNumber, rowIndex, colIndex)}
                                        onTouchStart={(e) => {
                                            e.preventDefault()
                                            startPainting(boxNumber, rowIndex, colIndex, e)
                                        }}
                                        onTouchMove={() => hasDragged.current = true}
                                        onTouchEnd={() => {
                                            handleSingleTap(boxNumber, rowIndex, colIndex)
                                            stopPainting()
                                        }}
                                    >
                                        {tipBox[rowIndex][colIndex] ? (
                                            <Check className="w-[20px] h-[20px] text-white" strokeWidth={3} />
                                        ) : (
                                            <X className="w-[20px] h-[20px] text-white" strokeWidth={3} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const handleNext = () => {
        // Calculate unavailable tips before navigating
        const unavailableTips = []

        // Process tip box 1
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 12; col++) {
                if (!tipBox1[row][col]) { // false means used/unavailable
                    const rowLetter = String.fromCharCode(65 + row) // A, B, C, etc.
                    unavailableTips.push(`Box1-${rowLetter}${col + 1}`)
                }
            }
        }

        // Process tip box 2
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 12; col++) {
                if (!tipBox2[row][col]) { // false means used/unavailable
                    const rowLetter = String.fromCharCode(65 + row) // A, B, C, etc.
                    unavailableTips.push(`Box2-${rowLetter}${col + 1}`)
                }
            }
        }

        // Store the unavailable tips
        setPipetteTips(unavailableTips)
        setCurrentPage("elution-well-selection")
    }

    return (
        <div
            ref={containerRef}
            className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] overflow-y-auto"
            style={{
                touchAction: isPainting ? 'none' : 'pan-y',
                overflowY: isPainting ? 'hidden' : 'auto'
            }}
        >
            <div className="relative w-full">
                {/* Header */}
                <div className="absolute w-full max-w-[1080px] h-[296px] left-0 top-0 bg-[var(--pcr-bg)]">
                    <div className="absolute w-[503px] h-[62px] left-[84px] top-[115px]">
                        <h1 className="text-[var(--pcr-text-primary)] text-[52px] font-normal leading-[54px]">Load samples</h1>
                    </div>
                    <div className="absolute w-[888px] h-[80px] left-[96px] top-[187px]">
                        <p className="text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]">
                            Load EDTA tube in the rack and scan barcodes to identify the samples
                        </p>
                    </div>
                    <div className="absolute w-[912px] h-[2px] left-[84px] top-[294px] bg-[var(--pcr-accent)] rounded-[20px]" />
                </div>

                {/* Quick actions */}
                <div className="absolute left-[84px] top-[356px]">
                    <h2 className="text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px] mb-[50px]">Quick actions</h2>

                    <div className="w-[912px] h-[325px] bg-[var(--pcr-card)] rounded-[20px] p-[40px] space-y-[56px]">
                        <button
                            onClick={handleMarkAllAvailable}
                            className="w-full h-[92px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center px-[23px] active:bg-[var(--pcr-accent)] transition-colors"
                            style={{ touchAction: 'manipulation' }}
                        >
                            <div className="w-[50px] h-[50px] rounded-full border-2 border-[#82E18C] bg-[#82E18C] flex items-center justify-center mr-[40px]">
                                <Check className="w-[20px] h-[20px] text-white" strokeWidth={3} />
                            </div>
                            <span className="text-[var(--pcr-text-primary)] text-[24px] font-light">Mark all available</span>
                        </button>

                        <button
                            onClick={handleMarkAllUsed}
                            className="w-full h-[92px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center px-[23px] active:bg-[var(--pcr-accent)] transition-colors"
                            style={{ touchAction: 'manipulation' }}
                        >
                            <div className="w-[50px] h-[50px] rounded-full border-2 border-[#CE6969] bg-[#CE6969] flex items-center justify-center mr-[40px]">
                                <X className="w-[20px] h-[20px] text-white" strokeWidth={3} />
                            </div>
                            <span className="text-[var(--pcr-text-primary)] text-[24px] font-light">Mark all used</span>
                        </button>
                    </div>
                </div>

                {/* Tip box 1 */}
                <div className="absolute left-[84px] top-[820px]">
                    <h3 className="text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px] mb-[14px]">Tip box 1</h3>
                    <p className="text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px] mb-[50px]">
                        Touch and drag to paint tips available (green) or used (red).
                    </p>
                    {renderTipGrid(tipBox1, 1)}
                </div>

                {/* Tip box 2 */}
                <div className="absolute left-[84px] top-[1640px]">
                    <h3 className="text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px] mb-[14px]">Tip box 2</h3>
                    <p className="text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px] mb-[50px]">
                        Touch and drag to paint tips available (green) or used (red).
                    </p>
                    {renderTipGrid(tipBox2, 2)}
                </div>

                {/* Tip summary */}
                <div className="absolute left-[84px] top-[2505px]">
                    <h3 className="absolute w-[380px] h-[44px] left-[calc(50%-380px/2-266px)] top-0 text-[var(--pcr-text-primary)] text-[36px] font-normal leading-[40px]">
                        Tip summary
                    </h3>

                    <div className="relative w-[912px] h-[449px] top-0">
                        <div className="absolute w-[912px] h-[355px] left-0 top-[94px] bg-[var(--pcr-card)] rounded-[20px]" />

                        {/* Left top rectangle - Tip box 1 */}
                        <div className="absolute w-[532.71px] h-[122px] left-[29.54px] top-[137px] bg-[var(--pcr-card-dark)] rounded-[20px]" />
                        <div className="absolute w-[387px] h-[41px] left-[calc(50%-387px/2-204.5px)] top-[155px] text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]">
                            Tip box 1
                        </div>
                        <div className="absolute w-[387px] h-[41px] left-[calc(50%-387px/2-204.5px)] top-[200px] text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px]">
                            {countAvailable(tipBox1)} tips available
                        </div>

                        {/* Left bottom rectangle - Tip box 2 */}
                        <div className="absolute w-[532.71px] h-[122px] left-[29.54px] top-[284px] bg-[var(--pcr-card-dark)] rounded-[20px]" />
                        <div className="absolute w-[387px] h-[41px] left-[calc(50%-387px/2-204.5px)] top-[302px] text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]">
                            Tip box 2
                        </div>
                        <div className="absolute w-[387px] h-[41px] left-[calc(50%-387px/2-204.5px)] top-[347px] text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px]">
                            {countAvailable(tipBox2)} tips available
                        </div>

                        {/* Right rectangle - Total available and Required */}
                        <div className="absolute w-[291.61px] h-[269px] left-[590.85px] top-[137px] bg-[var(--pcr-card-dark)] rounded-[20px]" />
                        <div className="absolute w-[227px] h-[41px] left-[calc(50%-227px/2+268.5px)] top-[155px] text-[var(--pcr-text-primary)] text-[28px] font-light leading-[40px]">
                            Total available:
                        </div>
                        <div className="absolute w-[88px] h-[41px] left-[calc(50%-88px/2+199px)] top-[218px] text-[var(--pcr-text-primary)] text-[40px] font-light leading-[40px]">
                            {totalAvailable}
                        </div>
                        <div className="absolute w-[156px] h-[39px] left-[calc(50%-156px/2+233px)] top-[345px] text-[var(--pcr-text-primary)] text-[24px] font-light leading-[40px]">
                            Required: 96
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="absolute w-full top-[2950px] flex justify-center py-25">
                <NavigationButtons
                    showBack={true}
                    showNext={true}
                    nextDisabled={totalAvailable < 96}
                    onBack={() => setCurrentPage("load-samples")}
                    onNext={() => { handleNext() }}
                />
            </div>
        </div>
    )
}