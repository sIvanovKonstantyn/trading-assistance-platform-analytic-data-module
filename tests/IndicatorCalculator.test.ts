import { IndicatorCalculator } from '../src/indicators/IndicatorCalculator';
import { ICustomIndicator } from '../src/indicators/custom/ICustomIndicator';

describe('IndicatorCalculator', () => {
  const calc = new IndicatorCalculator();
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('calculates SMA', () => {
    expect(calc.calculateSMA(data, 3)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('calculates EMA', () => {
    const ema = calc.calculateEMA(data, 3);
    expect(ema.length).toBe(data.length - 2);
    expect(typeof ema[0]).toBe('number');
  });

  it('calculates RSI', () => {
    const rsi = calc.calculateRSI(data, 3);
    expect(Array.isArray(rsi)).toBe(true);
    expect(typeof rsi[0]).toBe('number');
  });

  it('calculates MACD', () => {
    const macd = calc.calculateMACD(data, 3, 6, 2);
    expect(macd).toHaveProperty('macd');
    expect(macd).toHaveProperty('signal');
    expect(macd).toHaveProperty('histogram');
  });

  it('registers and calculates custom indicator', () => {
    const custom: ICustomIndicator = {
      name: 'double',
      calculate: (d) => d.map(x => x * 2),
    };
    calc.registerCustomIndicator(custom);
    expect(calc.calculateCustom('double', [1, 2, 3])).toEqual([2, 4, 6]);
  });
}); 