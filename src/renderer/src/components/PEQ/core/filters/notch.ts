import { BaseFilter, NotchFilterParams } from '.'

export class NotchFilter extends BaseFilter<NotchFilterParams> {
  public calculateCoefficients(): void {
    const { frequency, Q, gain, sampleRate } = this.params
    const omega = (2 * Math.PI * frequency) / sampleRate
    const alpha = Math.sin(omega) / (2 * Q)
    const A = Math.pow(10, gain / 40)

    this.b0 = 1 + alpha * A
    this.b1 = -2 * Math.cos(omega)
    this.b2 = 1 - alpha * A
    this.a0 = 1 + alpha / A
    this.a1 = -2 * Math.cos(omega)
    this.a2 = 1 - alpha / A

    // Normalize coefficients
    this.b0 /= this.a0
    this.b1 /= this.a0
    this.b2 /= this.a0
    this.a1 /= this.a0
    this.a2 /= this.a0
    this.a0 = 1
  }
}
