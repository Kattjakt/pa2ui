import { PropsWithChildren } from 'react'
import { useSubscribe } from '../pa2/hooks'

interface MeterProps {
  path: string[]
  horizontal?: boolean
}

export const Meter = (props: PropsWithChildren<MeterProps>) => {
  const value = useSubscribe(props.path)
  const db = parseFloat(value?.slice(0, -2) || '0')

  return (
    <label style={{ display: 'inline-flex', flexDirection: 'column', textAlign: 'center' }}>
      {props.children}
      <meter
        min="-120"
        max="0"
        value={db}
        style={{ writingMode: props.horizontal ? 'sideways-lr' : 'vertical-lr' }}
      ></meter>
    </label>
  )
}

export const Meters: React.FC = () => {
  return (
    <fieldset style={{ display: 'inline-block' }}>
      <legend>Output meters</legend>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center' }}>
          <label>Low</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Meter path={['Preset', 'OutputMeters', 'SV', 'LowLeftOutput']}>L</Meter>
            <Meter path={['Preset', 'OutputMeters', 'SV', 'LowRightOutput']}>R</Meter>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center' }}>
          <label>Mid</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Meter path={['Preset', 'OutputMeters', 'SV', 'MidLeftOutput']}>L</Meter>
            <Meter path={['Preset', 'OutputMeters', 'SV', 'MidRightOutput']}>R</Meter>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center' }}>
          <label>High</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Meter path={['Preset', 'OutputMeters', 'SV', 'HighLeftOutput']}>L</Meter>
            <Meter path={['Preset', 'OutputMeters', 'SV', 'HighRightOutput']}>R</Meter>
          </div>
        </div>
      </div>
    </fieldset>
  )
}
