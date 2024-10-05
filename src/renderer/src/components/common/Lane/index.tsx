import { PropsWithChildren } from 'react'
import './style.scss'

export const Lane = (props: PropsWithChildren<{}>) => {
  return <ul className="lane">{props.children}</ul>
}
