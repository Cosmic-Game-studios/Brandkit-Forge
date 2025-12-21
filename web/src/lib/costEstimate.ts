import type { BackgroundSize, CostEstimate, ImageQuality } from '../types';

const PRICING: Record<ImageQuality, Record<BackgroundSize, number>> = {
  low: { landscape: 0.015, square: 0.01, portrait: 0.015 },
  medium: { landscape: 0.06, square: 0.04, portrait: 0.06 },
  high: { landscape: 0.25, square: 0.17, portrait: 0.25 },
  auto: { landscape: 0.25, square: 0.17, portrait: 0.25 },
};

function resolveQuality(quality: string): ImageQuality {
  if (quality === 'low' || quality === 'medium' || quality === 'high' || quality === 'auto') {
    return quality;
  }
  return 'high';
}

export function estimateCost(
  quality: string,
  backgroundSize: BackgroundSize,
  numStyles: number,
  variants: number
): CostEstimate {
  const resolvedQuality = resolveQuality(quality);
  const prices = PRICING[resolvedQuality];

  let costPerVariant: number;
  let apiCallsPerVariant: number;

  if (backgroundSize === 'square') {
    costPerVariant = prices.square + prices.square;
    apiCallsPerVariant = 2;
  } else if (backgroundSize === 'portrait') {
    costPerVariant = prices.portrait + prices.portrait + prices.square;
    apiCallsPerVariant = 3;
  } else {
    costPerVariant = prices.landscape + prices.landscape + prices.square;
    apiCallsPerVariant = 3;
  }

  return {
    totalCost: numStyles * variants * costPerVariant,
    totalApiCalls: numStyles * variants * apiCallsPerVariant,
    numStyles,
    variants,
  };
}
