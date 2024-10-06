import { useDspState } from '../../../pa2/hooks'
import { DelayInput } from '../../common/Inputs'

import * as Adapter from '../../../pa2/adapter'
import { Band } from '../useCrossoverBands'

interface Props {
  band: Band
}

export const CrossoverBandDelay = (props: Props) => {
  const [enabled, setEnabled] = useDspState(['Preset', `${props.band.label} Outputs Delay`, 'SV', 'Delay'], Adapter.Boolean)
  const [amount, setAmount] = useDspState(['Preset', `${props.band.label} Outputs Delay`, 'SV', 'Amount'], Adapter.Delay)
  const [maxDelay] = useDspState(['Preset', `${props.band.label} Outputs Delay`, 'AT', 'MaxDelay'], Adapter.Number)

  return (
    <div className="crossover-band__row delay">
      <label className="delay__active">
        <input type="checkbox" checked={!!enabled} onChange={(e) => setEnabled(e.target.checked)} />
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
        <div style={{ opacity: enabled ? 1 : 0.5 }}>
          <DelayInput min={0} max={maxDelay ?? undefined} value={amount} onChange={setAmount} />
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
