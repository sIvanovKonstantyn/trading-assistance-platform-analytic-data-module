# Analytic Data Module

A standalone TypeScript/JavaScript library for historical and real-time market data collection, technical indicator calculation, and local storage. Designed for integration into desktop and mobile trading applications.

## Installation

### From source (local development)
```sh
git clone <this-repo-url>
cd analytic-data-module
npm install
npm run build
```

Then import and use in your TypeScript/JavaScript project:
```ts
import { DataCollector, IndicatorCalculator, SQLiteAdapter, CronScheduler } from 'analytic-data-module';
```

## Features
- Fetch historical candlestick and trade data from Binance API
- Real-time WebSocket streams for kline, depth, and trade data
- Calculate standard technical indicators (RSI, MACD, Bollinger Bands, SMA, EMA, etc.)
- Pluggable local storage (SQLite, PouchDB, etc.)
- Task scheduler with cron/interval support
- Modular, type-safe, and testable

## Example Usage
```ts
import { DataCollector, IndicatorCalculator, SQLiteAdapter, CronScheduler } from 'crypto-data-lib';

const storage = new SQLiteAdapter({ path: './data.db' });
const scheduler = new CronScheduler();
const collector = new DataCollector({ apiKey, secretKey, storage });
const calculator = new IndicatorCalculator();

scheduler.scheduleRangeTask(
  'daily-btc-history',
  '0 0 * * *',
  ['BTCUSDT'],
  Date.now() - 86400000,
  Date.now(),
  '1m'
);

collector.onKline((symbol, interval, kline) => {
  console.log(`New close price: ${kline.close}`);
});
collector.subscribeKlines('BTCUSDT', '1m');

(async () => {
  const candles = await storage.loadCandles('BTCUSDT', '1m', fromTs, toTs);
  const closes = candles.map(c => c.close);
  const rsiValues = calculator.calculateRSI(closes, 14);
  await storage.saveIndicatorResults('BTCUSDT', 'RSI', 14, rsiValues.map((v, idx) => ({ timestamp: candles[idx].openTime, value: v })));
})();
```

## Development
- `npm run build` — Compile TypeScript to `dist/`
- `npm test` — Run unit tests with Jest
- `npm run docs` — Generate API documentation with TypeDoc

## Project Structure
- `src/collectors/` — Data collectors (REST, WebSocket)
- `src/indicators/` — Indicator calculators
- `src/storage/` — Storage adapters
- `src/scheduler/` — Task scheduler
- `src/models/` — Data models
- `src/utils/` — Utilities
- `tests/` — Unit tests 