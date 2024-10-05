import { Band } from '.'
import { useSyncedState } from '../../../pa2/hooks'

interface Props {
  band: Band
}

export const CrossoverBandPolarity = (props: Props) => {
  const [polarity, setPolarity] = useSyncedState([
    'Preset',
    'Crossover',
    'SV',
    `${props.band.id}_Polarity`
  ])

  return (
    <label className="crossover-band__row">
      Polarity
      <select value={polarity} onChange={(event) => setPolarity(event.target.value)}>
        <option value="Normal">Normal</option>
        <option value="Inverted">Inverted</option>
      </select>
    </label>
  )
}
