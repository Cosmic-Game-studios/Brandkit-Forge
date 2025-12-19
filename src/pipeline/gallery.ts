import { writeFileSync } from 'fs';
import { join } from 'path';
import type { BrandkitManifest } from '../types.js';

export function generateGallery(outputDir: string, manifest: BrandkitManifest): void {
  const galleryDir = join(outputDir, 'gallery');
  const galleryPath = join(galleryDir, 'index.html');

  const styles = manifest.config.styles;
  const heroes = manifest.generated.heroes;
  const styleGroups: Record<string, string[]> = {};
  for (const hero of heroes) {
    const match = hero.match(/variants[\\/]+([^\\/]+)[\\/]+(\d+)[\\/]+(.+)$/);
    if (match) {
      const [, style, idx] = match;
      const key = `${style}-${idx}`;
      if (!styleGroups[key]) {
        styleGroups[key] = [];
      }
      styleGroups[key].push(hero);
    }
  }

  const relativePath = (path: string) => {
    return path.replace(outputDir + '/', '');
  };

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
    ${styles.map(style => {
      const variants = Object.keys(styleGroups)
        .filter(key => key.startsWith(style + '-'))
        .map(key => styleGroups[key])
        .flat();

      if (variants.length === 0) return '';

      return `
        <div class="style-group">
          <div class="style-title">${style}</div>
          <div class="variants">
            ${variants.map(heroPath => {
              const filename = heroPath.split('/').pop() || '';
              const type = filename.includes('landscape') ? 'Landscape' : 'Square';
              return `
                <div class="variant">
                  <img src="${relativePath(heroPath)}" alt="${style} ${type}">
                  <div class="variant-info">
                    ${type} - ${filename}
                    <a href="${relativePath(heroPath)}" download class="download-link">Download</a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('')}
  </div>

  ${manifest.generated.icons.length > 0 ? `
    <div class="icons-section">
      <h2>Icons</h2>
      <div class="icons-grid">
        ${manifest.generated.icons.map(iconPath => {
          const name = iconPath.split('/').pop() || '';
          return `
            <div class="icon-item">
              <img src="${relativePath(iconPath)}" alt="${name}">
              <div style="font-size: 0.75rem; margin-top: 0.25rem;">${name}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : ''}

  ${manifest.generated.social.length > 0 ? `
    <div class="social-section">
      <h2>Social Media Assets</h2>
      <div class="social-grid">
        ${manifest.generated.social.map(socialPath => {
          const name = socialPath.split('/').pop() || '';
          return `
            <div class="social-item">
              <img src="${relativePath(socialPath)}" alt="${name}">
              <div style="padding: 0.5rem; font-size: 0.85rem;">${name}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : ''}
</body>
</html>
`;

  writeFileSync(galleryPath, html, 'utf-8');
  console.log(`  Gallery created: ${galleryPath}`);
}
