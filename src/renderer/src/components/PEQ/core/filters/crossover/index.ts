import { BaseFilter, BaseFilterParams } from '../index'

interface CrossoverFilterParams extends BaseFilterParams {
  frequency: number
  sampleRate: number
}

export abstract class CrossoverFilter extends BaseFilter<CrossoverFilterParams> {
  protected lowPass: BaseFilter
  protected highPass: BaseFilter

  constructor(params: CrossoverFilterParams) {
    super(params)
    this.lowPass = this.createLowPass(params)
    this.highPass = this.createHighPass(params)
  }

  protected abstract createLowPass(params: CrossoverFilterParams): BaseFilter
  protected abstract createHighPass(params: CrossoverFilterParams): BaseFilter

  setFrequency(frequency: number) {
    super.setFrequency(frequency)
    this.lowPass.setFrequency(frequency)
    this.highPass.setFrequency(frequency)
  }

  public calculateCoefficients(): void {
    this.lowPass?.calculateCoefficients()
    this.highPass?.calculateCoefficients()
  }

  calculateLowPassResponse(frequency: number): number {
    return this.lowPass.calculateFrequencyResponse(frequency)
  }

  calculateHighPassResponse(frequency: number): number {
    return this.highPass.calculateFrequencyResponse(frequency)
  }
}

export class LR12Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass2({ ...params, Q: 0.5 })
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass2({ ...params, Q: 0.5 })
  }
}
export class LR24Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass4({ ...params, Q: 0.707 })
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass4({ ...params, Q: 0.707 })
  }
}

export class BW12Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass2({ ...params, Q: 0.707 })
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass2({ ...params, Q: 0.707 })
  }
}

export class BW24Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass4({ ...params, Q: 0.707 })
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass4({ ...params, Q: 0.707 })
  }
}

class ButterworthFilter extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  calculateCoefficients(): void {
    const { frequency, sampleRate, Q } = this.params
    const omega = (2 * Math.PI * frequency) / sampleRate
    const cosOmega = Math.cos(omega)
    const alpha = Math.sin(omega) / (2 * Q)

    this.calculateFilterCoefficients?.(cosOmega, alpha)

    // Normalize coefficients
    this.b0 /= this.a0
    this.b1 /= this.a0
    this.b2 /= this.a0
    this.a1 /= this.a0
    this.a2 /= this.a0
    this.a0 = 1
  }

  calculateFilterCoefficients(cosOmega: number, alpha: number): void {
    // To be implemented by subclasses
  }
}

class ButterworthLowPass2 extends ButterworthFilter {
  calculateFilterCoefficients(cosOmega: number, alpha: number): void {
    this.b0 = (1 - cosOmega) / 2
    this.b1 = 1 - cosOmega
    this.b2 = (1 - cosOmega) / 2
    this.a0 = 1 + alpha
    this.a1 = -2 * cosOmega
    this.a2 = 1 - alpha
  }
}

class ButterworthHighPass2 extends ButterworthFilter {
  calculateFilterCoefficients(cosOmega: number, alpha: number): void {
    this.b0 = (1 + cosOmega) / 2
    this.b1 = -(1 + cosOmega)
    this.b2 = (1 + cosOmega) / 2
    this.a0 = 1 + alpha
    this.a1 = -2 * cosOmega
    this.a2 = 1 - alpha
  }
}

class ButterworthLowPass4 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthLowPass2
  private stage2: ButterworthLowPass2

  constructor(params: CrossoverFilterParams & { Q: number }) {
    super(params)
    this.stage1 = new ButterworthLowPass2(params)
    this.stage2 = new ButterworthLowPass2(params)
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    return response1 * response2
  }
}

class ButterworthHighPass4 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthHighPass2
  private stage2: ButterworthHighPass2

  constructor(params: CrossoverFilterParams & { Q: number }) {
    super(params)
    this.stage1 = new ButterworthHighPass2(params)
    this.stage2 = new ButterworthHighPass2(params)
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    return response1 * response2
  }
}
