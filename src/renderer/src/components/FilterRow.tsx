import { useEffect } from 'react'
import * as Adapter from '../pa2/adapter'
import { useDspState } from '../pa2/hooks'
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

  const [frequency, setFrequency] = useDspState([...props.path, `${props.bandName}_Frequency`], Adapter.Frequency)
  const [gain, setGain] = useDspState([...props.path, `${props.bandName}_Gain`], Adapter.Decibel)
  const [q, setQ] = useDspState([...props.path, `${props.bandName}_Q`], Adapter.Number)
  const [slope, setSlope] = useDspState([...props.path, `${props.bandName}_Slope`], Adapter.Number)
  const [type, setType] = useDspState([...props.path, `${props.bandName}_Type`])

  useEffect(() => {
    const filterNumber = getFilterIndex(props.bandName)

    if (type === null || frequency === null || gain === null || q === null || slope === null) {
      return
    }

    const filter = createFilter(type, frequency, gain, q, slope)

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
        setFrequency(event.frequency)
        setGain(event.gain)

        if (event.q !== undefined) {
          setQ(event.q)
        }

        if (event.slope !== undefined) {
          setSlope(event.slope)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [peq.events, filter, props.bandName])

  const filterIndex = getFilterIndex(props.bandName)
  const active = Math.abs(gain ?? 0) > MIN_ABS_GAIN

  return (
    <>
      <div className="peq-band" data-filter-index={filterIndex} data-active={active}>
        <select value={type!} onChange={(event) => setType(event.target.value)}>
          <option value="Bell">Bell</option>
          <option value="Low Shelf">LS</option>
          <option value="High Shelf">HS</option>
        </select>

        <FrequencyInput value={frequency} onChange={setFrequency} />
        <GainInput value={gain} onChange={setGain} />

        {type === 'Bell' && <QInput value={q} onChange={setQ} />}
        {(type === 'Low Shelf' || type === 'High Shelf') && <SlopeInput value={slope} onChange={setSlope} />}
      </div>
    </>
  )
}
