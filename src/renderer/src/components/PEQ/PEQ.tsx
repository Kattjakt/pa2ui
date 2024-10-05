import { PropsWithChildren, useMemo } from 'react'
import { useLs, useSyncedState } from '../../pa2/hooks'
import { FilterRow } from '../FilterRow'
import { PEQBars } from './Bars/Bars'
import { PEQGrid } from './Grid'
import { PEQHandle } from './Handle/Handle'
import { PEQLegend } from './Legend/Legend'
import { PEQProvider } from './peq.context'
import { PEQFrequencyResponse } from './Response'
import './style.scss'

interface Props {
  path: string[]
  rta?: boolean
  bars?: Array<{ frequency: number; gain: number }>
}

const useBands = (path: string[]) => {
  const [entries, error] = useLs(path)

  const bands = useMemo(() => {
    if (!entries) {
      return []
    }

    // Extract the unique Band_0, Band_1, etc. prefixes from the keys
    const regex = /Band_\d+/
    const prefixes = entries
      .filter((entry) => regex.test(entry.key))
      .map((entry) => entry.key.match(regex)![0])

    return [...new Set(prefixes)]
  }, [entries])

  return bands
}

const getFilterIndex = (bandName: string) => parseInt(bandName.split('_')[1]) - 1

export const PEQ: React.FC<PropsWithChildren<Props>> = (props) => {
  const [enabled, setEnabled] = useSyncedState([...props.path, 'ParametricEQ'])
  const bandNames = useBands(props.path)

  const shouldDisplayHandles = enabled === 'On'

  if (!bandNames.length) {
    return null
  }

  return (
    <PEQProvider>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          width: '100%',
          height: '100%',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', gap: '0.0rem', width: '100%', height: '100%' }}>
          <div className="peq__bands">
            {bandNames.map((bandName) => (
              <FilterRow key={bandName} path={props.path} bandName={bandName} />
            ))}
          </div>

          <div className="peq">
            <div className="visualisation">
              <PEQGrid decibelStep={6} />

              {props.rta && <PEQBars />}

              <PEQFrequencyResponse />
              <PEQLegend />

              {/* Handles */}
              {shouldDisplayHandles &&
                bandNames.map((bandName) => (
                  <PEQHandle key={bandName} filterIndex={getFilterIndex(bandName)} />
                ))}

              <div
                style={{
                  position: 'absolute',
                  top: '0.1rem',
                  left: '0.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  // writingMode: 'vertical-rl',
                  color: '#888'
                }}
              >
                {/* <label>
                <input
                  type="checkbox"
                  checked={readonly}
                  onChange={(event) => setReadonly(event.target.checked ? true : false)}
                />
                Locked
              </label> */}

                <label>
                  <input
                    type="checkbox"
                    checked={enabled === 'On'}
                    onChange={(event) => setEnabled(event.target.checked ? 'On' : 'Off')}
                  />
                  {/* Enabled */}
                </label>
              </div>

              {props.children}
            </div>
          </div>
        </div>
      </div>
    </PEQProvider>
  )
}
