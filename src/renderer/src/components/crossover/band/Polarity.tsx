import { useDspState } from '../../../pa2/hooks'
import { Band } from '../useCrossoverBands'

interface Props {
  band: Band
}

export const CrossoverBandPolarity = (props: Props) => {
  const [polarity, setPolarity] = useDspState(['Preset', 'Crossover', 'SV', `${props.band.id}_Polarity`])

  return (
    <label className="crossover-band__row">
      Polarity
      <select value={polarity!} onChange={(event) => setPolarity(event.target.value)}>
        <option value="Normal">Normal</option>
        <option value="Inverted">Inverted</option>
      </select>
    </label>
  )
}
