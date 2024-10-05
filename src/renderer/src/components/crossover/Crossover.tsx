import { useEffect, useMemo } from 'react'
import { parseFrequencyString } from '../../pa2/common'
import { useSyncedState } from '../../pa2/hooks'
import { Meter } from '../Meter'
import { PEQ } from '../PEQ/PEQ'
import { BW12Filter, BW24Filter, LR12Filter, LR24Filter } from '../PEQ/core/filters/crossover'
import { usePEQ } from '../PEQ/peq.context'
import { FrequencyInput } from '../common/Inputs'
import { Lane } from '../common/Lane'
import { LaneItem } from '../common/LaneItem'
import { SectionTitle } from '../common/SectionTitle'
import { Band } from './band'
import { CrossoverBandDelay } from './band/Delay'
import { CrossoverBandGain } from './band/Gain'
import { CrossoverBandLimiter } from './band/Limiter'
import { CrossoverBandMute } from './band/Mute'
import { CrossoverBandPolarity } from './band/Polarity'
import { useCrossoverBands } from './useCrossoverBands'

interface CrossoverProps {
  band: Band
}

const useFilter = (type: string, frequency: string) => {
  const filter = useMemo(() => {
    if (frequency === 'Out') {
      return null
    }

    const frequencyValue = parseFrequencyString(frequency)

    if (frequencyValue === null) {
      return null
    }

    if (type === 'LR 12') {
      return new LR12Filter({
        frequency: frequencyValue,
        gain: 0,
        sampleRate: 48000
      })
    }

    if (type === 'LR 24') {
      return new LR24Filter({
        frequency: frequencyValue,
        gain: 0,
        sampleRate: 48000
      })
    }

    if (type === 'BW 12') {
      return new BW12Filter({
        frequency: frequencyValue,
        gain: 0,
        sampleRate: 48000
      })
    }
    if (type === 'BW 24') {
      return new BW24Filter({
        frequency: frequencyValue,
        gain: 0,
        sampleRate: 48000
      })
    }

    return null
  }, [frequency, type])

  return filter
}

interface FilterSelectProps {
  value: string
  onChange: (value: string) => void
}

export const FilterSelect: React.FC<FilterSelectProps> = (props) => {
  return (
    <select
      className="filter-select"
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
    >
      <option value="LR 12">LR 12</option>
      <option value="LR 24">LR 24</option>
      <option value="BW 12">BW 12</option>
      <option value="BW 24">BW 24</option>
    </select>
  )
}

const CrossoverLPF = (props: CrossoverProps) => {
  const peq = usePEQ()

  const [frequency, setFrequency] = useSyncedState([
    'Preset',
    'Crossover',
    'SV',
    `${props.band.id}_LPFrequency`
  ])

  const [type, setType] = useSyncedState(['Preset', 'Crossover', 'SV', `${props.band.id}_LPType`])
  const filter = useFilter(type, frequency)

  useEffect(() => {
    if (!filter || frequency === 'Out') {
      return
    }

    peq.actions.setLPF(filter)

    return () => {
      peq.actions.setLPF(null)
    }
  }, [peq.actions.setLPF, filter])

  return (
    <div className="crossover-band__filter crossover-band__filter--lpf">
      <div>
        {frequency !== 'Out' && (
          <FrequencyInput
            value={parseFrequencyString(frequency)}
            onChange={(value) => setFrequency(value.toString())}
          />
        )}

        <FilterSelect value={type} onChange={(value) => setType(value)} />
      </div>

      {frequency === 'Out' && (
        <input
          type="checkbox"
          checked={frequency !== 'Out'}
          onChange={(event) => setFrequency(event.target.checked ? '20kHz' : '24kHz')}
        />
      )}
    </div>
  )
}

const CrossoverHPF = (props: CrossoverProps) => {
  const peq = usePEQ()

  const [frequency, setFrequency] = useSyncedState([
    'Preset',
    'Crossover',
    'SV',
    `${props.band.id}_HPFrequency`
  ])
  const [type, setType] = useSyncedState(['Preset', 'Crossover', 'SV', `${props.band.id}_HPType`])

  const filter = useFilter(type, frequency)
  // out 16Hz  20kHz Out
  useEffect(() => {
    if (!filter || frequency === 'Out') {
      return
    }

    peq.actions.setHPF(filter)

    return () => {
      peq.actions.setHPF(null)
    }
  }, [peq.actions.setHPF, filter])

  return (
    <div className="crossover-band__filter crossover-band__filter--hpf">
      <div>
        {frequency !== 'Out' && (
          <FrequencyInput
            value={parseFrequencyString(frequency)}
            onChange={(value) => setFrequency(value.toString())}
          />
        )}

        <FilterSelect value={type} onChange={(value) => setType(value)} />
      </div>

      {frequency === 'Out' && (
        <input
          type="checkbox"
          checked={frequency !== 'Out'}
          onChange={(event) => setFrequency(event.target.checked ? '16Hz' : '10Hz')}
        />
      )}
    </div>
  )
}

const CrossoverBand = (props: CrossoverProps) => {
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
                <Meter path={['Preset', 'OutputMeters', 'SV', `${props.band.label}LeftOutput`]}>
                  {/* L */}
                </Meter>

                <Meter path={['Preset', 'OutputMeters', 'SV', `${props.band.label}RightOutput`]}>
                  {/* R */}
                </Meter>
              </div>

              <CrossoverBandMute band={props.band} />
            </div>
          </LaneItem>
        </Lane>
      </div>
    </div>
  )
}

export const Crossover: React.FC = () => {
  const bands = useCrossoverBands()

  return (
    <div className="crossover">
      <SectionTitle>Crossover</SectionTitle>

      {bands?.map((band) => <CrossoverBand key={band.id} band={band} />)}
    </div>
  )
}
