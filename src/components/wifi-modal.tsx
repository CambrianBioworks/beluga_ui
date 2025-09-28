"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Wifi, Lock, RefreshCw, Loader2, Delete, Space } from "lucide-react"
import { useSocket } from "@/lib/useSocket"

interface WiFiModalProps {
    isOpen: boolean
    onClose: () => void
}

interface KeyboardProps {
    onKeyPress: (key: string) => void
    onBackspace: () => void
    onClose: () => void
}

function OnScreenKeyboard({ onKeyPress, onBackspace, onClose }: KeyboardProps) {
    const [isShifted, setIsShifted] = useState(false)
    const [isCapsLock, setIsCapsLock] = useState(false)
    const [showSpecialChars, setShowSpecialChars] = useState(false)

    const normalKeys = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ]

    const shiftedKeys = [
        ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ]

    const specialChars = [
        ['-', '=', '[', ']', '\\', ';', "'", ',', '.', '/'],
        ['_', '+', '{', '}', '|', ':', '"', '<', '>', '?'],
        ['~', '`', '€', '£', '¥', '§', '°', '±', '×', '÷']
    ]

    const getCurrentKeys = () => {
        if (showSpecialChars) return specialChars
        if (isShifted || isCapsLock) return shiftedKeys
        return normalKeys
    }

    const handleKeyPress = (key: string) => {
        let finalKey = key
        
        if (!showSpecialChars && key.match(/[A-Z]/)) {
            // Handle letter case
            if (isCapsLock || isShifted) {
                finalKey = key.toUpperCase()
            } else {
                finalKey = key.toLowerCase()
            }
        }
        
        onKeyPress(finalKey)
        
        // Reset shift after key press (but not caps lock)
        if (isShifted && !isCapsLock) {
            setIsShifted(false)
        }
    }

    const handleShiftPress = () => {
        setIsShifted(!isShifted)
    }

    const handleCapsLockPress = () => {
        setIsCapsLock(!isCapsLock)
        if (isCapsLock) {
            setIsShifted(false) // Turn off shift when turning off caps lock
        }
    }

    const handleSpecialToggle = () => {
        setShowSpecialChars(!showSpecialChars)
    }

    return (
        <>
            {/* Transparent backdrop */}
            <div className="fixed inset-0 z-60" onClick={onClose} />

            {/* Keyboard */}
            <div className="fixed bottom-0 left-0 right-0 z-70 bg-[var(--pcr-card)] border-t-2 border-[var(--pcr-card-dark)] p-[40px] shadow-2xl">
                <div className="max-w-[1080px] mx-auto">
                    {/* Keyboard rows */}
                    <div className="space-y-[16px]">
                        {getCurrentKeys().map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center gap-[12px]">
                                {row.map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => handleKeyPress(key)}
                                        className="w-[80px] h-[60px] bg-[var(--pcr-card-dark)] rounded-[12px] text-[20px] font-normal text-[var(--pcr-text-primary)] active:bg-[var(--pcr-accent)] transition-colors shadow-lg border border-[var(--pcr-card-dark)]"
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                        ))}

                        {/* Function keys row */}
                        <div className="flex justify-center gap-[12px] mt-[24px]">
                            <button
                                onClick={handleShiftPress}
                                className={`w-[100px] h-[60px] rounded-[12px] text-[18px] font-normal transition-colors shadow-lg border ${
                                    isShifted 
                                        ? 'bg-[var(--pcr-accent)] text-white border-[var(--pcr-accent)]' 
                                        : 'bg-[var(--pcr-card-dark)] text-[var(--pcr-text-primary)] border-[var(--pcr-card-dark)]'
                                }`}
                            >
                                ⇧ Shift
                            </button>

                            <button
                                onClick={handleCapsLockPress}
                                className={`w-[120px] h-[60px] rounded-[12px] text-[18px] font-normal transition-colors shadow-lg border ${
                                    isCapsLock 
                                        ? 'bg-[var(--pcr-accent)] text-white border-[var(--pcr-accent)]' 
                                        : 'bg-[var(--pcr-card-dark)] text-[var(--pcr-text-primary)] border-[var(--pcr-card-dark)]'
                                }`}
                            >
                                ⇪ Caps
                            </button>

                            <button
                                onClick={() => handleKeyPress(' ')}
                                className="w-[200px] h-[60px] bg-[var(--pcr-card-dark)] rounded-[12px] text-[18px] font-normal text-[var(--pcr-text-primary)] active:bg-[var(--pcr-accent)] transition-colors flex items-center justify-center gap-[8px] shadow-lg border border-[var(--pcr-card-dark)]"
                            >
                                <Space className="w-[18px] h-[18px]" />
                                Space
                            </button>

                            <button
                                onClick={handleSpecialToggle}
                                className={`w-[100px] h-[60px] rounded-[12px] text-[18px] font-normal transition-colors shadow-lg border ${
                                    showSpecialChars 
                                        ? 'bg-[var(--pcr-accent)] text-white border-[var(--pcr-accent)]' 
                                        : 'bg-[var(--pcr-card-dark)] text-[var(--pcr-text-primary)] border-[var(--pcr-card-dark)]'
                                }`}
                            >
                                !@#
                            </button>

                            <button
                                onClick={onBackspace}
                                className="w-[120px] h-[60px] bg-red-500 rounded-[12px] text-[18px] font-normal text-white active:bg-red-600 transition-colors flex items-center justify-center gap-[8px] shadow-lg border border-red-400"
                            >
                                <Delete className="w-[18px] h-[18px]" />
                                Delete
                            </button>

                            <button
                                onClick={onClose}
                                className="w-[100px] h-[60px] bg-green-600 rounded-[12px] text-[18px] font-normal text-white active:bg-green-700 transition-colors shadow-lg border border-green-500"
                            >
                                Done
                            </button>
                        </div>

                        {/* Keyboard mode indicator */}
                        <div className="flex justify-center mt-4">
                            <div className="px-4 py-2 bg-[var(--pcr-card-dark)] rounded-lg text-[14px] text-[var(--pcr-text-primary)]">
                                {showSpecialChars ? 'Special Characters' : 
                                 isCapsLock ? 'CAPS LOCK ON' : 
                                 isShifted ? 'Shift Active' : 'Lowercase'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function WiFiModal({ isOpen, onClose }: WiFiModalProps) {
    const { getWiFiStatus, scanWiFiNetworks, connectToWiFi, disconnectWiFi, isConnected } = useSocket()
    const [networks, setNetworks] = useState<any[]>([])
    const [currentConnection, setCurrentConnection] = useState<any>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [isConnecting, setIsConnecting] = useState<string | null>(null)
    const [isDisconnecting, setIsDisconnecting] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null)
    const [password, setPassword] = useState("")
    const [showKeyboard, setShowKeyboard] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const loadWiFiData = async () => {
        try {
            if (!isConnected) {
                console.log('Socket not connected, skipping WiFi data load')
                return
            }

            setErrorMessage(null)
            console.log('Loading WiFi status...')
            const status = await getWiFiStatus()
            console.log('WiFi status:', status)
            setCurrentConnection(status)

            console.log('Scanning networks...')
            setIsScanning(true)
            const networkData = await scanWiFiNetworks()
            console.log('Networks found:', networkData)
            setNetworks(networkData.networks || [])

        } catch (error: any) {
            console.error('Failed to load WiFi data:', error)
            setErrorMessage(`Failed to load WiFi data: ${error.message}`)
        } finally {
            setIsScanning(false)
        }
    }

    useEffect(() => {
        if (isOpen && isConnected) {
            const timer = setTimeout(() => {
                loadWiFiData()
            }, 200)

            return () => clearTimeout(timer)
        }
    }, [isOpen, isConnected])

    const handleConnect = async (ssid: string) => {
        if (currentConnection?.connected && currentConnection.ssid === ssid) {
            return
        }

        const network = networks.find(n => n.ssid === ssid)
        if (network?.security !== '--' && network?.security !== 'NONE') {
            setShowPasswordModal(ssid)
            return
        }

        try {
            setIsConnecting(ssid)
            setErrorMessage(null)
            const result = await connectToWiFi(ssid, "")
            console.log('Connection result:', result)
            await loadWiFiData()
        } catch (error: any) {
            console.error('Connection failed:', error)
            setErrorMessage(`Connection failed: ${error.message}`)
        } finally {
            setIsConnecting(null)
        }
    }

    const handlePasswordConnect = async () => {
        if (!showPasswordModal || !password.trim()) return

        try {
            setIsConnecting(showPasswordModal)
            setErrorMessage(null)
            const result = await connectToWiFi(showPasswordModal, password)
            console.log('Connection result:', result)
            await loadWiFiData()
            setShowPasswordModal(null)
            setPassword("")
            setShowKeyboard(false)
        } catch (error: any) {
            console.error('Connection failed:', error)
            setErrorMessage(`Connection failed: ${error.message}`)
        } finally {
            setIsConnecting(null)
        }
    }

    const handleDisconnect = async () => {
        try {
            setIsDisconnecting(true)
            setErrorMessage(null)
            await disconnectWiFi()
            await loadWiFiData()
        } catch (error: any) {
            console.error('Disconnect failed:', error)
            setErrorMessage(`Disconnect failed: ${error.message}`)
        } finally {
            setIsDisconnecting(false)
        }
    }

    const handleKeyPress = (key: string) => {
        setPassword(prev => prev + key)
    }

    const handleBackspace = () => {
        setPassword(prev => prev.slice(0, -1))
    }

    const closeKeyboard = () => {
        setShowKeyboard(false)
    }

    if (!isOpen) return null

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="w-[800px] h-[1000px] bg-[var(--pcr-card)] rounded-[20px] relative">
                {/* Header */}
                <div className="flex justify-between items-center p-8">
                    <h2 className="text-[36px] font-normal text-[var(--pcr-text-primary)]">WiFi Networks</h2>
                    <Button variant="ghost" onClick={onClose}>
                        <X className="w-12 h-12" />
                    </Button>
                </div>

                {/* Connection Status */}
                {!isConnected && (
                    <div className="mx-8 mb-6 p-4 bg-red-600 rounded-[12px]">
                        <p className="text-white">Not connected to server. Please wait...</p>
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="mx-8 mb-6 p-4 bg-red-600 rounded-[12px]">
                        <p className="text-white text-[18px]">{errorMessage}</p>
                    </div>
                )}

                {/* Current Connection */}
                {currentConnection?.connected && (
                    <div className="mx-8 mb-6 p-6 bg-[var(--pcr-card-dark)] rounded-[16px]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-[24px] text-[var(--pcr-text-primary)]">Connected to:</h3>
                                <p className="text-[20px] text-blue-400">{currentConnection.ssid}</p>
                                {currentConnection.signal_strength && (
                                    <p className="text-[16px] text-gray-400">Signal: {currentConnection.signal_strength}</p>
                                )}
                            </div>
                            <Button
                                onClick={handleDisconnect}
                                disabled={isDisconnecting}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 min-w-[140px]"
                            >
                                {isDisconnecting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Disconnecting...
                                    </>
                                ) : (
                                    'Disconnect'
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Scan Button */}
                <div className="mx-8 mb-6">
                    <Button
                        onClick={loadWiFiData}
                        disabled={isScanning || !isConnected}
                        className="flex items-center gap-3 px-6 py-3 min-w-[180px]"
                    >
                        {isScanning ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Scanning...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-6 h-6" />
                                Refresh Networks
                            </>
                        )}
                    </Button>
                </div>

                {/* Networks List */}
                <div className="mx-8 max-h-[600px] overflow-y-auto">
                    {networks.map((network, index) => (
                        <div
                            key={index}
                            className={`flex justify-between items-center p-4 mb-3 rounded-[12px] transition-all ${network.in_use
                                    ? 'bg-blue-600/20 border border-blue-400'
                                    : 'bg-[var(--pcr-card-dark)] hover:bg-opacity-80 cursor-pointer'
                                }`}
                            onClick={() => !network.in_use && handleConnect(network.ssid)}
                        >
                            <div className="flex items-center gap-4">
                                <Wifi className="w-8 h-8" />
                                {network.security !== '--' && network.security !== 'NONE' && (
                                    <Lock className="w-6 h-6" />
                                )}
                                <div>
                                    <p className="text-[20px] text-[var(--pcr-text-primary)] truncate max-w-[400px]">
                                        {network.ssid.length > 25 ? `${network.ssid.substring(0, 25)}...` : network.ssid}
                                        {network.in_use && <span className="text-blue-400"> (Connected)</span>}
                                    </p>
                                    <p className="text-[14px] text-gray-400">
                                        {network.signal_strength} • {network.security}
                                    </p>
                                </div>
                            </div>

                            {isConnecting === network.ssid && (
                                <div className="flex items-center gap-2 text-blue-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Connecting...
                                </div>
                            )}
                        </div>
                    ))}

                    {networks.length === 0 && !isScanning && isConnected && (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-[18px]">No networks found</p>
                            <p className="text-[14px] mt-2">Try refreshing to scan again</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="absolute inset-0 flex items-center justify-center z-60">
                    <div className="w-[500px] bg-[var(--pcr-card)] rounded-[20px] p-8 relative">
                        <h3 className="text-[24px] mb-6">Enter Password for {showPasswordModal}</h3>

                        <div
                            onClick={() => setShowKeyboard(true)}
                            className="w-full p-4 mb-6 bg-[var(--pcr-card-dark)] rounded-[12px] text-[18px] min-h-[60px] cursor-text border-2 border-transparent focus-within:border-[var(--pcr-accent)] transition-colors"
                        >
                            {password || <span className="text-gray-500">Tap to enter password</span>}
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={handlePasswordConnect}
                                disabled={!password.trim() || isConnecting === showPasswordModal}
                                className="flex-1 py-3 min-h-[50px]"
                            >
                                {isConnecting === showPasswordModal ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    'Connect'
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowPasswordModal(null)
                                    setPassword("")
                                    setShowKeyboard(false)
                                }}
                                className="flex-1 py-3"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* On-screen Keyboard */}
            {showKeyboard && (
                <OnScreenKeyboard
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onClose={closeKeyboard}
                />
            )}
        </div>
    )
}