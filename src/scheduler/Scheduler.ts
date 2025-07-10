export interface TaskHandle {
  name: string;
  pause(): void;
  resume(): void;
  cancel(): void;
}

export interface Scheduler {
  scheduleTask(name: string, cron: string, job: () => Promise<void>): TaskHandle;
  scheduleRangeTask(name: string, cron: string, symbols: string[], from: number, to: number, interval: string): TaskHandle;
  start(): void;
  pause(name: string): void;
  resume(name: string): void;
  cancel(name: string): void;
} 