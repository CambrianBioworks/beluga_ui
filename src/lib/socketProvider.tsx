// lib/SocketProvider.tsx
"use client"

import { createContext, useContext, useEffect } from 'react'
import { useSocket } from './useSocket'
import { useRunStore } from './store'

type SocketContextType = ReturnType<typeof useSocket>

const SocketContext = createContext<SocketContextType | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const socketHook = useSocket()

    const {
        socket,
        isConnected,
        barcodeSlots
    } = socketHook

    const {
        setSocketConnected,
        setBarcodeSlots,
        setIsScanning
    } = useRunStore()

    // Sync socket connection state to store
    useEffect(() => {
        setSocketConnected(isConnected)
    }, [isConnected, setSocketConnected])

    // Sync barcode slots to store
    useEffect(() => {
        setBarcodeSlots(barcodeSlots)
    }, [barcodeSlots, setBarcodeSlots])

    // Handle scan timeout and completion events
    useEffect(() => {
        if (!socket) return

        const handleTimeout = () => {
            console.log('⏱️ Scan timed out - stopping')
            setIsScanning(false)
        }

        const handleComplete = () => {
            console.log('✅ Scan completed - stopping')
            setIsScanning(false)
        }

        socket.on('scan_timeout', handleTimeout)
        socket.on('scan_complete', handleComplete)

        return () => {
            socket.off('scan_timeout', handleTimeout)
            socket.off('scan_complete', handleComplete)
        }
    }, [socket, setIsScanning])

    return (
        <SocketContext.Provider value={socketHook}>
            {children}
        </SocketContext.Provider>
    )
}

export function useSocketContext() {
    const context = useContext(SocketContext)
    if (!context) {
        throw new Error('useSocketContext must be used within SocketProvider')
    }
    return context
}