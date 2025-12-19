import { OpenAI } from 'openai';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import { dirname } from 'path';
import { mkdir } from 'fs/promises';
import sharp from 'sharp';
import type { BrandConfig } from '../types.js';

let client: OpenAI | null = null;
let currentApiKey: string | null = null;

// OpenAI GPT-image-1.5 Pricing in USD (December 2025)
// Source: https://platform.openai.com/docs/pricing
const IMAGE_PRICING: Record<string, Record<string, number>> = {
  'gpt-image-1.5': {
    '1024x1024_low': 0.01,
    '1024x1024_medium': 0.04,
    '1024x1024_high': 0.17,
    '1536x1024_low': 0.015,
    '1536x1024_medium': 0.06,
    '1536x1024_high': 0.25,
    '1024x1536_low': 0.015,
    '1024x1536_medium': 0.06,
    '1024x1536_high': 0.25,
  },
};

export interface ApiCallCost {
  model: string;
  operation: 'generate' | 'edit';
  size: string;
  quality: string;
  cost: number;
}

export function calculateImageCost(
  model: string,
  size: string,
  quality: string
): number {
  const pricing = IMAGE_PRICING[model] || IMAGE_PRICING['gpt-image-1.5'];
  const key = `${size}_${quality}`;
  return pricing[key] || 0.044; // Default to high quality 1024x1024 if unknown
}

export function getOpenAIClient(apiKey?: string): OpenAI {
  // Use provided API key, or fall back to environment variable
  const key = apiKey || process.env.OPENAI_API_KEY;
  
  if (!key) {
    throw new Error(
      'OPENAI_API_KEY not found. Please provide an API key in the frontend or set OPENAI_API_KEY in your .env file.'
    );
  }

  // Create new client if API key changed
  if (!client || currentApiKey !== key) {
    client = new OpenAI({ apiKey: key });
    currentApiKey = key;
  }
  
  return client;
}

export interface GenerateResult {
  path: string;
  cost: ApiCallCost;
}

function getSizeFromConfig(config: BrandConfig): '1536x1024' | '1024x1024' | '1024x1536' {
  switch (config.backgroundSize) {
    case 'portrait': return '1024x1536';
    case 'square': return '1024x1024';
    case 'landscape':
    default: return '1536x1024';
  }
}

export async function generateBackground(
  prompt: string,
  outputPath: string,
  config: BrandConfig
): Promise<GenerateResult> {
  const openai = getOpenAIClient(config.apiKey);
  const model = 'gpt-image-1.5';
  const size = getSizeFromConfig(config);
  const quality = config.quality === 'auto' ? 'high' : config.quality;

  console.log(`  -> Generating background: ${outputPath}`);

  const response = await openai.images.generate({
    model,
    prompt,
    size,
    n: 1,
    quality,
    response_format: 'b64_json',
  });

  const imageData = response.data?.[0];
  if (!imageData || !('b64_json' in imageData) || !imageData.b64_json) {
    throw new Error('No image data received in the API response');
  }

  const buffer = Buffer.from(imageData.b64_json as string, 'base64');
  await mkdir(dirname(outputPath), { recursive: true });

  // Convert to desired format
  const finalPath = await convertToFormat(buffer, outputPath, config);

  const cost = calculateImageCost(model, size, quality);

  return {
    path: finalPath,
    cost: {
      model,
      operation: 'generate',
      size,
      quality,
      cost,
    },
  };
}

async function convertToFormat(
  buffer: Buffer,
  outputPath: string,
  config: BrandConfig
): Promise<string> {
  const format = config.format || 'png';
  const ext = format === 'jpeg' ? 'jpg' : format;
  const finalPath = outputPath.replace(/\.png$/, `.${ext}`);

  let sharpInstance = sharp(buffer);

  if (format === 'jpeg') {
    sharpInstance = sharpInstance.jpeg({ quality: config.compression || 85 });
  } else if (format === 'webp') {
    sharpInstance = sharpInstance.webp({ quality: config.compression || 85 });
  } else {
    sharpInstance = sharpInstance.png();
  }

  await sharpInstance.toFile(finalPath);
  return finalPath;
}

export async function composeHero(
  logoPath: string,
  backgroundPath: string,
  prompt: string,
  outputPath: string,
  size: '1536x1024' | '1024x1024' | '1024x1536',
  config: BrandConfig
): Promise<GenerateResult> {
  const openai = getOpenAIClient(config.apiKey);
  const model = 'gpt-image-1.5';
  const quality = config.quality === 'auto' ? 'high' : config.quality;

  console.log(`  -> Composing hero: ${outputPath}`);

  const logoBuffer = readFileSync(logoPath);
  const backgroundBuffer = readFileSync(backgroundPath);

  // Combine background and logo into a composite for better edit results.
  const sizeMap: Record<string, [number, number]> = {
    '1536x1024': [1536, 1024],
    '1024x1024': [1024, 1024],
    '1024x1536': [1024, 1536],
  };
  const [width, height] = sizeMap[size] || [1024, 1024];

  // Build a temporary image with the background as base and the logo centered.
  const compositeBuffer = await sharp(backgroundBuffer)
    .resize(width, height, { fit: 'cover' })
    .composite([
      {
        input: await sharp(logoBuffer)
          .resize(Math.min(width * 0.4, height * 0.4), null, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .toBuffer();

  // Use the composite image for the Edit API.
  // Create a File-like object from the buffer for OpenAI API
  const imageFile = new File([compositeBuffer], 'composite.png', { type: 'image/png' });

  const response = await openai.images.edit({
    model,
    image: imageFile,
    prompt,
    size,
    n: 1,
    quality,
    response_format: 'b64_json',
  });

  const imageData = response.data?.[0];
  if (!imageData || !('b64_json' in imageData) || !imageData.b64_json) {
    throw new Error('No image data received in the API response');
  }

  const buffer = Buffer.from(imageData.b64_json as string, 'base64');
  await mkdir(dirname(outputPath), { recursive: true });

  // Convert to desired format
  const finalPath = await convertToFormat(buffer, outputPath, config);

  const cost = calculateImageCost(model, size, quality);

  return {
    path: finalPath,
    cost: {
      model,
      operation: 'edit',
      size,
      quality,
      cost,
    },
  };
}

export function decodeBase64Image(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}
