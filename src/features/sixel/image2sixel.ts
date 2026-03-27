import { IMAGE_LIMITS, Rgb } from "./types";
import { flushSixelRun, nearestPaletteIndex, quantizeChannel } from "./utils";
import { intToRGBA, Jimp } from "jimp";

export const image2sixel = async (
  arrayBuffer: ArrayBuffer,
): Promise<string> => {
  const image = await Jimp.read(Buffer.from(arrayBuffer));
  const ratio = Math.min(
    IMAGE_LIMITS.width / image.bitmap.width,
    IMAGE_LIMITS.height / image.bitmap.height,
    1,
  );
  const width = Math.max(1, Math.round(image.bitmap.width * ratio));
  const height = Math.max(1, Math.round(image.bitmap.height * ratio));
  image.resize({ w: width, h: height });

  const pixelCount = width * height;
  const colorIndexes = new Int16Array(pixelCount);
  colorIndexes.fill(-1);
  const palette: Rgb[] = [];
  const paletteMap = new Map<string, number>();
  const maxPalette = 64;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const { r, g, b, a } = intToRGBA(image.getPixelColor(x, y));
      if (a < 48) continue;
      const quantized: Rgb = {
        r: quantizeChannel(r),
        g: quantizeChannel(g),
        b: quantizeChannel(b),
      };
      const key = `${quantized.r},${quantized.g},${quantized.b}`;
      const existingIndex = paletteMap.get(key);
      if (existingIndex !== undefined) {
        colorIndexes[idx] = existingIndex;
        continue;
      }
      if (palette.length < maxPalette) {
        const newIndex = palette.length;
        palette.push(quantized);
        paletteMap.set(key, newIndex);
        colorIndexes[idx] = newIndex;
        continue;
      }
      colorIndexes[idx] = nearestPaletteIndex(palette, quantized);
    }
  }
  let sixel = `\u001bPq\"1;1;${width};${height}`;
  palette.forEach((color, index) => {
    const r = Math.round((color.r / 255) * 100);
    const g = Math.round((color.g / 255) * 100);
    const b = Math.round((color.b / 255) * 100);
    sixel += `#${index};2;${r};${g};${b}`;
  });
  for (let bandStart = 0; bandStart < height; bandStart += 6) {
    const colorsInBand = new Set<number>();
    for (let y = bandStart; y < Math.min(height, bandStart + 6); y += 1) {
      for (let x = 0; x < width; x += 1) {
        const colorIndex = colorIndexes[y * width + x];
        if (colorIndex >= 0) {
          colorsInBand.add(colorIndex);
        }
      }
    }
    const sortedColors = Array.from(colorsInBand).sort((a, b) => a - b);
    if (sortedColors.length === 0) {
      if (bandStart + 6 < height) {
        sixel += "-";
      }
      continue;
    }
    sortedColors.forEach((colorIndex, colorOrder) => {
      sixel += `#${colorIndex}`;
      let runChar = "";
      let runLength = 0;
      for (let x = 0; x < width; x += 1) {
        let mask = 0;
        for (let bit = 0; bit < 6; bit += 1) {
          const y = bandStart + bit;
          if (y >= height) continue;
          if (colorIndexes[y * width + x] === colorIndex) {
            mask |= 1 << bit;
          }
        }
        const char = String.fromCharCode(63 + mask);
        if (runLength === 0) {
          runChar = char;
          runLength = 1;
          continue;
        }
        if (char === runChar) {
          runLength += 1;
          continue;
        }
        sixel += flushSixelRun(runChar, runLength);
        runChar = char;
        runLength = 1;
      }
      sixel += flushSixelRun(runChar, runLength);
      if (colorOrder + 1 < sortedColors.length) {
        sixel += "$";
      }
    });
    if (bandStart + 6 < height) {
      sixel += "-";
    }
  }
  sixel += "\u001b\\";
  return sixel;
};
