import { PropsWithChildren } from 'react'

export const SectionTitle = (props: PropsWithChildren) => {
  return <div className="section-title">{props.children}</div>
}
