import * as Adapter from '../pa2/adapter'
import { useDspState } from '../pa2/hooks'
import { GainInput } from './common/Inputs'

type Generator = 'Off' | 'Pink' | 'White'

export const SignalGenerator = () => {
  const [generator, setGenerator] = useDspState<Generator>(['Preset', 'SignalGenerator', 'SV', 'Signal Generator'])
  const [amplitude, setAmplitude] = useDspState(['Preset', 'SignalGenerator', 'SV', 'Signal Amplitude'], Adapter.Decibel)

  return (
    <>
      <label className="key-value">
        Generator
        <select value={generator!} onChange={(event) => setGenerator(event.target.value as Generator)}>
          <option value="Off">Off</option>
          <option value="Pink">Pink</option>
          <option value="White">White</option>
        </select>
      </label>

      <label className="key-value">
        Offset
        <GainInput min={-60} max={0} value={amplitude} onChange={setAmplitude} />
      </label>
    </>
  )
}
