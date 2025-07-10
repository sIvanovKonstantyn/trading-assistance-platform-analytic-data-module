import { Candle } from '../models/Candle';
import { IndicatorEntry } from '../models/IndicatorEntry';

export abstract class StorageAdapter {
  abstract saveCandles(symbol: string, interval: string, candles: Candle[]): Promise<void>;
  abstract loadCandles(symbol: string, interval: string, from: number, to: number): Promise<Candle[]>;
  abstract saveIndicatorResults(symbol: string, indicator: string, period: number, values: IndicatorEntry[]): Promise<void>;
  abstract queryIndicator(symbol: string, indicator: string, period: number, from: number, to: number): Promise<IndicatorEntry[]>;
} 