import { CrossoverBand } from './band/Band'
import { useCrossoverBands } from './useCrossoverBands'

export const Crossover: React.FC = () => {
  const bands = useCrossoverBands()

  return (
    <div className="crossover">
      <div className="section-title">Crossover</div>

      {bands.map((band) => (
        <CrossoverBand key={band.id} band={band} />
      ))}
    </div>
  )
}
