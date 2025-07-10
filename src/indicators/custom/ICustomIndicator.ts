export interface ICustomIndicator {
  name: string;
  calculate(data: number[], options?: Record<string, any>): number[];
} 