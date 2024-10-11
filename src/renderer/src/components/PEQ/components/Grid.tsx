import { generateOctaveBandFrequencies, getZeroOneFromThirdOctaveBandFrequency } from '../../../common'
import { usePEQ } from '../peq.context'

const getGridXs = () => {
  const stops = generateOctaveBandFrequencies()

  return stops.map((freq) => getZeroOneFromThirdOctaveBandFrequency(freq) * 100)
}

const renderGridX = (x: number) => {
  return <line key={x} className="grid-x" x1={x} y1="0" x2={x} y2="10" />
}

const renderGridY = (db: number, dbMin: number, dbMax: number) => {
  const relY = (db - dbMin) / (dbMax - dbMin)
  const y = (1 - relY) * 10 // Invert Y-axis
  return <line key={y} className="grid-y" x1="0" y1={y} x2="100" y2={y} />
}

interface Props {
  decibelStep: number
}

export const PEQGrid: React.FC<Props> = (props) => {
  const peq = usePEQ()

  const dbMin = peq.decibelRange / -2
  const dbMax = peq.decibelRange / 2

  let gridXs = getGridXs()
  let gridYs: number[] = []

  for (let db = 0; db <= dbMax; db += props.decibelStep) {
    gridYs.push(db)
  }

  for (let db = 0; db >= dbMin; db -= props.decibelStep) {
    gridYs.push(db)
  }

  gridYs = [...new Set(gridYs)].sort((a, b) => a - b) // dedupe + sort

  return (
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      {gridXs.map(renderGridX)}
      {gridYs.map((db) => renderGridY(db, dbMin, dbMax))}
    </svg>
  )
}
