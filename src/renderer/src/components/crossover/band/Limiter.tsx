import { Band } from '.'
import { parseGainString } from '../../../pa2/common'
import { useSubscribe, useSyncedState } from '../../../pa2/hooks'
import { GainInput } from '../../common/Inputs'

interface Props {
  band: Band
}

export const CrossoverBandLimiter = (props: Props) => {
  const [enabled, setEnabled] = useSyncedState([
    'Preset',
    `${props.band.label} Outputs Limiter`,
    'SV',
    'Limiter'
  ])

  const [threshold, setThreshold] = useSyncedState([
    'Preset',
    `${props.band.label} Outputs Limiter`,
    'SV',
    'Threshold'
  ])

  const [overeasy, setOvereasy] = useSyncedState([
    'Preset',
    `${props.band.label} Outputs Limiter`,
    'SV',
    'OverEasy'
  ])

  const thresholdMeter = useSubscribe([
    'Preset',
    `${props.band.label} Outputs Limiter`,
    'SV',
    'ThresholdMeter'
  ])

  return (
    <div className="limiter" data-over={thresholdMeter === 'Over'} data-disabled={enabled !== 'On'}>
      <label className="limiter__active">
        <input
          type="checkbox"
          checked={enabled === 'On'}
          onChange={(event) => setEnabled(event.target.checked ? 'On' : 'Off')}
        />
        Limiter
      </label>

      {/* <div className="limiter__meters">
        <Meter path={[...props.path, 'SV', 'GainReductionMeter']} />
        <Meter path={[...props.path, 'SV', 'MaxInputLevel']} />
      </div> */}

      <div className="limiter__controls">
        <label>
          Threshold
          <GainInput
            min={-60}
            max={0}
            value={parseGainString(threshold)}
            onChange={(value) => setThreshold(`${value}dB`)}
          />
        </label>

        <label>
          Overeasy
          <select value={overeasy} onChange={(e) => setOvereasy(e.target.value)}>
            <option value="Off">Off</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </label>
      </div>
    </div>
  )
}
