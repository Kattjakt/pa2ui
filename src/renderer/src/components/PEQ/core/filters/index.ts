// https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html

export interface BaseFilterParams {
  frequency: number
  gain: number
  sampleRate: number
}

export interface NotchFilterParams extends BaseFilterParams {
  Q: number
}

export interface ShelfFilterParams extends BaseFilterParams {
  slope: number // In dB/octave
}

export type FilterParams = NotchFilterParams | ShelfFilterParams

export abstract class BaseFilter<T extends BaseFilterParams = BaseFilterParams> {
  protected b0: number = 0
  protected b1: number = 0
  protected b2: number = 0
  protected a0: number = 1
  protected a1: number = 0
  protected a2: number = 0

  constructor(public params: T) {
    this.calculateCoefficients()
  }

  public abstract calculateCoefficients(): void

  setFrequency(frequency: number) {
    this.params.frequency = frequency
    this.calculateCoefficients()
  }

  setGain(gain: number) {
    this.params.gain = gain
    this.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const { sampleRate } = this.params
    const omega = (2 * Math.PI * frequency) / sampleRate
    const cosOmega = Math.cos(omega)
    const sinOmega = Math.sin(omega)

    const numerator = Math.sqrt(
      Math.pow(this.b0 + this.b1 * cosOmega + this.b2 * Math.cos(2 * omega), 2) +
        Math.pow(this.b1 * sinOmega + this.b2 * Math.sin(2 * omega), 2)
    )

    const denominator = Math.sqrt(
      Math.pow(1 + this.a1 * cosOmega + this.a2 * Math.cos(2 * omega), 2) +
        Math.pow(this.a1 * sinOmega + this.a2 * Math.sin(2 * omega), 2)
    )

    return numerator / denominator
  }
}
