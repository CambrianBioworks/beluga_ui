"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Wifi, Info, Lightbulb, Sun, Moon, X, RotateCw, Zap, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useRunStore } from "@/lib/store"
import RunSetup from "@/components/run-setup"
import RunSetup2 from "@/components/run-setup-2"
import { LoadPlastics } from "@/components/load-plastics"
import { LoadReagentsDeck } from "@/components/load-reagents-deck"
import LoadSamples from "@/components/load-samples"
import TipBox from "@/components/tip-box"
import ElutionWellSelection from "@/components/elution-well-selection"
import PreRunSummary from "@/components/pre-run-summary"
import RunPage from "@/components/run-page"
import WiFiModal from "@/components/wifi-modal"
import UpdateModal from "@/components/update-modal"
import { useSocketContext } from "@/lib/socketProvider"

const UVIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`w-20 h-20 ${className}`}>
    <g fill="currentColor">
      <rect x="45" y="20" width="10" height="60" rx="5" />
      <rect x="20" y="45" width="60" height="10" rx="5" />
      <rect x="30" y="30" width="8" height="8" rx="4" transform="rotate(45 34 34)" />
      <rect x="62" y="30" width="8" height="8" rx="4" transform="rotate(45 66 34)" />
      <rect x="30" y="62" width="8" height="8" rx="4" transform="rotate(45 34 66)" />
      <rect x="62" y="62" width="8" height="8" rx="4" transform="rotate(45 66 66)" />
    </g>
  </svg>
)

const HEPAIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`w-20 h-20 ${className}`}>
    <g fill="currentColor">
      <rect x="20" y="30" width="60" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M30 40 L70 40 M30 50 L70 50 M30 60 L70 60" stroke="currentColor" strokeWidth="2" />
      <path d="M35 25 L35 35 M45 25 L45 35 M55 25 L55 35 M65 25 L65 35" stroke="currentColor" strokeWidth="2" />
      <path d="M35 65 L35 75 M45 65 L45 75 M55 65 L55 75 M65 65 L65 75" stroke="currentColor" strokeWidth="2" />
    </g>
  </svg>
)

const sampleTypeOptions = [
  { value: "Whole Blood DNA", label: "Whole Blood DNA" },
  { value: "Fresh Tissue DNA", label: "Fresh Tissue DNA" },
  { value: "Stool DNA", label: "Stool DNA" },
  { value: "cfDNA", label: "cfDNA" },
];

export default function PCRDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProtocol, setSelectedProtocol] = useState("")
  const { controlUVLight, controlSystemLight, controlHEPAFilter, getWiFiStatus, scanWiFiNetworks, connectToWiFi, disconnectWiFi, isConnected, initializeBeluga } = useSocketContext()
  const [showWiFiModal, setShowWiFiModal] = useState(false)
  const [deviceStates, setDeviceStates] = useState({
    uvLight: false,
    systemLight: false,
    hepaFilter: false
  })
  const [wifiStatus, setWifiStatus] = useState({
    connected: false,
    ssid: null,
    signal_strength: null
  })
  const [controlLoading, setControlLoading] = useState<string | null>(null)

  const { currentPage, setCurrentPage, setProtocolType, setSampleType } = useRunStore()
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  // Update notification state
  const [updateData, setUpdateData] = useState<any>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateComplete, setUpdateComplete] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const allImages = [
    "/DNA.png",
    "/RNA.png",
    "/Virus.png"
  ]

  useEffect(() => {
    // Initialize page from URL hash on mount
    const hash = window.location.hash.slice(1)
    if (hash && hash !== currentPage) {
      setCurrentPage(hash)
    }
  }, [])

  useEffect(() => {
    // Update URL without page reload
    window.history.replaceState(null, "", `#${currentPage}`)

    // Handle browser back button
    const handlePopState = () => {
      const hash = window.location.hash.slice(1)
      if (hash && hash !== currentPage) {
        setCurrentPage(hash)
      } else if (!hash && currentPage !== "dashboard") {
        setCurrentPage("dashboard")
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [currentPage])

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

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

  // Poll for updates - only on dashboard page
  useEffect(() => {
    if (currentPage !== 'dashboard') return

    const checkForUpdates = async () => {
      try {
        const response = await fetch('/api/update/check')
        const data = await response.json()

        if (data.update_available) {
          setUpdateData(data)

          // If mandatory and we're on dashboard, show modal immediately
          if (data.mandatory && !showUpdateModal) {
            setShowUpdateModal(true)
          }
        } else {
          setUpdateData(null)
          setShowUpdateModal(false)
        }
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }

    // Check immediately on mount
    checkForUpdates()

    // Then check every 60 seconds
    const interval = setInterval(checkForUpdates, 60000)

    return () => clearInterval(interval)
  }, [currentPage, showUpdateModal])

  const handleUpdateClick = () => {
    setShowUpdateModal(true)
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const response = await fetch('/api/update/trigger', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setUpdateComplete(true)
        // Poll for completion (file deletion)
        checkUpdateCompletion()
      } else {
        setUpdateError(data.error || 'Failed to trigger update')
        setIsUpdating(false)
      }
    } catch (error) {
      setUpdateError('Failed to trigger update')
      setIsUpdating(false)
    }
  }

  const checkUpdateCompletion = () => {
    let pollCount = 0
    const maxPolls = 24 // 2 minutes max (24 * 5 seconds)

    const interval = setInterval(async () => {
      pollCount++

      try {
        const response = await fetch('/api/update/check')
        const data = await response.json()

        if (!data.update_available) {
          clearInterval(interval)
          setIsUpdating(false)
          setUpdateData(null)
          // Keep modal open to show success, user can close it
        }
      } catch (error) {
        console.error('Failed to check update completion:', error)
      }

      if (pollCount >= maxPolls) {
        clearInterval(interval)
        setUpdateError('Update is taking longer than expected')
        setIsUpdating(false)
      }
    }, 5000)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  const getGreeting = (date: Date) => {
    const hour = date.getHours()
    
    if (hour >= 5 && hour < 12) {
      return "Good morning"
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon"
    } else {
      return "Good evening"
    }
  }

  const handleWiFiClick = async () => {
    try {
      const status = await getWiFiStatus()
      setWifiStatus(status)
      
      if (status.connected) {
        // Show disconnect option or WiFi details
        console.log(`Connected to: ${status.ssid}`)
      } else {
        // Show available networks
        const networks = await scanWiFiNetworks()
        console.log('Available networks:', networks)
        // Open WiFi selection modal
      }
    } catch (error) {
      console.error('WiFi operation failed:', error)
    }
  }

  const handleUVLightToggle = async () => {
    if (!isConnected) {
      console.error('Not connected to server')
      return
    }

    setControlLoading('uv')
    try {
      const newState = !deviceStates.uvLight
      await controlUVLight(newState)
      setDeviceStates(prev => ({ ...prev, uvLight: newState }))
      console.log(`UV Light turned ${newState ? 'ON' : 'OFF'}`)
    } catch (error) {
      console.error('Failed to control UV light:', error)
    } finally {
      setControlLoading(null)
    }
  }

  const handleSystemLightToggle = async () => {
    if (!isConnected) {
      console.error('Not connected to server')
      return
    }

    setControlLoading('system')
    try {
      const newState = !deviceStates.systemLight
      await controlSystemLight(newState)
      setDeviceStates(prev => ({ ...prev, systemLight: newState }))
      console.log(`System Light turned ${newState ? 'ON' : 'OFF'}`)
    } catch (error) {
      console.error('Failed to control system light:', error)
    } finally {
      setControlLoading(null)
    }
  }

  const handleHEPAFilterToggle = async () => {
    if (!isConnected) {
      console.error('Not connected to server')
      return
    }

    setControlLoading('hepa')
    try {
      const newState = !deviceStates.hepaFilter
      await controlHEPAFilter(newState)
      setDeviceStates(prev => ({ ...prev, hepaFilter: newState }))
      console.log(`HEPA Filter turned ${newState ? 'ON' : 'OFF'}`)
    } catch (error) {
      console.error('Failed to control HEPA filter:', error)
    } finally {
      setControlLoading(null)
    }
  }

  const handleProtocolClick = (protocol: string) => {
    setSelectedProtocol(protocol)
    setProtocolType(protocol)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProtocol("")
  }

  const handleSampleTypeSelect = (sampleType: string) => {
    setSampleType(sampleType)
    setCurrentPage("run-setup")
    closeModal()
  }

  if (currentPage === "pre-run-summary") {
    return <PreRunSummary />
  }

  if (currentPage === "elution-well-selection") {
    return <ElutionWellSelection />
  }

  if (currentPage === "tip-box") {
    return <TipBox />
  }

  if (currentPage === "load-samples") {
    return <LoadSamples />
  }

  if (currentPage === "load-reagents-deck") {
    return <LoadReagentsDeck />
  }

  if (currentPage === "load-plastics") {
    return <LoadPlastics />
  }

  if (currentPage === "run-setup") {
    return <RunSetup />
  }

  if (currentPage === "run-setup-2") {
    return <RunSetup2 />
  }

  if (currentPage === "run-page") {
    return <RunPage />
  }

  if (!imagesLoaded && currentPage === "dashboard") {
    return (
      <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-16 h-16 text-[var(--pcr-accent)] animate-spin" />
          <p className="text-[var(--pcr-text-primary)] text-[28px] font-light" style={{ fontFamily: "Space Grotesk" }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] mx-auto overflow-hidden">
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
      {isModalOpen && <div className="absolute inset-0 backdrop-blur-sm z-40"></div>}

      <div className="absolute top-16 right-16 flex gap-4">
        <Button variant="ghost" size="lg" className="text-[var(--pcr-text-primary)] active:text-gray-300" onClick={initializeBeluga}>
          <RotateCw className="size-12" />
        </Button>
        <Button variant="ghost" size="lg" className="text-[var(--pcr-text-primary)] active:text-gray-300"   onClick={() => setShowWiFiModal(true)}>
          <Wifi className="size-12" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="text-[var(--pcr-text-primary)] active:text-gray-300 relative"
          onClick={handleUpdateClick}
          disabled={!updateData}
        >
          <Info className="size-12" />
          {/* Update indicator badge */}
          {updateData && updateData.update_available && (
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${
              updateData.mandatory ? 'bg-red-500 animate-pulse' : 'bg-[var(--pcr-accent)]'
            }`} />
          )}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="text-[var(--pcr-text-primary)] active:text-gray-300"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {!mounted ? (
            // Show a neutral icon during hydration to prevent mismatch
            <div className="size-12" />
          ) : theme === "dark" ? (
            <Sun className="size-12" />
          ) : (
            <Moon className="size-12" />
          )}
        </Button>
      </div>

      <div className="absolute left-[84px] top-[115px] w-[500px] h-[65px]">
        <h1 className="text-[52px] leading-[54px] font-normal text-[var(--pcr-text-primary)]">{getGreeting(currentTime)}</h1>
      </div>

      <div className="absolute left-[84px] top-[192px] w-[420px] h-[91px]">
        <div className="text-[96px] leading-[100px] font-medium text-[var(--pcr-text-primary)]">
          {formatTime(currentTime)}
        </div>
      </div>

      <div className="absolute left-[84px] top-[310px] w-[500px] h-[44px]">
        <div className="text-[36px] leading-[40px] font-normal text-[var(--pcr-text-primary)]">
          {formatDate(currentTime)}
        </div>
      </div>

      <div className="absolute left-[84px] top-[404px] w-[912px] h-[2px] bg-[var(--pcr-accent)] rounded-[20px]"></div>

      <div className="absolute left-[84px] top-[498px] w-[380px] h-[44px]">
        <h2 className="text-[36px] leading-[40px] font-normal text-[var(--pcr-text-primary)]">Protocols</h2>
      </div>

      <div
        className="absolute left-[84px] top-[592px] w-[295px] h-[295px] bg-[var(--pcr-card)] rounded-[20px] cursor-pointer active:bg-[var(--pcr-card-dark)] transition-colors"
        onClick={() => handleProtocolClick("DNA")}
      >
        <div className="relative h-full flex items-center justify-center">
          <Image src="/DNA.png" alt="DNA Icon" width={120} height={160} className="object-contain mr-25" />
          <span className="absolute bottom-6 right-6 text-[36px] leading-[46px] font-normal text-[var(--pcr-text-primary)]">
            DNA
          </span>
        </div>
      </div>

      <div
        className="absolute left-[392px] top-[592px] w-[295px] h-[295px] bg-[var(--pcr-card)] rounded-[20px] cursor-pointer active:bg-[var(--pcr-card-dark)] transition-colors"
        // onClick={() => handleProtocolClick("RNA")}
      >
        <div className="relative h-full flex items-center justify-center">
          <Image src="/RNA.png" alt="RNA Icon" width={140} height={180} className="object-contain mr-25" />
          <span className="absolute bottom-6 right-6 text-[36px] leading-[46px] font-normal text-[var(--pcr-text-primary)]">
            RNA
          </span>
        </div>
      </div>

      <div
        className="absolute left-[701px] top-[592px] w-[295px] h-[295px] bg-[var(--pcr-card)] rounded-[20px] cursor-pointer active:bg-[var(--pcr-card-dark)] transition-colors"
        // onClick={() => handleProtocolClick("Virus")}
      >
        <div className="relative h-full flex items-center justify-center">
          <Image src="/Virus.png" alt="Virus Icon" width={150} height={150} className="object-contain mr-25 mb-20" />
          <span className="absolute bottom-6 right-6 text-[36px] leading-[46px] font-normal text-[var(--pcr-text-primary)]">
            Virus
          </span>
        </div>
      </div>

      <div className="absolute left-[87px] top-[972px] w-[443px] h-[175px] bg-[var(--pcr-card)] rounded-[20px] cursor-pointer active:bg-[var(--pcr-card-dark)] transition-colors">
        <div className="relative h-full">
          <span className="absolute top-6 left-6 text-[32px] leading-[40px] font-normal text-[var(--pcr-text-primary)]">
            Run logs
          </span>
        </div>
      </div>

      <div className="absolute left-[553px] top-[972px] w-[443px] h-[175px] bg-[var(--pcr-card)] rounded-[20px] cursor-pointer active:bg-[var(--pcr-card-dark)] transition-colors">
        <div className="relative h-full">
          <span className="absolute top-6 left-6 text-[32px] leading-[40px] font-normal text-[var(--pcr-text-primary)]">
            Maintenance
          </span>
        </div>
      </div>

      <div className="absolute left-[84px] top-[1232px] w-[380px] h-[44px]">
        <h2 className="text-[36px] leading-[40px] font-normal text-[var(--pcr-text-primary)]">Control Panel</h2>
      </div>

      {/* UV Light Button */}
      <div 
        className={`absolute left-[84px] top-[1326px] w-[446px] h-[174px] rounded-[20px] cursor-pointer transition-colors ${
          deviceStates.uvLight 
            ? 'bg-[var(--pcr-accent)] hover:bg-blue-700' 
            : 'bg-[var(--pcr-card)] hover:opacity-90'
        } ${controlLoading === 'uv' ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleUVLightToggle}
      >
        <div className="relative h-full">
          <span className={`absolute top-6 left-6 text-[32px] leading-[40px] font-normal ${
            deviceStates.uvLight ? 'text-white' : 'text-[var(--pcr-text-primary)]'
          }`}>
            UV light {deviceStates.uvLight ? '(ON)' : '(OFF)'}
          </span>
          {controlLoading === 'uv' && (
            <span className="absolute top-16 left-6 text-sm text-white">Controlling...</span>
          )}
          <div className="absolute bottom-6 right-6">
            <UVIcon className={deviceStates.uvLight ? 'text-white' : 'text-[var(--pcr-text-primary)]'} />
          </div>
        </div>
      </div>

      {/* System Light Button */}
      <div 
        className={`absolute left-[84px] top-[1534px] w-[446px] h-[174px] rounded-[20px] cursor-pointer transition-colors ${
          deviceStates.systemLight 
            ? 'bg-yellow-600 hover:bg-yellow-700' 
            : 'bg-[var(--pcr-card)] hover:opacity-90'
        } ${controlLoading === 'system' ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleSystemLightToggle}
      >
        <div className="relative h-full">
          <span className={`absolute top-6 left-6 text-[32px] leading-[40px] font-normal ${
            deviceStates.systemLight ? 'text-white' : 'text-[var(--pcr-text-primary)]'
          }`}>
            System light {deviceStates.systemLight ? '(ON)' : '(OFF)'}
          </span>
          {controlLoading === 'system' && (
            <span className="absolute top-16 left-6 text-sm text-white">Controlling...</span>
          )}
          <div className="absolute bottom-6 right-6">
            <Lightbulb className={`w-20 h-20 ${
              deviceStates.systemLight ? 'text-white' : 'text-[var(--pcr-text-primary)]'
            }`} />
          </div>
        </div>
      </div>

      {/* HEPA Filter Button */}
      <div 
        className={`absolute left-[553px] top-[1326px] w-[443px] h-[382px] rounded-[20px] cursor-pointer transition-colors ${
          deviceStates.hepaFilter 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-[var(--pcr-card)] hover:bg-[var(--pcr-card-dark)]'
        } ${controlLoading === 'hepa' ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleHEPAFilterToggle}
      >
        <div className="relative h-full">
          <span className={`absolute top-6 left-6 text-[32px] leading-[40px] font-normal ${
            deviceStates.hepaFilter ? 'text-white' : 'text-[var(--pcr-text-primary)]'
          }`}>
            HEPA filter {deviceStates.hepaFilter ? '(ON)' : '(OFF)'}
          </span>
          {controlLoading === 'hepa' && (
            <span className="absolute top-16 left-6 text-sm text-white">Controlling...</span>
          )}
          <div className="absolute bottom-6 right-6">
            <HEPAIcon className={deviceStates.hepaFilter ? 'text-white' : 'text-[var(--pcr-text-primary)]'} />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out"
          onClick={closeModal}
        >
          <div
            className="absolute w-[638px] bg-[var(--pcr-card)] rounded-[20px] shadow-2xl border border-[var(--pcr-card-dark)] transform transition-all duration-300 ease-in-out animate-in fade-in-0 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              // Calculate dynamic height based on number of options
              height: `${170 + (sampleTypeOptions.length * 92) + ((sampleTypeOptions.length - 1) * 35) + 60}px`
            }}
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-[var(--pcr-text-primary)] active:text-gray-300 transition-colors duration-150"
            >
              <X className="w-12 h-12" />
            </button>

            <div className="absolute left-[44px] top-[60px]">
              <h2 className="text-[32px] leading-[40px] font-normal text-[var(--pcr-text-primary)]">
                Select your sample type
              </h2>
            </div>

            {/* Dynamic option rendering */}
            {sampleTypeOptions.map((option, index) => (
              <div 
                key={option.value}
                className="absolute left-[calc(50%-549px/2)] w-[549px] h-[92px]"
                style={{ top: `${170 + (index * 127)}px` }} // 92px height + 35px spacing
              >
                <button
                  onClick={() => handleSampleTypeSelect(option.value)}
                  className="w-full h-full bg-[var(--pcr-card-dark)] rounded-[20px] active:bg-[var(--pcr-accent)] transition-all duration-200 ease-in-out transform active:scale-95"
                >
                  <span className="text-[32px] leading-[40px] font-normal text-[var(--pcr-text-primary)] ml-6 text-left block">
                    {option.label}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {showWiFiModal && (
        <WiFiModal
          isOpen={showWiFiModal}
          onClose={() => setShowWiFiModal(false)}
        />
      )}
      {updateData && (
        <UpdateModal
          isOpen={showUpdateModal}
          onClose={() => {
            if (!updateData.mandatory) {
              setShowUpdateModal(false)
            }
          }}
          updateData={updateData}
          onUpdate={handleUpdate}
          isUpdating={isUpdating}
          updateComplete={updateComplete}
          updateError={updateError}
        />
      )}
    </div>
  )
}
