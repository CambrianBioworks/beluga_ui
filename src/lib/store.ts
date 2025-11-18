// lib/store.ts
import { create } from "zustand"

interface RunData {
  protocolType: string
  sampleType: string
  runId: string
  operatorName: string
  numberOfSamples: string
  sampleInputMethod: string
  samplePositions?: number[]
  elutionType: string  
  reagentVolumes: string[]
  pipetteTips: string[]
  selectedWells: string[]
}

interface RunProgress {
  step: string
  progress: number
  details?: any
}

interface RunStore {
  currentPage: string
  runData: RunData
  
  // Socket/Run state
  isSocketConnected: boolean
  activeRunId: string | null
  runProgress: RunProgress | null
  runError: string | null
  barcodeSlots: Record<number, any>
  isScanning: boolean
  scanProgress: {
    mapped_slots: number
    sample_count: number
    empty_count: number
    remaining: number
  } | null
  
  // Existing setters
  setCurrentPage: (type: string) => void
  setProtocolType: (type: string) => void
  setSampleType: (type: string) => void
  setRunId: (id: string) => void
  setOperatorName: (name: string) => void
  setNumberOfSamples: (count: string) => void
  setSampleInputMethod: (method: string) => void
  setElutionType: (type: string) => void
  setReagentVolumes: (volumes: string[]) => void
  setPipetteTips: (tips: string[]) => void
  setSelectedWells: (wells: string[]) => void
  resetRunData: () => void
  setBarcodeSlots: (slots: Record<number, any>) => void
  setIsScanning: (scanning: boolean) => void
  setScanProgress: (progress: any) => void
  resetBarcodeData: () => void
  
  // New socket setters
  setSocketConnected: (connected: boolean) => void
  setActiveRunId: (runId: string | null) => void
  setRunProgress: (progress: RunProgress | null) => void
  setRunError: (error: string | null) => void
}

const initialRunData: RunData = {
  protocolType: "",
  sampleType: "",
  runId: "",
  operatorName: "",
  numberOfSamples: "",
  sampleInputMethod: "",
  elutionType: "",
  reagentVolumes: [],
  pipetteTips: [],
  selectedWells: [],
}

export const useRunStore = create<RunStore>((set) => ({
  currentPage: "dashboard",
  runData: initialRunData,
  
  // Socket/Run state
  isSocketConnected: false,
  activeRunId: null,
  runProgress: null,
  runError: null,
  barcodeSlots: {},
  isScanning: false,
  scanProgress: null,
  
  // Existing setters
  setCurrentPage: (page) => set({ currentPage: page }),
  setProtocolType: (type) =>
    set((state) => ({
      runData: { ...state.runData, protocolType: type },
    })),

  setSampleType: (type) =>
    set((state) => ({
      runData: { ...state.runData, sampleType: type },
    })),

  setRunId: (id) =>
    set((state) => ({
      runData: { ...state.runData, runId: id },
    })),

  setOperatorName: (name) =>
    set((state) => ({
      runData: { ...state.runData, operatorName: name },
    })),

  setNumberOfSamples: (count) =>
    set((state) => ({
      runData: { ...state.runData, numberOfSamples: count },
    })),

  setSampleInputMethod: (method) =>
    set((state) => ({
      runData: { ...state.runData, sampleInputMethod: method },
    })),
  
  setElutionType: (type) =>
    set((state) => ({
      runData: { ...state.runData, elutionType: type },
    })),
  
  setReagentVolumes: (volumes) =>
    set((state) => ({
      runData: { ...state.runData, reagentVolumes: volumes },
    })),
  
  setPipetteTips: (tips) =>
    set((state) => ({
      runData: { ...state.runData, pipetteTips: tips },
    })),

  setSelectedWells: (wells) =>
    set((state) => ({
      runData: { ...state.runData, selectedWells: wells },
    })),

  resetRunData: () => set({ runData: initialRunData }),
  
  // New socket setters
  setSocketConnected: (connected) => set({ isSocketConnected: connected }),
  setActiveRunId: (runId) => set({ activeRunId: runId }),
  setRunProgress: (progress) => set({ runProgress: progress }),
  setRunError: (error) => set({ runError: error }),

  setBarcodeSlots: (slots) => set({ barcodeSlots: slots }),
  setIsScanning: (scanning) => set({ isScanning: scanning }),
  setScanProgress: (progress) => set({ scanProgress: progress }),
  resetBarcodeData: () => set({ 
    barcodeSlots: {}, 
    isScanning: false, 
    scanProgress: null 
  }),
}))