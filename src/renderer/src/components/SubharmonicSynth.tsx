import * as Adapter from '../pa2/adapter'
import { useDspState } from '../pa2/hooks'
import { PercentageInput } from './common/Inputs'

export const SubharmonicSynth = () => {
  const [enabled, setEnabled] = useDspState(['Preset', 'SubharmonicSynth', 'SV', 'SubharmonicSynth'], Adapter.Boolean)
  const [subharmonics, setSubharmonics] = useDspState(['Preset', 'SubharmonicSynth', 'SV', 'Subharmonics'], Adapter.Percentage)
  const [synthesisLevel_24_36, setSynthesisLevel_24_36] = useDspState(['Preset', 'SubharmonicSynth', 'SV', 'Synthesis Level 24-36Hz'], Adapter.Percentage)
  const [synthesisLevel_36_56, setSynthesisLevel_36_56] = useDspState(['Preset', 'SubharmonicSynth', 'SV', 'Synthesis Level 36-56Hz'], Adapter.Percentage)

  return (
    <fieldset className="subharmonic-synth" data-disabled={!enabled}>
      <legend>
        <label>
          <input type="checkbox" checked={!!enabled} onChange={(event) => setEnabled(event.target.checked)} />
          Subharmonics
        </label>
      </legend>

      <label className="key-value">
        Amount
        <PercentageInput value={subharmonics} onChange={setSubharmonics} />
      </label>

      <label className="key-value">
        36-56 Hz
        <PercentageInput value={synthesisLevel_36_56} onChange={setSynthesisLevel_36_56} />
      </label>

      <label className="key-value">
        24-36 Hz
        <PercentageInput value={synthesisLevel_24_36} onChange={setSynthesisLevel_24_36} />
      </label>

      {/* <div style={{ display: 'flex', gap: '0.1rem' }}>
          <Meter path={['Preset', 'SubharmonicSynth', 'SV', 'SubSynthLevel']} />
          <Meter path={['Preset', 'SubharmonicSynth', 'SV', 'UpperBandLevel']} />
          <Meter path={['Preset', 'SubharmonicSynth', 'SV', 'LowerBandLevel']} />
        </div> */}
    </fieldset>
  )
}
