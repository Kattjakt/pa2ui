import { parsePercentage } from '../pa2/common'
import { useSyncedState } from '../pa2/hooks'
import { PercentageInput } from './common/Inputs'

export const SubharmonicSynth = () => {
  const [enabled, setEnabled] = useSyncedState([
    'Preset',
    'SubharmonicSynth',
    'SV',
    'SubharmonicSynth'
  ])

  const [subharmonics, setSubharmonics] = useSyncedState([
    'Preset',
    'SubharmonicSynth',
    'SV',
    'Subharmonics'
  ])

  const [synthesisLevel_24_36, setSynthesisLevel_24_36] = useSyncedState([
    'Preset',
    'SubharmonicSynth',
    'SV',
    'Synthesis Level 24-36Hz'
  ])

  const [synthesisLevel_36_56, setSynthesisLevel_36_56] = useSyncedState([
    'Preset',
    'SubharmonicSynth',
    'SV',
    'Synthesis Level 36-56Hz'
  ])

  return (
    <fieldset className="subharmonic-synth" data-disabled={enabled !== 'On'}>
      <legend>
        <label>
          <input
            type="checkbox"
            checked={enabled === 'On'}
            onChange={(event) => setEnabled(event.target.checked ? 'On' : 'Off')}
          />
          Subharmonics
        </label>
      </legend>

      <label className="key-value">
        Amount
        <PercentageInput
          value={parsePercentage(subharmonics)}
          onChange={(value) => setSubharmonics(`${value}`)}
        />
      </label>

      <label className="key-value">
        36-56 Hz
        <PercentageInput
          value={parsePercentage(synthesisLevel_36_56)}
          onChange={(value) => setSynthesisLevel_36_56(`${value}%`)}
        />
      </label>

      <label className="key-value">
        24-36 Hz
        <PercentageInput
          value={parsePercentage(synthesisLevel_24_36)}
          onChange={(value) => setSynthesisLevel_24_36(`${value}`)}
        />
      </label>

      {/* <div style={{ display: 'flex', gap: '0.1rem' }}>
          <Meter path={['Preset', 'SubharmonicSynth', 'SV', 'SubSynthLevel']} />
          <Meter path={['Preset', 'SubharmonicSynth', 'SV', 'UpperBandLevel']} />
          <Meter path={['Preset', 'SubharmonicSynth', 'SV', 'LowerBandLevel']} />
        </div> */}
    </fieldset>
  )
}
