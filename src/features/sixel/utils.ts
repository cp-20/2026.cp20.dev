import type { Rgb } from "./types";

export const flushSixelRun = (char: string, count: number): string => {
  if (count <= 0) return "";
  if (count <= 3) return char.repeat(count);
  return `!${count}${char}`;
};

export const quantizeChannel = (value: number): number => {
  const steps = 5;
  const normalized = Math.round((value / 255) * steps);
  return Math.round((normalized / steps) * 255);
};

export const nearestPaletteIndex = (palette: Rgb[], target: Rgb): number => {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < palette.length; i += 1) {
    const color = palette[i];
    const distance = Math.abs(color.r - target.r) +
      Math.abs(color.g - target.g) +
      Math.abs(color.b - target.b);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  return bestIndex;
};
