import { ICustomIndicator } from './custom/ICustomIndicator';

export interface MACDResult {
  macd: number[];
  signal: number[];
  histogram: number[];
}

export class IndicatorCalculator {
  private customIndicators: Map<string, ICustomIndicator> = new Map();

  calculateSMA(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i <= data.length - period; i++) {
      const sum = data.slice(i, i + period).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }

  calculateEMA(data: number[], period: number): number[] {
    const result: number[] = [];
    const k = 2 / (period + 1);
    let emaPrev = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(emaPrev);
    for (let i = period; i < data.length; i++) {
      emaPrev = data[i] * k + emaPrev * (1 - k);
      result.push(emaPrev);
    }
    return result;
  }

  calculateRSI(data: number[], period: number): number[] {
    const result: number[] = [];
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
      const diff = data[i] - data[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    result.push(100 - 100 / (1 + avgGain / avgLoss));
    for (let i = period + 1; i < data.length; i++) {
      const diff = data[i] - data[i - 1];
      if (diff >= 0) {
        avgGain = (avgGain * (period - 1) + diff) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - diff) / period;
      }
      result.push(100 - 100 / (1 + avgGain / avgLoss));
    }
    return result;
  }

  calculateMACD(data: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number): MACDResult {
    const fastEMA = this.calculateEMA(data, fastPeriod);
    const slowEMA = this.calculateEMA(data, slowPeriod);
    const macd = fastEMA.slice(slowEMA.length - fastEMA.length).map((v, i) => v - slowEMA[i]);
    const signal = this.calculateEMA(macd, signalPeriod);
    const histogram = macd.slice(signal.length - macd.length).map((v, i) => v - signal[i]);
    return { macd, signal, histogram };
  }

  registerCustomIndicator(indicator: ICustomIndicator) {
    this.customIndicators.set(indicator.name, indicator);
  }

  calculateCustom(name: string, data: number[], options?: Record<string, any>): number[] {
    const indicator = this.customIndicators.get(name);
    if (!indicator) throw new Error(`Custom indicator ${name} not registered`);
    return indicator.calculate(data, options);
  }
} 