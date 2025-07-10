import { BinanceCollector } from '../../src/collectors/BinanceCollector';
import { Candle } from '../../src/models/Candle';

jest.mock('node-fetch', () => jest.fn());
jest.mock('ws', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn((event, cb) => {
      if (event === 'message') setTimeout(() => cb(JSON.stringify({ k: { t: 1, o: '1', h: '2', l: '0', c: '1.5', v: '100', T: 2 } })), 10);
      if (event === 'close') setTimeout(cb, 20);
    }),
    close: jest.fn(),
  }));
});

const fetch = require('node-fetch');

describe('BinanceCollector', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('fetches historical klines', async () => {
    fetch.mockResolvedValueOnce({ json: async () => [[1, '1', '2', '0', '1.5', '100', 2, '0', 1, '0', '0']] });
    const collector = new BinanceCollector({});
    const candles = await collector.getHistoricalKlines('BTCUSDT', '1m', 1, 2);
    expect(candles[0]).toHaveProperty('openTime', 1);
    expect(candles[0]).toHaveProperty('close', 1.5);
  });

  it('subscribes to klines and calls callback', done => {
    const collector = new BinanceCollector({});
    collector.onKline((symbol, interval, kline: Candle) => {
      expect(symbol).toBe('BTCUSDT');
      expect(interval).toBe('1m');
      expect(kline).toHaveProperty('openTime', 1);
      done();
    });
    collector.subscribeKlines('BTCUSDT', '1m');
  });
}); 