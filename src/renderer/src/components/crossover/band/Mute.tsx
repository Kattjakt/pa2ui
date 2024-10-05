import { Band } from '.'
import { useSyncedState } from '../../../pa2/hooks'

interface CrossoverProps {
  band: Band
}

// Feel like this should probable be per-channel
export const CrossoverBandMute = (props: CrossoverProps) => {
  const [leftMute, setLeftMute] = useSyncedState([
    'Preset',
    'OutputGains',
    'SV',
    `${props.band.label}LeftOutputMute`
  ])

  const [rightMute, setRightMute] = useSyncedState([
    'Preset',
    'OutputGains',
    'SV',
    `${props.band.label}RightOutputMute`
  ])

  const onBothMute = () => {
    if (leftMute === 'On' && rightMute === 'On') {
      setRightMute('Off')
    }

    return 'Off'
  }

  return (
    <div className="mute">
      <button
        className="mute__button"
        data-muted={leftMute === 'On'}
        onClick={() => setLeftMute(leftMute === 'On' ? 'Off' : 'On')}
      >
        L
      </button>

      <button
        className="mute__button"
        data-muted={rightMute === 'On'}
        onClick={() => setRightMute(rightMute === 'On' ? 'Off' : 'On')}
      >
        R
      </button>

      <button
        className={`mute__button`}
        onClick={() => {
          if (leftMute === 'On' && rightMute === 'On') {
            setLeftMute('Off')
            setRightMute('Off')
            return
          }

          setLeftMute('On')
          setRightMute('On')
        }}
      >
        Mute
      </button>
    </div>
  )
}
