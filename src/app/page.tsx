"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Settings, Wifi, HelpCircle, Lightbulb, Sun, Moon, X } from "lucide-react"
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

const UVIcon = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
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

const HEPAIcon = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20 text-white">
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

  const { currentPage, setCurrentPage, setProtocolType, setSampleType } = useRunStore()

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
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

  return (
    <div className="relative w-[1080px] h-[1920px] bg-[var(--pcr-bg)] mx-auto overflow-hidden">
      {isModalOpen && <div className="absolute inset-0 backdrop-blur-sm z-40"></div>}

      <div className="absolute top-16 right-16 flex gap-4">
        <Button variant="ghost" size="lg" className="text-[var(--pcr-text-primary)] active:text-gray-300">
          <Settings className="size-12" />
        </Button>
        <Button variant="ghost" size="lg" className="text-[var(--pcr-text-primary)] active:text-gray-300">
          <Wifi className="size-12" />
        </Button>
        <Button variant="ghost" size="lg" className="text-[var(--pcr-text-primary)] active:text-gray-300">
          <HelpCircle className="size-12" />
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

      <div className="absolute left-[84px] top-[115px] w-[389px] h-[65px]">
        <h1 className="text-[52px] leading-[54px] font-normal text-[var(--pcr-text-primary)]">Good morning</h1>
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

      <div className="absolute left-[84px] top-[1326px] w-[446px] h-[174px] bg-[var(--pcr-card)] rounded-[20px] cursor-pointer active:bg-[var(--pcr-card-dark)] transition-colors">
        <div className="relative h-full">
          <span className="absolute top-6 left-6 text-[32px] leading-[40px] font-normal text-[var(--pcr-text-primary)]">
            UV light
          </span>
          <div className="absolute bottom-6 right-6">
            <UVIcon />
          </div>
        </div>
      </div>

      <div className="absolute left-[84px] top-[1534px] w-[446px] h-[174px] bg-[var(--pcr-card)] rounded-[20px] cursor-pointer active:opacity-90 transition-opacity">
        <div className="relative h-full">
          <span className="absolute top-6 left-6 text-[32px] leading-[40px] font-normal text-[var(--pcr-text-primary)]">
            System light
          </span>
          <div className="absolute bottom-6 right-6">
            <Lightbulb className="w-20 h-20 text-[var(--pcr-text-primary)]" />
          </div>
        </div>
      </div>

      <div className="absolute left-[553px] top-[1326px] w-[443px] h-[382px] bg-[var(--pcr-card)] rounded-[20px] cursor-pointer active:bg-[var(--pcr-card-dark)] transition-colors">
        <div className="relative h-full">
          <span className="absolute top-6 left-6 text-[32px] leading-[40px] font-normal text-[var(--pcr-text-primary)]">
            HEPA filter
          </span>
          <div className="absolute bottom-6 right-6">
            <HEPAIcon />
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
                  className="w-full h-full bg-[var(--pcr-card-dark)] rounded-[20px] active:bg-[#3a3f45] transition-all duration-200 ease-in-out transform active:scale-95"
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
    </div>
  )
}
