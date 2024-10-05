import { parseGainString } from '../pa2/common'
import { useSyncedState } from '../pa2/hooks'
import { GainInput } from './common/Inputs'

// "Compressor": "Off",
// "More": "50%",
// "Threshold": "-16.0dB",
// "Ratio": "1.4:1",
// "Gain": "0.0dB",
// "OverEasy": "Off",
// "ThresholdMeter": "Under",
// "GainReductionMeter": "0.0dB",
// "MaxInputLevel": "0.0dB",
// "CompressorType": "dbx 1066",

export const Compressor = () => {
  const [enabled, setEnabled] = useSyncedState(['Preset', 'Compressor', 'SV', 'Compressor'])
  const [more, setMore] = useSyncedState(['Preset', 'Compressor', 'SV', 'More'])
  const [threshold, setThreshold] = useSyncedState(['Preset', 'Compressor', 'SV', 'Threshold'])
  const [ratio, setRatio] = useSyncedState(['Preset', 'Compressor', 'SV', 'Ratio'])
  const [gain, setGain] = useSyncedState(['Preset', 'Compressor', 'SV', 'Gain'])
  const [overeasy, setOvereasy] = useSyncedState(['Preset', 'Compressor', 'SV', 'OverEasy'])

  // const thresholdMeter = useSubscribe(['Preset', 'Compressor', 'SV', 'ThresholdMeter'])
  // const gainReductionMeter = useSubscribe(['Preset', 'Compressor', 'SV', 'GainReductionMeter'])
  // const maxInputLevel = useSubscribe(['Preset', 'Compressor', 'SV', 'MaxInputLevel'])
  // const [compressorType, setCompressorType] = useSyncedState([
  //   'Preset',
  //   'Compressor',
  //   'SV',
  //   'Compressor Type'
  // ])

  return (
    <fieldset className="compressor" data-disabled={enabled !== 'On'}>
      <legend>
        <label>
          <input
            type="checkbox"
            checked={enabled === 'On'}
            onChange={(event) => setEnabled(event.target.checked ? 'On' : 'Off')}
          />
          Compressor
        </label>
      </legend>

      <label className="key-value">
        Threshold
        <GainInput
          min={-60}
          max={0}
          value={parseGainString(threshold)}
          onChange={(value) => setThreshold(`${value}`)}
        />
      </label>

      <label className="key-value">
        Gain
        <GainInput
          min={-20}
          max={20}
          value={parseGainString(gain)}
          onChange={(value) => setGain(`${value}`)}
        />
      </label>

      <label className="key-value">
        Ratio
        <select value={ratio} onChange={(event) => setRatio(event.target.value)}>
          <option value="1:1">1:1</option>
          <option value="1.1:1">1.1:1</option>
          <option value="1.2:1">1.2:1</option>
          <option value="1.3:1">1.3:1</option>
          <option value="1.4:1">1.4:1</option>
          <option value="1.5:1">1.5:1</option>
          <option value="1.6:1">1.6:1</option>
          <option value="1.7:1">1.7:1</option>
          <option value="1.8:1">1.8:1</option>
          <option value="1.9:1">1.9:1</option>
          <option value="2:1">2:1</option>
          <option value="2.2:1">2.2:1</option>
          <option value="2.4:1">2.4:1</option>
          <option value="2.6:1">2.6:1</option>
          <option value="2.8:1">2.8:1</option>
          <option value="3:1">3:1</option>
          <option value="3.2:1">3.2:1</option>
          <option value="3.4:1">3.4:1</option>
          <option value="3.6:1">3.6:1</option>
          <option value="3.8:1">3.8:1</option>
          <option value="4:1">4:1</option>
          <option value="5:1">5:1</option>
          <option value="6:1">6:1</option>
          <option value="7:1">7:1</option>
          <option value="8:1">8:1</option>
          <option value="9:1">9:1</option>
          <option value="10:1">10:1</option>
          <option value="11:1">11:1</option>
          <option value="12:1">12:1</option>
          <option value="13:1">13:1</option>
          <option value="14:1">14:1</option>
          <option value="15:1">15:1</option>
          <option value="20:1">20:1</option>
          <option value="25:1">25:1</option>
          <option value="30:1">30:1</option>
          <option value="35:1">35:1</option>
          <option value="40:1">40:1</option>
          <option value="Inf:1">Inf:1</option>
        </select>
      </label>

      <label className="key-value">
        OverEasy
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
    </fieldset>
  )
}
