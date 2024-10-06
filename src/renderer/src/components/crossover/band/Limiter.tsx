import * as Adapter from '../../../pa2/adapter'
import { useDspState } from '../../../pa2/hooks'
import { GainInput } from '../../common/Inputs'
import { Band } from '../useCrossoverBands'

interface Props {
  band: Band
}

export const CrossoverBandLimiter = (props: Props) => {
  const [enabled, setEnabled] = useDspState(['Preset', `${props.band.label} Outputs Limiter`, 'SV', 'Limiter'], Adapter.Boolean)
  const [threshold, setThreshold] = useDspState(['Preset', `${props.band.label} Outputs Limiter`, 'SV', 'Threshold'], Adapter.Decibel)
  const [overeasy, setOvereasy] = useDspState(['Preset', `${props.band.label} Outputs Limiter`, 'SV', 'OverEasy'])
  const [thresholdMeter] = useDspState(['Preset', `${props.band.label} Outputs Limiter`, 'SV', 'ThresholdMeter'])

  return (
    <div className="limiter" data-over={thresholdMeter === 'Over'} data-disabled={!enabled}>
      <label className="limiter__active">
        <input type="checkbox" checked={!!enabled} onChange={(event) => setEnabled(event.target.checked)} />
        Limiter
      </label>

      {/* <div className="limiter__meters">
        <Meter path={[...props.path, 'SV', 'GainReductionMeter']} />
        <Meter path={[...props.path, 'SV', 'MaxInputLevel']} />
      </div> */}

      <div className="limiter__controls">
        <label>
          Threshold
          <GainInput min={-60} max={0} value={threshold} onChange={setThreshold} />
        </label>

        <label>
          Overeasy
          <select value={overeasy!} onChange={(e) => setOvereasy(e.target.value)}>
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
