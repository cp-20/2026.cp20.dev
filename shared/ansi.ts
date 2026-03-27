const wrap = (code: number, text: string) => `\u001b[${code}m${text}\u001b[0m`;

export const ansi = {
  reset: "\u001b[0m",
  bold: (text: string) => wrap(1, text),
  dim: (text: string) => wrap(2, text),
  red: (text: string) => wrap(31, text),
  green: (text: string) => wrap(32, text),
  yellow: (text: string) => wrap(33, text),
  blue: (text: string) => wrap(34, text),
  magenta: (text: string) => wrap(35, text),
  cyan: (text: string) => wrap(36, text),
  gray: (text: string) => wrap(90, text),
};
