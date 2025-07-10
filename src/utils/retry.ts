export async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (++attempt > retries) throw err;
      await new Promise(res => setTimeout(res, delay * Math.pow(2, attempt - 1)));
    }
  }
} 