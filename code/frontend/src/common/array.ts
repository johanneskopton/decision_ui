export const repeat = <T>(value: T, times: number): T[] => {
  return Array(times).fill(value);
};

export const makeArray = <T>(value: T | T[], size: number) => {
  if (Array.isArray(value)) {
    return value;
  }
  return repeat(value, size);
};
