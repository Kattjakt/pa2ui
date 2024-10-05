import { useMemo } from 'react'
import { parseGainString } from '../pa2/common'
import { useAsyncGetTimer, useSyncedState } from '../pa2/hooks'
import { GainInput } from './common/Inputs'

const RTA_CENTER_FREQUENCIES = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600,
  2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000
]

export interface RtaBar {
  frequency: number
  gain: number
}

export const useRtaBars = () => {
  const meters = useAsyncGetTimer(['Preset', 'RTA', 'SV', 'AllMeters'], 100)
  // const meters = useSubscribe(['Preset', 'RTA', 'SV', 'AllMeters'])

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

export const RtaControls = () => {
  const [rate, setRate] = useSyncedState(['Preset', 'RTA', 'SV', 'Rate'])
  const [gain, setGain] = useSyncedState(['Preset', 'RTA', 'SV', 'Gain'])

  return (
    <>
      <label className="key-value">
        Rate
        <select value={rate} onChange={(event) => setRate(event.target.value)}>
          <option value="Slow">Slow</option>
          <option value="Fast">Fast</option>
        </select>
      </label>

      <label className="key-value">
        Offset
        <GainInput
          min={0}
          max={40}
          value={parseGainString(gain)}
          onChange={(event) => setGain(`${event}`)}
        />
      </label>
    </>
  )
}
