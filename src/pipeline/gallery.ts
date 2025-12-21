import { writeFileSync } from 'fs';
import { join, relative } from 'path';
import type { BrandkitManifest } from '../types.js';

const HERO_PATH_PATTERN = /variants[\\/]+([^\\/]+)[\\/]+(\d+)[\\/]+(.+)$/;

type HeroGroups = Record<string, string[]>;

function toWebPath(baseDir: string, absolutePath: string): string {
  return relative(baseDir, absolutePath).split('\\').join('/');
}

function groupHeroesByVariant(heroes: string[]): HeroGroups {
  return heroes.reduce<HeroGroups>((groups, heroPath) => {
    const match = heroPath.match(HERO_PATH_PATTERN);
    if (!match) {
      return groups;
    }

    const [, style, index] = match;
    const key = `${style}-${index}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(heroPath);
    return groups;
  }, {});
}

function getHeroLabel(filename: string): string {
  if (filename.includes('landscape')) return 'Landscape';
  if (filename.includes('portrait')) return 'Portrait';
  return 'Square';
}

function renderVariantCard(heroPath: string, baseDir: string, style: string): string {
  const filename = heroPath.split('/').pop() || '';
  const label = getHeroLabel(filename);
  const relativePath = toWebPath(baseDir, heroPath);

  return `
    <div class="variant">
      <img src="${relativePath}" alt="${style} ${label}">
      <div class="variant-info">
        ${label} - ${filename}
        <a href="${relativePath}" download class="download-link">Download</a>
      </div>
    </div>
  `;
}

function renderStyleSection(
  style: string,
  heroGroups: HeroGroups,
  baseDir: string
): string {
  const variants = Object.keys(heroGroups)
    .filter((key) => key.startsWith(`${style}-`))
    .map((key) => heroGroups[key])
    .flat();

  if (variants.length === 0) {
    return '';
  }

  return `
    <div class="style-group">
      <div class="style-title">${style}</div>
      <div class="variants">
        ${variants.map((heroPath) => renderVariantCard(heroPath, baseDir, style)).join('')}
      </div>
    </div>
  `;
}

function renderIconsSection(iconPaths: string[], baseDir: string): string {
  if (iconPaths.length === 0) {
    return '';
  }

  return `
    <div class="icons-section">
      <h2>Icons</h2>
      <div class="icons-grid">
        ${iconPaths
          .map((iconPath) => {
            const name = iconPath.split('/').pop() || '';
            const relativePath = toWebPath(baseDir, iconPath);
            return `
              <div class="icon-item">
                <img src="${relativePath}" alt="${name}">
                <div style="font-size: 0.75rem; margin-top: 0.25rem;">${name}</div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderSocialSection(socialPaths: string[], baseDir: string): string {
  if (socialPaths.length === 0) {
    return '';
  }

  return `
    <div class="social-section">
      <h2>Social Media Assets</h2>
      <div class="social-grid">
        ${socialPaths
          .map((socialPath) => {
            const name = socialPath.split('/').pop() || '';
            const relativePath = toWebPath(baseDir, socialPath);
            return `
              <div class="social-item">
                <img src="${relativePath}" alt="${name}">
                <div style="padding: 0.5rem; font-size: 0.85rem;">${name}</div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
}

export function generateGallery(outputDir: string, manifest: BrandkitManifest): void {
  const galleryDir = join(outputDir, 'gallery');
  const galleryPath = join(galleryDir, 'index.html');

  const styleGroups = groupHeroesByVariant(manifest.generated.heroes);
  const styles = manifest.config.styles;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brandkit Gallery - ${manifest.input.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      color: #333;
    }
    .header {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { margin-bottom: 0.5rem; }
    .meta { color: #666; font-size: 0.9rem; }
    .styles {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    .style-group {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .style-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: capitalize;
    }
    .variants {
      display: grid;
      gap: 1rem;
    }
    .variant {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    .variant img {
      width: 100%;
      height: auto;
      display: block;
    }
    .variant-info {
      padding: 0.75rem;
      background: #f9f9f9;
      font-size: 0.85rem;
      color: #666;
    }
    .download-link {
      display: inline-block;
      margin-top: 0.5rem;
      color: #0066cc;
      text-decoration: none;
    }
    .download-link:hover {
      text-decoration: underline;
    }
    .icons-section, .social-section {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .icon-item {
      text-align: center;
    }
    .icon-item img {
      width: 64px;
      height: 64px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 8px;
    }
    .social-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .social-item img {
      width: 100%;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Brandkit Gallery</h1>
    <div class="meta">
      <strong>Brand:</strong> ${manifest.input.name}<br>
      ${manifest.input.tagline ? `<strong>Tagline:</strong> ${manifest.input.tagline}<br>` : ''}
      <strong>Created:</strong> ${new Date(manifest.timestamp).toLocaleString('en-US')}
    </div>
  </div>

  <div class="styles">
    ${styles.map((style) => renderStyleSection(style, styleGroups, outputDir)).join('')}
  </div>

  ${renderIconsSection(manifest.generated.icons, outputDir)}
  ${renderSocialSection(manifest.generated.social, outputDir)}
</body>
</html>
`;

  writeFileSync(galleryPath, html, 'utf-8');
  console.log(`  Gallery created: ${galleryPath}`);
}
