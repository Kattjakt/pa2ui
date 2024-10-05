import { Panner } from './Panner'

interface Props {
  value: number | null
  onChange: (value: number) => void
  min?: number
  max?: number
}

export const FrequencyInput = (props: Props) => {
  return (
    <label className="field field--large">
      <Panner
        className="field__input"
        strategy="logarithmic"
        step={1}
        min={props.min ?? 10}
        max={props.max ?? 48000 / 2}
        value={props.value}
        onChange={(event) => props.onChange(event)}
      />

      <span className="field__unit">Hz</span>
    </label>
  )
}

export const GainInput = (props: Props) => {
  return (
    <div className="field">
      <Panner
        className="field__input"
        strategy="linear"
        step={0.1}
        min={props.min ?? -15}
        max={props.max ?? 15}
        value={props.value}
        onChange={(event) => props.onChange(event)}
      />

      <span className="field__unit">dB</span>
    </div>
  )
}

export const QInput = (props: Props) => {
  return (
    <label className="field field--small field--no-unit">
      <Panner
        className="field__input"
        strategy="linear"
        step={0.1}
        min={props.min ?? 0.1}
        max={props.max ?? 16}
        value={props.value}
        onChange={(event) => props.onChange(event)}
      />
    </label>
  )
}

export const SlopeInput = (props: Props) => {
  return (
    <label className="field field--small field--no-unit">
      <Panner
        className="field__input"
        strategy="linear"
        step={0.1}
        min={props.min ?? 3}
        max={props.max ?? 15}
        value={props.value}
        onChange={(event) => props.onChange(event)}
      />
    </label>
  )
}

export const DelayInput = (props: Props) => {
  return (
    <label className="field">
      <Panner
        className="field__input"
        strategy="linear"
        step={0.01}
        min={props.min ?? 0}
        max={props.max ?? 100}
        value={props.value}
        onChange={(event) => props.onChange(event)}
      />

      <span className="field__unit">ms</span>
    </label>
  )
}

export const PercentageInput = (props: Props) => {
  return (
    <label className="field">
      <Panner
        className="field__input"
        strategy="linear"
        step={1}
        min={props.min ?? 0}
        max={props.max ?? 100}
        value={props.value}
        onChange={(event) => props.onChange(event)}
      />

      <span className="field__unit">%</span>
    </label>
  )
}
