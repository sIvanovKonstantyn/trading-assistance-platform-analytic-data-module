import { Scheduler, TaskHandle } from './Scheduler';
import { CronJob } from 'cron';

interface InternalTaskHandle extends TaskHandle {
  job: CronJob;
}

export class CronScheduler implements Scheduler {
  private tasks: Map<string, InternalTaskHandle> = new Map();

  scheduleTask(name: string, cron: string, jobFn: () => Promise<void>): TaskHandle {
    const job = new CronJob(cron, () => jobFn().catch(() => {}));
    const handle: InternalTaskHandle = {
      name,
      job,
      pause: () => job.stop(),
      resume: () => job.start(),
      cancel: () => {
        job.stop();
        this.tasks.delete(name);
      },
    };
    this.tasks.set(name, handle);
    job.start();
    return handle;
  }

  scheduleRangeTask(name: string, cron: string, symbols: string[], from: number, to: number, interval: string): TaskHandle {
    // Placeholder: user should provide a job function that fetches data for the range
    return this.scheduleTask(name, cron, async () => {
      // Implement actual range fetch logic in user code
    });
  }

  start() {
    this.tasks.forEach(task => task.job.start());
  }
  pause(name: string) {
    this.tasks.get(name)?.pause();
  }
  resume(name: string) {
    this.tasks.get(name)?.resume();
  }
  cancel(name: string) {
    this.tasks.get(name)?.cancel();
  }
} 