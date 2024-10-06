import { PropsWithChildren } from 'react'
import * as Adapter from '../pa2/adapter'
import { useDspState } from '../pa2/hooks'

interface MeterProps {
  path: string[]
  horizontal?: boolean
}

export const Meter = (props: PropsWithChildren<MeterProps>) => {
  const [decibels] = useDspState(props.path, Adapter.Decibel)

  return (
    <label style={{ display: 'inline-flex', flexDirection: 'column', textAlign: 'center' }}>
      {props.children}
      <meter min="-120" max="0" value={decibels!} style={{ writingMode: props.horizontal ? 'sideways-lr' : 'vertical-lr' }}></meter>
    </label>
  )
}
