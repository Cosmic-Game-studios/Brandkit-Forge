const DEFAULT_STYLES = ['minimal', 'neon', 'clay', 'blueprint'] as const;

export function getDefaultStyles(): string[] {
  return [...DEFAULT_STYLES];
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
