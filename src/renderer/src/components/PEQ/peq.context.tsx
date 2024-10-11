import { Emitter, createNanoEvents } from 'nanoevents'
import React, { PropsWithChildren, createContext, useCallback, useRef, useState } from 'react'
import { Filter } from './core/filter'

type FilterChangeEvent = {
  index: number
  frequency: number
  gain: number
  q?: number
  slope?: number
}

interface FilterEvents {
  filterChanged: (event: FilterChangeEvent) => void
}

interface PEQContextProps {}

interface PEQContextActions {
  setFocusedFilter: (filter: Filter | null) => void
  setFilter: (index: number, filter: Filter | null) => void
  setLPF: (filter: Filter | null) => void
  setHPF: (filter: Filter | null) => void
}

interface PEQContextState {
  focusedFilter: Filter | null
  lpf: Filter | null
  hpf: Filter | null
  filters: Array<Filter | null>
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

  const [filters, setFilters] = useState<Array<Filter | null>>([])
  const [focusedFilter, setFocusedFilter] = useState<Filter | null>(null)

  const frequencyResponseCanvasRef = useRef<HTMLCanvasElement>(null)

  const [lpf, setLPF] = useState<Filter | null>(null)
  const [hpf, setHPF] = useState<Filter | null>(null)

  const setFilter = useCallback((index: number, filter: Filter | null) => {
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
    decibelRange: 36,
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
