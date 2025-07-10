import { CronScheduler } from '../../src/scheduler/CronScheduler';

describe('CronScheduler', () => {
  it('schedules and runs a task', done => {
    const scheduler = new CronScheduler();
    let called = false;
    scheduler.scheduleTask('* * * * * *', '* * * * * *', async () => {
      called = true;
      scheduler.cancel('test');
      expect(called).toBe(true);
      done();
    });
  });

  it('can pause and resume a task', done => {
    const scheduler = new CronScheduler();
    let count = 0;
    const handle = scheduler.scheduleTask('* * * * * *', '* * * * * *', async () => {
      count++;
      if (count === 1) {
        handle.pause();
        setTimeout(() => {
          expect(count).toBe(1);
          handle.resume();
        }, 100);
      } else if (count === 2) {
        handle.cancel();
        done();
      }
    });
  });
}); 