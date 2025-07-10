import fetch from 'node-fetch';
import WebSocket from 'ws';
import { Candle } from '../models/Candle';
import { DepthSnapshot } from '../models/DepthSnapshot';

type KlineCallback = (symbol: string, interval: string, kline: Candle) => void;
type DepthCallback = (symbol: string, depth: DepthSnapshot) => void;
type TradeCallback = (symbol: string, trade: any) => void;

type CollectorOptions = {
  apiKey?: string;
  secretKey?: string;
  storage?: any;
};

export class BinanceCollector {
  private wsMap: Map<string, WebSocket> = new Map();
  private klineCallbacks: KlineCallback[] = [];
  private depthCallbacks: DepthCallback[] = [];
  private tradeCallbacks: TradeCallback[] = [];
  private options: CollectorOptions;

  constructor(options: CollectorOptions) {
    this.options = options;
  }

  async getHistoricalKlines(symbol: string, interval: string, from: number, to: number): Promise<Candle[]> {
    // Binance API: /api/v3/klines
    const limit = 1000;
    let start = from;
    const result: Candle[] = [];
    while (start < to) {
      const end = Math.min(start + limit * this.intervalToMs(interval), to);
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${start}&endTime=${end}&limit=${limit}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) break;
      for (const d of data) {
        result.push({
          openTime: d[0], open: +d[1], high: +d[2], low: +d[3], close: +d[4], volume: +d[5], closeTime: d[6],
          quoteAssetVolume: +d[7], numberOfTrades: d[8], takerBuyBaseAssetVolume: +d[9], takerBuyQuoteAssetVolume: +d[10],
        });
      }
      start = data[data.length - 1][0] + this.intervalToMs(interval);
      if (data.length < limit) break;
    }
    return result;
  }

  subscribeKlines(symbol: string, interval: string) {
    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    this.subscribe(stream, (msg: any) => {
      if (msg.k) {
        const k = msg.k;
        const candle: Candle = {
          openTime: k.t, open: +k.o, high: +k.h, low: +k.l, close: +k.c, volume: +k.v, closeTime: k.T,
        };
        this.klineCallbacks.forEach(cb => cb(symbol, interval, candle));
      }
    });
  }

  subscribeDepth(symbol: string) {
    const stream = `${symbol.toLowerCase()}@depth`; 
    this.subscribe(stream, (msg: any) => {
      if (msg.b && msg.a) {
        const depth: DepthSnapshot = {
          symbol,
          lastUpdateId: msg.u,
          bids: msg.b.map((b: any) => ({ price: +b[0], quantity: +b[1] })),
          asks: msg.a.map((a: any) => ({ price: +a[0], quantity: +a[1] })),
        };
        this.depthCallbacks.forEach(cb => cb(symbol, depth));
      }
    });
  }

  subscribeTrades(symbol: string) {
    const stream = `${symbol.toLowerCase()}@trade`;
    this.subscribe(stream, (msg: any) => {
      this.tradeCallbacks.forEach(cb => cb(symbol, msg));
    });
  }

  unsubscribe(stream: string) {
    const ws = this.wsMap.get(stream);
    if (ws) {
      ws.close();
      this.wsMap.delete(stream);
    }
  }

  onKline(cb: KlineCallback) { this.klineCallbacks.push(cb); }
  onDepthUpdate(cb: DepthCallback) { this.depthCallbacks.push(cb); }
  onTrade(cb: TradeCallback) { this.tradeCallbacks.push(cb); }

  private subscribe(stream: string, handler: (msg: any) => void) {
    if (this.wsMap.has(stream)) return;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        handler(msg);
      } catch {}
    });
    ws.on('close', () => {
      setTimeout(() => this.subscribe(stream, handler), 1000); // auto-reconnect
    });
    this.wsMap.set(stream, ws);
  }

  private intervalToMs(interval: string): number {
    const map: Record<string, number> = {
      '1m': 60000, '3m': 180000, '5m': 300000, '15m': 900000, '30m': 1800000,
      '1h': 3600000, '2h': 7200000, '4h': 14400000, '6h': 21600000, '8h': 28800000, '12h': 43200000,
      '1d': 86400000, '3d': 259200000, '1w': 604800000, '1M': 2592000000,
    };
    return map[interval] || 60000;
  }
} 