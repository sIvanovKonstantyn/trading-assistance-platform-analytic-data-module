import { SQLiteAdapter } from '../../src/storage/SqliteAdapter';
import { Candle } from '../../src/models/Candle';
import { IndicatorEntry } from '../../src/models/IndicatorEntry';

jest.mock('sqlite3', () => {
  function run(...args: any[]) {
    const cb = args[args.length - 1];
    if (typeof cb === 'function') cb();
  }
  function all(sql: any, params: any, cb: any) {
    if (typeof sql === 'string' && sql.includes('FROM indicators')) {
      cb(null, [{ timestamp: 1, value: 50 }]);
    } else {
      cb(null, [{ openTime: 1, open: 1, high: 1, low: 1, close: 1, volume: 1, closeTime: 1 }]);
    }
  }
  return {
    Database: jest.fn(() => ({
      serialize: (fn: any) => fn(),
      run,
      prepare: () => ({ run, finalize: () => {} }),
      all,
    })),
  };
});

describe('SQLiteAdapter', () => {
  const adapter = new SQLiteAdapter({ path: ':memory:' });

  it('saves candles', async () => {
    await expect(adapter.saveCandles('BTCUSDT', '1m', [{ openTime: 1, open: 1, high: 1, low: 1, close: 1, volume: 1, closeTime: 1 } as Candle])).resolves.toBeUndefined();
  });

  it('loads candles', async () => {
    await expect(adapter.loadCandles('BTCUSDT', '1m', 1, 2)).resolves.toEqual([
      expect.objectContaining({ openTime: 1 })
    ]);
  });

  it('saves indicator results', async () => {
    await expect(adapter.saveIndicatorResults('BTCUSDT', 'RSI', 14, [{ timestamp: 1, value: 50 } as IndicatorEntry])).resolves.toBeUndefined();
  });

  it('queries indicator results', async () => {
    await expect(adapter.queryIndicator('BTCUSDT', 'RSI', 14, 1, 2)).resolves.toEqual([
      expect.objectContaining({ timestamp: 1, value: 50 })
    ]);
  });
}); 