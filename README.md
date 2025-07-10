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
import { BinanceCollector, IndicatorCalculator, SQLiteAdapter, CronScheduler } from 'analytic-data-module';
```

## Features
- Fetch historical candlestick and trade data from Binance API
- Real-time WebSocket streams for kline, depth, and trade data
- Calculate standard technical indicators (RSI, MACD, Bollinger Bands, SMA, EMA, etc.)
- Pluggable local storage (SQLite, PouchDB, etc.)
- Task scheduler with cron/interval support
- Modular, type-safe, and testable

## Usage Examples

### 1. Using Storage
```ts
import { SQLiteAdapter } from 'analytic-data-module';

const storage = new SQLiteAdapter({ path: './data.db' });

// Save candles
await storage.saveCandles('BTCUSDT', '1m', [/* array of Candle objects */]);

// Load candles
const candles = await storage.loadCandles('BTCUSDT', '1m', fromTimestamp, toTimestamp);

// Save indicator results
await storage.saveIndicatorResults('BTCUSDT', 'RSI', 14, [
  { timestamp: 1234567890, value: 55.2 },
]);

// Query indicator results
const rsi = await storage.queryIndicator('BTCUSDT', 'RSI', 14, fromTimestamp, toTimestamp);
```

### 2. Fetching and Storing Data with Scheduler
```ts
import { BinanceCollector, SQLiteAdapter, CronScheduler } from 'analytic-data-module';

const storage = new SQLiteAdapter({ path: './data.db' });
const collector = new BinanceCollector({ storage });
const scheduler = new CronScheduler();

// Schedule a daily fetch and store for BTCUSDT 1m candles
type FetchAndStoreJob = () => Promise<void>;
const fetchAndStore: FetchAndStoreJob = async () => {
  const now = Date.now();
  const from = now - 24 * 60 * 60 * 1000; // last 24h
  const candles = await collector.getHistoricalKlines('BTCUSDT', '1m', from, now);
  await storage.saveCandles('BTCUSDT', '1m', candles);
};

scheduler.scheduleTask('daily-btc-fetch', '0 0 * * *', fetchAndStore); // every day at midnight
```

### 3. Calculating and Storing Indicators with Price Data
```ts
import { IndicatorCalculator, SQLiteAdapter } from 'analytic-data-module';

const storage = new SQLiteAdapter({ path: './data.db' });
const calculator = new IndicatorCalculator();

// Load candles and calculate RSI, then store results
const candles = await storage.loadCandles('BTCUSDT', '1m', fromTimestamp, toTimestamp);
const closes = candles.map(c => c.close);
const rsiValues = calculator.calculateRSI(closes, 14);

await storage.saveIndicatorResults('BTCUSDT', 'RSI', 14, rsiValues.map((v, idx) => ({
  timestamp: candles[idx + (candles.length - rsiValues.length)].openTime,
  value: v,
})));
```

### 4. Real-Time Data Subscription
```ts
import { BinanceCollector } from 'analytic-data-module';

const collector = new BinanceCollector({});

collector.onKline((symbol, interval, kline) => {
  console.log(`New kline for ${symbol} [${interval}]:`, kline);
});
collector.subscribeKlines('BTCUSDT', '1m');
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