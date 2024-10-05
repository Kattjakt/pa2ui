import { Band } from '.'
import { parseGainString } from '../../../pa2/common'
import { useSyncedState } from '../../../pa2/hooks'
import { GainInput } from '../../common/Inputs'

interface Props {
  band: Band
}

export const CrossoverBandGain = (props: Props) => {
  const [gain, setGain] = useSyncedState(['Preset', 'Crossover', 'SV', `${props.band.id}_Gain`])

  return (
    <label className="crossover-band__row">
      Gain
      <GainInput value={parseGainString(gain)} onChange={(value) => setGain(`${value}`)} />
    </label>
  )
}
