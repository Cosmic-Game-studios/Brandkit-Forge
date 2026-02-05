const DEFAULT_STYLES = ['minimal', 'neon', 'clay', 'blueprint'] as const;

const ALL_BUILT_IN_STYLES = [
  'minimal', 'neon', 'clay', 'blueprint',
  'gradient', 'retro', 'glassmorphism', 'watercolor',
] as const;

export function getDefaultStyles(): string[] {
  return [...DEFAULT_STYLES];
}

export function getAllBuiltInStyles(): string[] {
  return [...ALL_BUILT_IN_STYLES];
}

export function parseStyles(stylesStr?: string): string[] {
  if (!stylesStr) {
    return getDefaultStyles();
  }

  return stylesStr
    .split(',')
    .map((style) => style.trim())
    .filter(Boolean);
}
