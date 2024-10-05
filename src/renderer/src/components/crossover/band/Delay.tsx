import { Band } from '.'
import { parseDelayString } from '../../../pa2/common'
import { useSubscribe, useSyncedState } from '../../../pa2/hooks'
import { DelayInput } from '../../common/Inputs'

interface Props {
  band: Band
}

export const CrossoverBandDelay = (props: Props) => {
  const [enabled, setEnabled] = useSyncedState([
    'Preset',
    `${props.band.label} Outputs Delay`,
    'SV',
    'Delay'
  ])

  const [amount, setAmount] = useSyncedState([
    'Preset',
    `${props.band.label} Outputs Delay`,
    'SV',
    'Amount'
  ]) // 0.44ms/0.49ft/0.15m

  const maxDelay = useSubscribe(['Preset', `${props.band.label} Outputs Delay`, 'AT', 'MaxDelay']) // 10

  const units = amount.split('/').slice(1)

  return (
    <div className="crossover-band__row delay">
      <label className="delay__active">
        <input
          type="checkbox"
          checked={enabled === 'On'}
          onChange={(e) => setEnabled(e.target.checked ? 'On' : 'Off')}
        />
        Delay
      </label>
      {/*
      <input
        type="range"
        min="0"
        max={maxDelay}
        step="0.01"
        value={parseDelayString(amount)}
        onChange={(e) => setAmount(`${e.target.value}ms`)}
        disabled={enabled === 'Off'}
      /> */}

      <div style={{ display: 'flex' }}>
        <div style={{ opacity: enabled === 'Off' ? 0.5 : 1 }}>
          <DelayInput
            min={0}
            max={+maxDelay}
            value={parseDelayString(amount)}
            onChange={(value) => setAmount(`${value}ms`)}
          />
        </div>

        {/* <div className="delay__units">
          {units.map((unit) => (
            <div key={unit} className="delay__unit">
              {unit}
            </div>
          ))}
        </div> */}
      </div>

      {/* <pre>{amount}</pre> */}
    </div>
  )
}
