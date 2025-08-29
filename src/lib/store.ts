import { create } from "zustand"

interface RunData {
  protocolType: string
  sampleType: string
  runId: string
  operatorName: string
  numberOfSamples: string
  reagentVolumes: string[]
  pipetteTips: string[]
  selectedWells: string[]
}

interface RunStore {
  currentPage: string
  runData: RunData
  setCurrentPage: (type: string) => void
  setProtocolType: (type: string) => void
  setSampleType: (type: string) => void
  setRunId: (id: string) => void
  setOperatorName: (name: string) => void
  setNumberOfSamples: (count: string) => void
  setReagentVolumes: (volumes: string[]) => void
  setPipetteTips: (tips: string[]) => void
  setSelectedWells: (wells: string[]) => void
  resetRunData: () => void
}

const initialRunData: RunData = {
  protocolType: "",
  sampleType: "",
  runId: "",
  operatorName: "",
  numberOfSamples: "",
  reagentVolumes: ["-", "-", "-"],
  pipetteTips: ["-", "-"],
  selectedWells: [],
}

export const useRunStore = create<RunStore>((set) => ({
  currentPage: "dashboard",
  runData: initialRunData,
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
}))
