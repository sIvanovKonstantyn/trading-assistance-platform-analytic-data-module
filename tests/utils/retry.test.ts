import { retry } from '../../src/utils/retry';

describe('retry', () => {
  it('resolves on first try', async () => {
    const fn = jest.fn().mockResolvedValue(42);
    await expect(retry(fn)).resolves.toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and then succeeds', async () => {
    let count = 0;
    const fn = jest.fn().mockImplementation(() => {
      if (++count < 2) return Promise.reject('fail');
      return Promise.resolve('ok');
    });
    await expect(retry(fn, 3, 1)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('fails after max retries', async () => {
    const fn = jest.fn().mockRejectedValue('fail');
    await expect(retry(fn, 2, 1)).rejects.toBe('fail');
    expect(fn).toHaveBeenCalledTimes(3);
  });
}); 