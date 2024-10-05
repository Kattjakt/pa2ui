import { useEffect } from 'react'
import { parseFrequencyString, parseGainString } from '../pa2/common'
import { useSyncedState } from '../pa2/hooks'
import { FrequencyInput, GainInput, QInput, SlopeInput } from './common/Inputs'
import { HighShelfFilter } from './PEQ/core/filters/high-shelf'
import { LowShelfFilter } from './PEQ/core/filters/low-shelf'
import { NotchFilter } from './PEQ/core/filters/notch'
import { usePEQ, usePEQFilter } from './PEQ/peq.context'

// Minimum gain for a band
// to be considered active.
const MIN_ABS_GAIN = 0

const getFilterIndex = (bandName: string) => parseInt(bandName.split('_')[1]) - 1

interface BandProps {
  path: string[]
  bandName: string
}

const createFilter = (type: string, frequency: number, gain: number, q: number, slope: number) => {
  switch (type) {
    case 'Bell':
      return new NotchFilter({
        frequency,
        Q: q,
        gain,
        sampleRate: 48000
      })
    case 'Low Shelf':
      return new LowShelfFilter({
        frequency,
        slope,
        gain,
        sampleRate: 48000
      })
    case 'High Shelf':
      return new HighShelfFilter({
        frequency,
        slope,
        gain,
        sampleRate: 48000
      })
  }

  return null
}

export const FilterRow: React.FC<BandProps> = (props) => {
  const peq = usePEQ()
  const filter = usePEQFilter(getFilterIndex(props.bandName))

  const [frequency, setFrequency] = useSyncedState([...props.path, `${props.bandName}_Frequency`])
  const [gain, setGain] = useSyncedState([...props.path, `${props.bandName}_Gain`])
  const [q, setQ] = useSyncedState([...props.path, `${props.bandName}_Q`])
  const [slope, setSlope] = useSyncedState([...props.path, `${props.bandName}_Slope`])
  const [type, setType] = useSyncedState([...props.path, `${props.bandName}_Type`])

  useEffect(() => {
    const filterNumber = getFilterIndex(props.bandName)
    const frequencyValue = parseFrequencyString(frequency)
    const gainValue = parseGainString(gain)
    const qValue = parseFloat(q)
    const slopeValue = parseFloat(slope)

    if (frequencyValue === null || gainValue === null || qValue === null || slopeValue === null) {
      return
    }

    const filter = createFilter(type, frequencyValue, gainValue, qValue, slopeValue)

    if (!filter) {
      return
    }

    peq.actions.setFilter(filterNumber, filter)

    return () => {
      peq.actions.setFilter(filterNumber, null)
    }
  }, [peq.actions.setFilter, frequency, gain, q, slope, type])

  useEffect(() => {
    const unsubscribe = peq.events.on('filterChanged', (event) => {
      if (event.index === getFilterIndex(props.bandName)) {
        setFrequency(event.frequency.toString())
        setGain(event.gain.toString())

        if (event.q !== undefined) {
          setQ(event.q.toString())
        }

        if (event.slope !== undefined) {
          setSlope(event.slope.toString())
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [peq.events, filter, props.bandName])

  const filterIndex = getFilterIndex(props.bandName)
  const active = Math.abs(parseGainString(gain) ?? 0) > MIN_ABS_GAIN

  return (
    <>
      <div className="peq-band" data-filter-index={filterIndex} data-active={active}>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="Bell">Bell</option>
          <option value="Low Shelf">LS</option>
          <option value="High Shelf">HS</option>
        </select>

        {/* <input type="text" value={frequency} /> */}

        <FrequencyInput
          value={parseFrequencyString(frequency)}
          onChange={(frequency) => setFrequency(`${frequency}`)}
        />

        <GainInput value={parseGainString(gain)} onChange={(gain) => setGain(`${gain}`)} />

        {type === 'Bell' && <QInput value={parseFloat(q)} onChange={(q) => setQ(`${q}`)} />}

        {(type === 'Low Shelf' || type === 'High Shelf') && (
          <SlopeInput value={parseFloat(slope)} onChange={(slope) => setSlope(`${slope}`)} />
        )}
      </div>
    </>
  )
}
