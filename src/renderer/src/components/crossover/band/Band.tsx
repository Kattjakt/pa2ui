import { useEffect, useMemo } from 'react'
import * as Adapter from '../../../pa2/adapter'
import { useDspState } from '../../../pa2/hooks'
import { Meter } from '../../Meter'
import { PEQ } from '../../PEQ/PEQ'
import { Butterworth, LinkwitzRiley } from '../../PEQ/core/filter'
import { usePEQ } from '../../PEQ/peq.context'
import { FrequencyInput } from '../../common/Inputs'
import { Lane } from '../../common/Lane'
import { LaneItem } from '../../common/LaneItem'
import { Band } from '../useCrossoverBands'
import { CrossoverBandDelay } from './Delay'
import { CrossoverBandGain } from './Gain'
import { CrossoverBandLimiter } from './Limiter'
import { CrossoverBandMute } from './Mute'
import { CrossoverBandPolarity } from './Polarity'

interface CrossoverProps {
  band: Band
}

const filters = ['BW 6', 'BW 12', 'BW 18', 'BW 24', 'BW 30', 'BW 36', 'BW 42', 'BW 48', 'LR 12', 'LR 24', 'LR 36', 'LR 48'] as const

type FilterType = (typeof filters)[number]

const useFilter = (kind: 'lowpass' | 'highpass', type: FilterType | null, frequency: number | null): LinkwitzRiley | Butterworth | null => {
  const filter = useMemo(() => {
    if (frequency === null || type === null) {
      return null
    }

    const [name, dbPerOctave] = type.split(' ') as ['LR' | 'BW', number]
    const order = Math.round(dbPerOctave / 3)

    if (name === 'BW') {
      return new Butterworth(kind, order, frequency)
    }

    if (name === 'LR') {
      return new LinkwitzRiley(kind, order, frequency)
    }

    return null
  }, [kind, frequency, type])

  return filter
}

interface FilterSelectProps {
  value: FilterType
  onChange: (value: FilterType) => void
}

const FilterSelect: React.FC<FilterSelectProps> = (props) => {
  return (
    <select className="filter-select" value={props.value} onChange={(event) => props.onChange(event.target.value as FilterType)}>
      {filters.map((filter) => (
        <option key={filter} value={filter}>
          {filter}
        </option>
      ))}
    </select>
  )
}

const CrossoverLPF = (props: CrossoverProps) => {
  const peq = usePEQ()
  const [frequency, setFrequency] = useDspState(['Preset', 'Crossover', 'SV', `${props.band.id}_LPFrequency`], Adapter.Frequency)
  const [type, setType] = useDspState<FilterType>(['Preset', 'Crossover', 'SV', `${props.band.id}_LPType`])
  const filter = useFilter('lowpass', type, frequency)

  useEffect(() => {
    if (!filter || frequency === null) {
      return
    }

    peq.actions.setLPF(filter)

    return () => {
      peq.actions.setLPF(null)
    }
  }, [peq.actions.setLPF, filter])

  if (!type) {
    return null
  }

  return (
    <div className="crossover-band__filter crossover-band__filter--lpf">
      <div>
        {typeof frequency === 'number' && <FrequencyInput value={frequency} onChange={setFrequency} />}

        <FilterSelect value={type} onChange={(value) => setType(value)} />
      </div>

      {frequency === null && ( // OUT
        <input type="checkbox" checked={frequency !== null} onChange={(event) => setFrequency(event.target.checked ? 20000 : 24000)} />
      )}
    </div>
  )
}

const CrossoverHPF = (props: CrossoverProps) => {
  const peq = usePEQ()
  const [frequency, setFrequency] = useDspState(['Preset', 'Crossover', 'SV', `${props.band.id}_HPFrequency`], Adapter.Frequency)
  const [type, setType] = useDspState<FilterType>(['Preset', 'Crossover', 'SV', `${props.band.id}_HPType`])
  const filter = useFilter('highpass', type, frequency)

  useEffect(() => {
    if (!filter || frequency === null) {
      return
    }

    peq.actions.setHPF(filter)

    return () => {
      peq.actions.setHPF(null)
    }
  }, [peq.actions.setHPF, filter])

  if (!type) {
    return null
  }
  return (
    <div className="crossover-band__filter crossover-band__filter--hpf">
      <div>
        {frequency !== null && <FrequencyInput value={frequency} onChange={setFrequency} />}

        <FilterSelect value={type} onChange={(value) => setType(value)} />
      </div>

      {frequency === null && <input type="checkbox" checked={frequency !== null} onChange={(event) => setFrequency(event.target.checked ? 16 : 10)} />}
    </div>
  )
}

export const CrossoverBand = (props: CrossoverProps) => {
  return (
    <div className="crossover-band" data-crossover-band-label={props.band.label} tabIndex={0}>
      <div className="crossover-band__label">{props.band.label.toUpperCase()}</div>

      <div className="crossover-band__content">
        <Lane>
          <LaneItem>
            <div
              style={{
                display: 'grid',
                gap: '0.5rem 1rem',
                flexDirection: 'column',
                width: 'min-content',
                gridTemplateColumns: 'repeat(1, 1fr)'
              }}
            >
              <div>
                <CrossoverBandGain band={props.band} />
                <CrossoverBandPolarity band={props.band} />
              </div>

              <CrossoverBandDelay band={props.band} />
              <CrossoverBandLimiter band={props.band} />
            </div>
          </LaneItem>

          <LaneItem grow={1}>
            <PEQ path={['Preset', `${props.band.label} Outputs PEQ`, 'SV']}>
              <CrossoverHPF band={props.band} />
              <CrossoverLPF band={props.band} />
            </PEQ>
          </LaneItem>

          <LaneItem>
            <div style={{}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  marginBottom: '0.5rem'
                }}
              >
                <Meter path={['Preset', 'OutputMeters', 'SV', `${props.band.label}LeftOutput`]}>{/* L */}</Meter>
                <Meter path={['Preset', 'OutputMeters', 'SV', `${props.band.label}RightOutput`]}>{/* R */}</Meter>
              </div>

              <CrossoverBandMute band={props.band} />
            </div>
          </LaneItem>
        </Lane>
      </div>
    </div>
  )
}
