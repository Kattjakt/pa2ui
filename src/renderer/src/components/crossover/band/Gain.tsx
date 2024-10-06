import { useDspState } from '../../../pa2/hooks'
import { GainInput } from '../../common/Inputs'

import * as Adapter from '../../../pa2/adapter'
import { Band } from '../useCrossoverBands'

interface Props {
  band: Band
}

export const CrossoverBandGain = (props: Props) => {
  const [gain, setGain] = useDspState(['Preset', 'Crossover', 'SV', `${props.band.id}_Gain`], Adapter.Decibel)

  return (
    <label className="crossover-band__row">
      Gain
      <GainInput value={gain} onChange={setGain} />
    </label>
  )
}
