import { useSubscribe } from '../../pa2/hooks'
import { Band } from './band'

export const useCrossoverBands = () => {
  const numBands = useSubscribe(['Preset', 'Crossover', 'AT', 'NumBands'])
  const monoSub = useSubscribe(['Preset', 'Crossover', 'AT', 'MonoSub'])

  const bands = getCrossoverBands(+numBands, monoSub === '0' ? false : true)
  return bands
}

const getCrossoverBands = (numBands: number, monoSub: boolean): Band[] => {
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
