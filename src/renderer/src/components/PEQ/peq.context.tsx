import { Emitter, createNanoEvents } from 'nanoevents'
import React, { PropsWithChildren, createContext, useCallback, useRef, useState } from 'react'
import { FilterEvents } from './core/events'
import { BaseFilter } from './core/filters'
import { CrossoverFilter } from './core/filters/crossover'

interface PEQContextProps {}

interface PEQContextActions {
  setFocusedFilter: (filter: BaseFilter | null) => void
  setFilter: (index: number, filter: BaseFilter | null) => void
  setLPF: (filter: CrossoverFilter | null) => void
  setHPF: (filter: CrossoverFilter | null) => void
}

interface PEQContextState {
  focusedFilter: BaseFilter | null
  lpf: CrossoverFilter | null
  hpf: CrossoverFilter | null
  filters: Array<BaseFilter | null>
  dragging?: never
  sampleRate: number
  decibelRange: number
  frequencyBounds?: [number, number]
  frequencyResponseCanvasRef: React.RefObject<HTMLCanvasElement>
  events: Emitter<FilterEvents>
  actions: PEQContextActions
}

export const PEQContext = createContext<PEQContextState | undefined>(undefined)

export const PEQProvider: React.FC<PropsWithChildren<PEQContextProps>> = ({ children }) => {
  const [emitter] = useState(() => createNanoEvents<FilterEvents>()) // yuck :(
  const { current: events } = useRef(emitter) // YUCK

  const [filters, setFilters] = useState<Array<BaseFilter | null>>([])
  const [focusedFilter, setFocusedFilter] = useState<BaseFilter | null>(null)

  const frequencyResponseCanvasRef = useRef<HTMLCanvasElement>(null)

  const [lpf, setLPF] = useState<CrossoverFilter | null>(null)
  const [hpf, setHPF] = useState<CrossoverFilter | null>(null)

  const setFilter = useCallback((index: number, filter: BaseFilter | null) => {
    setFilters((prevFilters) => {
      const newFilters = [...prevFilters]
      newFilters[index] = filter
      return newFilters
    })
  }, [])

  const peqContextValues: PEQContextState = {
    filters,
    lpf,
    hpf,
    focusedFilter,
    decibelRange: 40,
    sampleRate: 48000,
    frequencyResponseCanvasRef,
    events,
    actions: {
      setFocusedFilter,
      setFilter,
      setLPF,
      setHPF
    }
  }

  return <PEQContext.Provider value={peqContextValues}>{children}</PEQContext.Provider>
}

export const usePEQ = () => {
  const context = React.useContext(PEQContext)

  if (context === undefined) {
    throw new Error('usePEQ must be used within a PEQProvider')
  }

  return context
}

export const usePEQFilter = (index: number) => {
  const { filters } = usePEQ()

  return filters[index]
}
