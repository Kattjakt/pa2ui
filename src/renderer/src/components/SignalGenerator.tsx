import { parseGainString } from '../pa2/common'
import { useSyncedState } from '../pa2/hooks'
import { GainInput } from './common/Inputs'

export const SignalGenerator = () => {
  const [generator, setGenerator] = useSyncedState([
    'Preset',
    'SignalGenerator',
    'SV',
    'Signal Generator'
  ])

  const [amplitude, setAmplitude] = useSyncedState([
    'Preset',
    'SignalGenerator',
    'SV',
    'Signal Amplitude'
  ])

  return (
    <>
      <label className="key-value">
        Generator
        <select value={generator} onChange={(event) => setGenerator(event.target.value)}>
          <option value="Off">Off</option>
          <option value="Pink">Pink</option>
          <option value="White">White</option>
        </select>
      </label>

      <label className="key-value">
        Offset
        <GainInput
          min={-60}
          max={0}
          value={parseGainString(amplitude)!}
          onChange={(event) => setAmplitude(`${event}`)}
        />
      </label>
    </>
  )
}
