import sharp from 'sharp';

export interface ExtractedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  percentage: number;
}

export interface ColorPalette {
  dominant: ExtractedColor;
  colors: ExtractedColor[];
  isDark: boolean;
  isVibrant: boolean;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function isNearWhiteOrBlack(r: number, g: number, b: number, threshold = 30): boolean {
  const brightness = (r + g + b) / 3;
  return brightness < threshold || brightness > 255 - threshold;
}

function isNearGray(r: number, g: number, b: number, threshold = 15): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (max - min) < threshold;
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

interface ColorBucket {
  r: number;
  g: number;
  b: number;
  count: number;
}

/**
 * Extract dominant colors from an image using Sharp.
 * Uses pixel sampling and k-means-style bucketing for speed.
 */
export async function extractColors(
  input: string | Buffer,
  maxColors = 5
): Promise<ColorPalette> {
  // Resize to small dimensions for fast processing
  const { data, info } = await sharp(input)
    .resize(64, 64, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: Array<[number, number, number]> = [];
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Skip near-white, near-black, and near-gray pixels
    if (!isNearWhiteOrBlack(r, g, b) && !isNearGray(r, g, b)) {
      pixels.push([r, g, b]);
    }
  }

  // If no colorful pixels found, include all pixels
  if (pixels.length < 10) {
    for (let i = 0; i < data.length; i += 3) {
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  // Simple color bucketing with merge threshold
  const buckets: ColorBucket[] = [];
  const MERGE_THRESHOLD = 50;

  for (const [r, g, b] of pixels) {
    let merged = false;
    for (const bucket of buckets) {
      const avgR = Math.round(bucket.r / bucket.count);
      const avgG = Math.round(bucket.g / bucket.count);
      const avgB = Math.round(bucket.b / bucket.count);

      if (colorDistance(r, g, b, avgR, avgG, avgB) < MERGE_THRESHOLD) {
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
        bucket.count += 1;
        merged = true;
        break;
      }
    }
    if (!merged) {
      buckets.push({ r, g, b, count: 1 });
    }
  }

  // Sort by count descending and take top N
  buckets.sort((a, b) => b.count - a.count);
  const topBuckets = buckets.slice(0, maxColors);
  const totalPixels = pixels.length;

  const colors: ExtractedColor[] = topBuckets.map((bucket) => {
    const r = Math.round(bucket.r / bucket.count);
    const g = Math.round(bucket.g / bucket.count);
    const b = Math.round(bucket.b / bucket.count);
    return {
      hex: rgbToHex(r, g, b),
      r,
      g,
      b,
      percentage: Math.round((bucket.count / totalPixels) * 100),
    };
  });

  const dominant = colors[0] || { hex: '#000000', r: 0, g: 0, b: 0, percentage: 100 };

  // Determine overall palette characteristics
  const avgLuminance = colors.reduce((sum, c) => sum + getLuminance(c.r, c.g, c.b), 0) / colors.length;
  const avgSaturation = colors.reduce((sum, c) => sum + getSaturation(c.r, c.g, c.b), 0) / colors.length;

  return {
    dominant,
    colors,
    isDark: avgLuminance < 128,
    isVibrant: avgSaturation > 0.4,
  };
}

/**
 * Suggest a preset based on extracted color palette characteristics.
 */
export function suggestPreset(palette: ColorPalette): string {
  if (palette.isDark && !palette.isVibrant) return 'noir';
  if (palette.isDark && palette.isVibrant) return 'electric';
  if (!palette.isDark && !palette.isVibrant) return 'zen';
  if (!palette.isDark && palette.isVibrant) return 'fresh';
  return 'core';
}

/**
 * Suggest styles based on extracted color palette characteristics.
 */
export function suggestStyles(palette: ColorPalette): string[] {
  const styles: string[] = [];

  if (palette.isDark && palette.isVibrant) {
    styles.push('neon', 'gradient', 'glassmorphism');
  } else if (palette.isDark) {
    styles.push('minimal', 'blueprint', 'glassmorphism');
  } else if (palette.isVibrant) {
    styles.push('gradient', 'clay', 'retro');
  } else {
    styles.push('minimal', 'watercolor', 'clay');
  }

  return styles;
}
