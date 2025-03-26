export const repeat = <T>(value: T, times: number): T[] => {
  return Array(times).fill(value);
};
