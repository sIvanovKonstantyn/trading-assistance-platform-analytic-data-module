export interface DepthLevel {
  price: number;
  quantity: number;
}

export interface DepthSnapshot {
  symbol: string;
  lastUpdateId: number;
  bids: DepthLevel[];
  asks: DepthLevel[];
} 