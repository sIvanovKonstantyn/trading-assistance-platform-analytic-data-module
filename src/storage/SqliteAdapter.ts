import { StorageAdapter } from './StorageAdapter';
import { Candle } from '../models/Candle';
import { IndicatorEntry } from '../models/IndicatorEntry';
import sqlite3 from 'sqlite3';

export interface SQLiteAdapterOptions {
  path: string;
}

export class SQLiteAdapter extends StorageAdapter {
  private db: sqlite3.Database;

  constructor(options: SQLiteAdapterOptions) {
    super();
    this.db = new sqlite3.Database(options.path);
    this.init();
  }

  private init() {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS candles (
        symbol TEXT, interval TEXT, openTime INTEGER, open REAL, high REAL, low REAL, close REAL, volume REAL, closeTime INTEGER,
        quoteAssetVolume REAL, numberOfTrades INTEGER, takerBuyBaseAssetVolume REAL, takerBuyQuoteAssetVolume REAL,
        PRIMARY KEY(symbol, interval, openTime)
      )`);
      this.db.run(`CREATE TABLE IF NOT EXISTS indicators (
        symbol TEXT, indicator TEXT, period INTEGER, timestamp INTEGER, value REAL,
        PRIMARY KEY(symbol, indicator, period, timestamp)
      )`);
    });
  }

  async saveCandles(symbol: string, interval: string, candles: Candle[]): Promise<void> {
    const stmt = this.db.prepare(`REPLACE INTO candles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const c of candles) {
      stmt.run(symbol, interval, c.openTime, c.open, c.high, c.low, c.close, c.volume, c.closeTime, c.quoteAssetVolume, c.numberOfTrades, c.takerBuyBaseAssetVolume, c.takerBuyQuoteAssetVolume);
    }
    stmt.finalize();
  }

  async loadCandles(symbol: string, interval: string, from: number, to: number): Promise<Candle[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM candles WHERE symbol = ? AND interval = ? AND openTime >= ? AND closeTime <= ? ORDER BY openTime ASC`,
        [symbol, interval, from, to],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows as Candle[]);
        }
      );
    });
  }

  async saveIndicatorResults(symbol: string, indicator: string, period: number, values: IndicatorEntry[]): Promise<void> {
    const stmt = this.db.prepare(`REPLACE INTO indicators VALUES (?, ?, ?, ?, ?)`);
    for (const v of values) {
      stmt.run(symbol, indicator, period, v.timestamp, v.value);
    }
    stmt.finalize();
  }

  async queryIndicator(symbol: string, indicator: string, period: number, from: number, to: number): Promise<IndicatorEntry[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT timestamp, value FROM indicators WHERE symbol = ? AND indicator = ? AND period = ? AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC`,
        [symbol, indicator, period, from, to],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows as IndicatorEntry[]);
        }
      );
    });
  }
} 