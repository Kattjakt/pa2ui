import * as Adapter from '../../../pa2/adapter'
import { useDspState } from '../../../pa2/hooks'
import { Band } from '../useCrossoverBands'

interface CrossoverProps {
  band: Band
}

export const CrossoverBandMute = (props: CrossoverProps) => {
  const [leftMute, setLeftMute] = useDspState(['Preset', 'OutputGains', 'SV', `${props.band.label}LeftOutputMute`], Adapter.Boolean)
  const [rightMute, setRightMute] = useDspState(['Preset', 'OutputGains', 'SV', `${props.band.label}RightOutputMute`], Adapter.Boolean)

  return (
    <div className="mute">
      <button className="mute__button" data-muted={leftMute} onClick={() => setLeftMute(!leftMute)}>
        L
      </button>

      <button className="mute__button" data-muted={rightMute} onClick={() => setRightMute(!rightMute)}>
        R
      </button>

      <button
        className={`mute__button`}
        onClick={() => {
          if (leftMute && rightMute) {
            setLeftMute(false)
            setRightMute(false)
            return
          }

          setLeftMute(true)
          setRightMute(true)
        }}
      >
        Mute
      </button>
    </div>
  )
}
