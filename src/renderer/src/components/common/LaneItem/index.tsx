import { PropsWithChildren } from 'react'
import './style.scss'

export const LaneItem = (props: PropsWithChildren<{ grow?: number }>) => {
  return (
    <li className="lane-item" style={{ flexGrow: props.grow }}>
      {props.children}
    </li>
  )
}
