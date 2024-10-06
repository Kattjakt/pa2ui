import { useMemo } from 'react'
import * as Adapter from '../pa2/adapter'
import { useAsyncGetTimer, useDspState } from '../pa2/hooks'
import { GainInput } from './common/Inputs'

const RTA_CENTER_FREQUENCIES = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500,
  16000, 20000
]

export interface RtaBar {
  frequency: number
  gain: number
}

export const useRtaBars = () => {
  // A normal subscribe doesn't seem to work here...
  // why? no clue :) Let's poll every 100ms instead!
  const meters = useAsyncGetTimer(['Preset', 'RTA', 'SV', 'AllMeters'], 100)

  return useMemo(() => {
    const gains = meters.split(' ').map((gain) => parseFloat(gain))

    return RTA_CENTER_FREQUENCIES.map((frequency, i) => {
      const gain = gains[i]
      const bar: RtaBar = {
        frequency,
        gain
      }

      return bar
    })
  }, [meters])
}

type Rate = 'Slow' | 'Fast'

export const RtaControls = () => {
  const [rate, setRate] = useDspState<Rate>(['Preset', 'RTA', 'SV', 'Rate'])
  const [gain, setGain] = useDspState(['Preset', 'RTA', 'SV', 'Gain'], Adapter.Decibel)

  return (
    <>
      <label className="key-value">
        Rate
        <select value={rate!} onChange={(event) => setRate(event.target.value as Rate)}>
          <option value="Slow">Slow</option>
          <option value="Fast">Fast</option>
        </select>
      </label>

      <label className="key-value">
        Offset
        <GainInput min={0} max={40} value={gain} onChange={setGain} />
      </label>
    </>
  )
}
