export const asyncForEach = async <T>(fn: (x: T) => Promise<void>, list: readonly T[]) => {
  for (let i = 0; i < list.length; i++) {
    await fn(list[i]);
  }
};
