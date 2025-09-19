"use client"

import { useState, useEffect, useRef } from "react"
import { Check, X } from "lucide-react"
import NavigationButtons from "./navigation-buttons"
import { useRunStore } from "../lib/store"

export default function TipBox() {
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
    const currentContainer = containerRef.current

        if (currentContainer) {
            currentContainer.addEventListener("touchmove", preventScroll, { passive: false })
        }

        return () => {
            if (currentContainer) {
                currentContainer.removeEventListener("touchmove", preventScroll)
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

    // const handleMarkAllAvailable = () => {
    //     setTipBox1(
    //         Array(8)
    //             .fill(null)
    //             .map(() => Array(12).fill(true)),
    //     )
    //     setTipBox2(
    //         Array(8)
    //             .fill(null)
    //             .map(() => Array(12).fill(true)),
    //     )
    // }

    // const handleMarkAllUsed = () => {
    //     setTipBox1(
    //         Array(8)
    //             .fill(null)
    //             .map(() => Array(12).fill(false)),
    //     )
    //     setTipBox2(
    //         Array(8)
    //             .fill(null)
    //             .map(() => Array(12).fill(false)),
    //     )
    // }

    const handleMarkBox1Available = () => {
        setTipBox1(
            Array(8)
                .fill(null)
                .map(() => Array(12).fill(true)),
        )
    }

    const handleMarkBox1Used = () => {
        setTipBox1(
            Array(8)
                .fill(null)
                .map(() => Array(12).fill(false)),
        )
    }

    const handleMarkBox2Available = () => {
        setTipBox2(
            Array(8)
                .fill(null)
                .map(() => Array(12).fill(true)),
        )
    }

    const handleMarkBox2Used = () => {
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
                    {cols.map((col, colIndex) => (
                        <button
                            key={col}
                            onClick={() => toggleEntireColumn(boxNumber, colIndex)}
                            className="grid-label w-[33px] h-[33px] bg-[var(--pcr-card-dark)] rounded-[5px] flex items-center justify-center hover:bg-[var(--pcr-accent)] transition-colors cursor-pointer"
                            style={{ touchAction: 'manipulation' }}
                        >
                            <span className="text-[var(--pcr-text-primary)] text-[14px] font-normal">{col}</span>
                        </button>
                    ))}
                </div>

                {/* Row letter labels */}
                <div className="absolute top-[80px] left-[15px] flex flex-col gap-[34.8px]">
                    {rows.map((row, rowIndex) => (
                        <button
                            key={row}
                            onClick={() => toggleEntireRow(boxNumber, rowIndex)}
                            className="grid-label w-[33px] h-[33px] bg-[var(--pcr-card-dark)] rounded-[5px] flex items-center justify-center hover:bg-[var(--pcr-accent)] transition-colors cursor-pointer"
                            style={{ touchAction: 'manipulation' }}
                        >
                            <span className="text-[var(--pcr-text-primary)] text-[14px] font-normal">{row}</span>
                        </button>
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

    const toggleEntireRow = (boxNumber: number, rowIndex: number) => {
        const update = (box: boolean[][], setBox: (b: boolean[][]) => void) => {
            const newBox = box.map((r) => [...r])
            // Toggle all columns in this row
            const currentRowState = newBox[rowIndex][0] // Use first column as reference
            for (let col = 0; col < 12; col++) {
                newBox[rowIndex][col] = !currentRowState
            }
            setBox(newBox)
        }
        if (boxNumber === 1) {
            update(tipBox1, setTipBox1)
        } else {
            update(tipBox2, setTipBox2)
        }
    }

    const toggleEntireColumn = (boxNumber: number, colIndex: number) => {
        const update = (box: boolean[][], setBox: (b: boolean[][]) => void) => {
            const newBox = box.map((r) => [...r])
            // Toggle all rows in this column
            const currentColState = newBox[0][colIndex] // Use first row as reference
            for (let row = 0; row < 8; row++) {
                newBox[row][colIndex] = !currentColState
            }
            setBox(newBox)
        }
        if (boxNumber === 1) {
            update(tipBox1, setTipBox1)
        } else {
            update(tipBox2, setTipBox2)
        }
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
            className="w-full min-h-screen bg-[var(--pcr-bg)] flex flex-col items-center py-10 px-6 overflow-y-auto"
            style={{
                touchAction: isPainting ? 'none' : 'pan-y',
                overflowY: isPainting ? 'hidden' : 'auto'
            }}
        >
            <div className="relative w-full items-center px-15 py-10">
                {/* Header */}
                <div className="max-w-[912px] w-full mb-8">
                    <h1
                        className="text-[52px] font-normal text-[var(--pcr-text-primary)]"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Tip box
                    </h1>
                    <p
                        className="mt-4 text-[28px] font-light text-[var(--pcr-text-primary)]"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Select the positions corresponding to the tips.
                    </p>
                    <p
                        className="text-[28px] font-light text-[var(--pcr-text-primary)]"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Mark the spots to indicate which tips were used.
                    </p>
                    <div className="mt-6 h-[2px] bg-[var(--pcr-accent)] rounded" />
                </div>

                {/* Quick actions */}
                <div className="max-w-[912px] w-full mb-8">
                    <h2
                        className="text-[36px] font-normal text-[var(--pcr-text-primary)] mb-6"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Quick actions
                    </h2>

                    <div className="w-full bg-[var(--pcr-card)] rounded-[20px] p-[40px]">
                        {/* 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Top row - Mark Available */}
                            <button
                                onClick={handleMarkBox1Available}
                                className="h-[92px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center px-[23px] active:bg-[var(--pcr-accent)] transition-colors"
                                style={{ touchAction: 'manipulation' }}
                            >
                                <div className="w-[50px] h-[50px] rounded-full border-2 border-[#82E18C] bg-[#82E18C] flex items-center justify-center mr-[20px]">
                                    <Check className="w-[20px] h-[20px] text-white" strokeWidth={3} />
                                </div>
                                <span className="text-[var(--pcr-text-primary)] text-[20px] font-light">Box 1 available</span>
                            </button>

                            <button
                                onClick={handleMarkBox2Available}
                                className="h-[92px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center px-[23px] active:bg-[var(--pcr-accent)] transition-colors"
                                style={{ touchAction: 'manipulation' }}
                            >
                                <div className="w-[50px] h-[50px] rounded-full border-2 border-[#82E18C] bg-[#82E18C] flex items-center justify-center mr-[20px]">
                                    <Check className="w-[20px] h-[20px] text-white" strokeWidth={3} />
                                </div>
                                <span className="text-[var(--pcr-text-primary)] text-[20px] font-light">Box 2 available</span>
                            </button>

                            {/* Bottom row - Mark Used */}
                            <button
                                onClick={handleMarkBox1Used}
                                className="h-[92px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center px-[23px] active:bg-[var(--pcr-accent)] transition-colors"
                                style={{ touchAction: 'manipulation' }}
                            >
                                <div className="w-[50px] h-[50px] rounded-full border-2 border-[#CE6969] bg-[#CE6969] flex items-center justify-center mr-[20px]">
                                    <X className="w-[20px] h-[20px] text-white" strokeWidth={3} />
                                </div>
                                <span className="text-[var(--pcr-text-primary)] text-[20px] font-light">Box 1 used</span>
                            </button>

                            <button
                                onClick={handleMarkBox2Used}
                                className="h-[92px] bg-[var(--pcr-card-dark)] rounded-[20px] flex items-center px-[23px] active:bg-[var(--pcr-accent)] transition-colors"
                                style={{ touchAction: 'manipulation' }}
                            >
                                <div className="w-[50px] h-[50px] rounded-full border-2 border-[#CE6969] bg-[#CE6969] flex items-center justify-center mr-[20px]">
                                    <X className="w-[20px] h-[20px] text-white" strokeWidth={3} />
                                </div>
                                <span className="text-[var(--pcr-text-primary)] text-[20px] font-light">Box 2 used</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tip box 1 */}
                <div className="max-w-[912px] w-full mb-8">
                    <h3
                        className="text-[36px] font-normal text-[var(--pcr-text-primary)] mb-4"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Tip box 1
                    </h3>
                    <p
                        className="text-[24px] font-light text-[var(--pcr-text-primary)] mb-6"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Touch and drag to paint tips available (green) or used (red).
                    </p>
                    {renderTipGrid(tipBox1, 1)}
                </div>

                {/* Tip box 2 */}
                <div className="max-w-[912px] w-full mb-8">
                    <h3
                        className="text-[36px] font-normal text-[var(--pcr-text-primary)] mb-4"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Tip box 2
                    </h3>
                    <p
                        className="text-[24px] font-light text-[var(--pcr-text-primary)] mb-6"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Touch and drag to paint tips available (green) or used (red).
                    </p>
                    {renderTipGrid(tipBox2, 2)}
                </div>

                {/* Tip summary */}
                <div className="max-w-[912px] w-full mb-8">
                    <h3
                        className="text-[36px] font-normal text-[var(--pcr-text-primary)] mb-6"
                        style={{ fontFamily: "Space Grotesk" }}
                    >
                        Tip summary
                    </h3>

                    <div className="w-full bg-[var(--pcr-card)] rounded-[20px] p-8">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Left column - Tip boxes */}
                            <div className="space-y-4">
                                {/* Tip box 1 */}
                                <div className="bg-[var(--pcr-card-dark)] rounded-[20px] p-6">
                                    <div className="text-[var(--pcr-text-primary)] text-[28px] font-light mb-2">
                                        Tip box 1
                                    </div>
                                    <div className="text-[var(--pcr-text-primary)] text-[24px] font-light">
                                        {countAvailable(tipBox1)} tips available
                                    </div>
                                </div>

                                {/* Tip box 2 */}
                                <div className="bg-[var(--pcr-card-dark)] rounded-[20px] p-6">
                                    <div className="text-[var(--pcr-text-primary)] text-[28px] font-light mb-2">
                                        Tip box 2
                                    </div>
                                    <div className="text-[var(--pcr-text-primary)] text-[24px] font-light">
                                        {countAvailable(tipBox2)} tips available
                                    </div>
                                </div>
                            </div>

                            {/* Right column - Total */}
                            <div className="bg-[var(--pcr-card-dark)] rounded-[20px] p-6 flex flex-col justify-between">
                                <div>
                                    <div className="text-[var(--pcr-text-primary)] text-[28px] font-light mb-4">
                                        Total available:
                                    </div>
                                    <div className="text-[var(--pcr-text-primary)] text-[48px] font-light mb-8">
                                        {totalAvailable}
                                    </div>
                                </div>
                                <div className="text-[var(--pcr-text-primary)] text-[24px] font-light">
                                    Required: 96
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="max-w-[912px] w-full flex justify-center mt-12 mb-12">
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