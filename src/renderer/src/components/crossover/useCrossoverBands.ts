import * as Adapter from '../../pa2/adapter'
import { useDspState } from '../../pa2/hooks'

export interface Band {
  label: 'High' | 'Mid' | 'Low'
  id: string
}

export const useCrossoverBands = () => {
  const [numBands] = useDspState(['Preset', 'Crossover', 'AT', 'NumBands'], Adapter.Number)
  const [monoSub] = useDspState(['Preset', 'Crossover', 'AT', 'MonoSub'], Adapter.Number)

  return getCrossoverBands(numBands, monoSub)
}

const getCrossoverBands = (numBands: number | null, monoSub: number | null): Band[] => {
  if (numBands === null || monoSub === null) {
    return []
  }

  if (numBands === 1) {
    return [{ label: 'High', id: 'Band_1' }]
  }

  if (numBands === 2) {
    if (monoSub) {
      return [
        { label: 'High', id: 'Band_1' },
        { label: 'Mid', id: 'Band_2' },
        { label: 'Low', id: 'MonoSub' }
      ]
    }

    return [
      { label: 'High', id: 'Band_1' },
      { label: 'Low', id: 'Band_2' }
    ]
  }

  if (numBands === 3) {
    return [
      { label: 'High', id: 'Band_1' },
      { label: 'Mid', id: 'Band_2' },
      { label: 'Low', id: 'Band_3' }
    ]
  }

  return []
}
