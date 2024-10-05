import { BaseFilter, ShelfFilterParams } from '.'

export class LowShelfFilter extends BaseFilter<ShelfFilterParams> {
  public calculateCoefficients(): void {
    const { frequency, slope, gain, sampleRate } = this.params
    const omega = (2 * Math.PI * frequency) / sampleRate
    const A = Math.pow(10, gain / 40)

    // Convert slope (dB/octave) to S parameter
    // S varies from 0.5 to 1, where 0.5 is the steepest slope and 1 is the gentlest
    // const S = Math.min(Math.max(0.5, 1 / (slope / 12 + 1)), 1)
    const S = slope / 6

    const alpha = (Math.sin(omega) / 2) * Math.sqrt((A + 1 / A) * (1 / S - 1) + 2)
    const cosOmega = Math.cos(omega)
    const sqrtA = Math.sqrt(A)

    this.b0 = A * (A + 1 - (A - 1) * cosOmega + 2 * sqrtA * alpha)
    this.b1 = 2 * A * (A - 1 - (A + 1) * cosOmega)
    this.b2 = A * (A + 1 - (A - 1) * cosOmega - 2 * sqrtA * alpha)
    this.a0 = A + 1 + (A - 1) * cosOmega + 2 * sqrtA * alpha
    this.a1 = -2 * (A - 1 + (A + 1) * cosOmega)
    this.a2 = A + 1 + (A - 1) * cosOmega - 2 * sqrtA * alpha

    // Normalize coefficients
    this.b0 /= this.a0
    this.b1 /= this.a0
    this.b2 /= this.a0
    this.a1 /= this.a0
    this.a2 /= this.a0
    this.a0 = 1
  }
}
