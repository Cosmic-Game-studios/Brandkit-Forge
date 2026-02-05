import { writeFileSync, mkdirSync } from 'fs';
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

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderVariantCard(heroPath: string, baseDir: string, style: string): string {
  const filename = heroPath.split('/').pop() || '';
  const label = getHeroLabel(filename);
  const relativePath = toWebPath(baseDir, heroPath);

  return `
    <div class="variant" onclick="openLightbox('${escapeHtml(relativePath)}', '${escapeHtml(style)} - ${label}')">
      <img src="${relativePath}" alt="${escapeHtml(style)} ${label}" loading="lazy">
      <div class="variant-info">
        <span class="variant-label">${label}</span>
        <span class="variant-file">${filename}</span>
        <a href="${relativePath}" download class="download-btn" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>
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
      <div class="style-header">
        <div class="style-badge">${escapeHtml(style)}</div>
        <span class="style-count">${variants.length} asset${variants.length !== 1 ? 's' : ''}</span>
      </div>
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
    <section class="asset-section" id="icons">
      <div class="section-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Icons &amp; Favicons
        </h2>
        <span class="section-count">${iconPaths.length} sizes</span>
      </div>
      <div class="icons-grid">
        ${iconPaths
          .map((iconPath) => {
            const name = iconPath.split('/').pop() || '';
            const relativePath = toWebPath(baseDir, iconPath);
            return `
              <div class="icon-item">
                <img src="${relativePath}" alt="${escapeHtml(name)}" loading="lazy">
                <div class="icon-name">${name}</div>
                <a href="${relativePath}" download class="icon-download">Download</a>
              </div>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

function renderSocialSection(socialPaths: string[], baseDir: string): string {
  if (socialPaths.length === 0) {
    return '';
  }

  return `
    <section class="asset-section" id="social">
      <div class="section-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          Social Media Assets
        </h2>
        <span class="section-count">${socialPaths.length} assets</span>
      </div>
      <div class="social-grid">
        ${socialPaths
          .map((socialPath) => {
            const name = socialPath.split('/').pop() || '';
            const relativePath = toWebPath(baseDir, socialPath);
            return `
              <div class="social-item" onclick="openLightbox('${escapeHtml(relativePath)}', '${escapeHtml(name)}')">
                <img src="${relativePath}" alt="${escapeHtml(name)}" loading="lazy">
                <div class="social-info">
                  <span>${name}</span>
                  <a href="${relativePath}" download class="download-btn" onclick="event.stopPropagation()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </a>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

export function generateGallery(outputDir: string, manifest: BrandkitManifest): void {
  const galleryDir = join(outputDir, 'gallery');
  mkdirSync(galleryDir, { recursive: true });
  const galleryPath = join(galleryDir, 'index.html');

  const styleGroups = groupHeroesByVariant(manifest.generated.heroes);
  const styles = manifest.config.styles;

  const totalAssets =
    manifest.generated.backgrounds.length +
    manifest.generated.heroes.length +
    manifest.generated.icons.length +
    manifest.generated.social.length;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brandkit Gallery - ${escapeHtml(manifest.input.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0a0b;
      --surface: #141416;
      --surface-hover: #1c1c1f;
      --border: rgba(255,255,255,0.08);
      --border-strong: rgba(255,255,255,0.15);
      --text: #e4e4e7;
      --text-muted: #71717a;
      --text-subtle: #52525b;
      --accent: #0ea5e9;
      --accent-glow: rgba(14,165,233,0.15);
      --teal: #14b8a6;
      --orange: #f97316;
      --radius: 12px;
      --radius-sm: 8px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(249,115,22,0.06) 100%);
      border-bottom: 1px solid var(--border);
      padding: 2.5rem 2rem;
    }
    .header-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .brand-info h1 {
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--teal), var(--orange));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }
    .brand-info .subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .stats-grid {
      display: flex;
      gap: 1.5rem;
    }
    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 1rem 1.25rem;
      text-align: center;
      min-width: 90px;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent);
    }
    .stat-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .nav-bar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(20px);
    }
    .nav-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      gap: 0;
    }
    .nav-tab {
      padding: 0.875rem 1.25rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
    }
    .nav-tab:hover, .nav-tab.active {
      color: var(--text);
      border-bottom-color: var(--accent);
    }

    .main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .styles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .style-group {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .style-group:hover {
      border-color: var(--border-strong);
    }
    .style-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    .style-badge {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: linear-gradient(135deg, var(--teal), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .style-count {
      font-size: 0.75rem;
      color: var(--text-subtle);
    }
    .variants {
      display: grid;
      gap: 1px;
      background: var(--border);
    }
    .variant {
      background: var(--surface);
      cursor: pointer;
      transition: background 0.2s;
    }
    .variant:hover {
      background: var(--surface-hover);
    }
    .variant img {
      width: 100%;
      height: auto;
      display: block;
    }
    .variant-info {
      padding: 0.625rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
    }
    .variant-label {
      color: var(--text);
      font-weight: 500;
    }
    .variant-file {
      color: var(--text-subtle);
      flex: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .download-btn {
      color: var(--text-muted);
      padding: 0.25rem;
      border-radius: 4px;
      transition: color 0.2s, background 0.2s;
      display: flex;
      align-items: center;
    }
    .download-btn:hover {
      color: var(--accent);
      background: var(--accent-glow);
    }

    .asset-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      margin-bottom: 1.5rem;
      overflow: hidden;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    .section-header h2 {
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section-header h2 svg {
      color: var(--accent);
    }
    .section-count {
      font-size: 0.75rem;
      color: var(--text-subtle);
      background: rgba(255,255,255,0.05);
      padding: 0.25rem 0.625rem;
      border-radius: 99px;
    }

    .icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 1px;
      background: var(--border);
      padding: 0;
    }
    .icon-item {
      background: var(--surface);
      text-align: center;
      padding: 1.25rem 0.75rem;
      transition: background 0.2s;
    }
    .icon-item:hover { background: var(--surface-hover); }
    .icon-item img {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }
    .icon-name {
      font-size: 0.65rem;
      color: var(--text-muted);
      word-break: break-all;
    }
    .icon-download {
      display: inline-block;
      margin-top: 0.375rem;
      font-size: 0.65rem;
      color: var(--accent);
      text-decoration: none;
    }
    .icon-download:hover { text-decoration: underline; }

    .social-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1px;
      background: var(--border);
    }
    .social-item {
      background: var(--surface);
      cursor: pointer;
      transition: background 0.2s;
    }
    .social-item:hover { background: var(--surface-hover); }
    .social-item img {
      width: 100%;
      display: block;
    }
    .social-info {
      padding: 0.625rem 1rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .lightbox {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(0,0,0,0.92);
      backdrop-filter: blur(20px);
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
    .lightbox.active { display: flex; }
    .lightbox-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: rgba(255,255,255,0.1);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .lightbox-close:hover { background: rgba(255,255,255,0.2); }
    .lightbox-content {
      max-width: 90vw;
      max-height: 85vh;
      text-align: center;
    }
    .lightbox-content img {
      max-width: 100%;
      max-height: 80vh;
      border-radius: var(--radius);
      box-shadow: 0 30px 80px rgba(0,0,0,0.5);
    }
    .lightbox-title {
      margin-top: 1rem;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .footer {
      text-align: center;
      padding: 3rem 2rem;
      color: var(--text-subtle);
      font-size: 0.8rem;
      border-top: 1px solid var(--border);
    }
    .footer a {
      color: var(--accent);
      text-decoration: none;
    }

    @media (max-width: 640px) {
      .header { padding: 1.5rem 1rem; }
      .header-inner { flex-direction: column; }
      .stats-grid { width: 100%; justify-content: space-between; }
      .styles-grid { grid-template-columns: 1fr; }
      .main { padding: 1rem; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-inner">
      <div class="brand-info">
        <h1>${escapeHtml(manifest.input.name)} Brand Kit</h1>
        <div class="subtitle">
          ${manifest.input.tagline ? `${escapeHtml(manifest.input.tagline)} &mdash; ` : ''}
          Generated ${new Date(manifest.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${totalAssets}</div>
          <div class="stat-label">Total Assets</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${styles.length}</div>
          <div class="stat-label">Styles</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${manifest.config.n}</div>
          <div class="stat-label">Variants</div>
        </div>
      </div>
    </div>
  </div>

  <nav class="nav-bar">
    <div class="nav-inner">
      <a class="nav-tab active" onclick="showSection('heroes')">Heroes</a>
      ${manifest.generated.icons.length > 0 ? '<a class="nav-tab" onclick="showSection(\'icons\')">Icons</a>' : ''}
      ${manifest.generated.social.length > 0 ? '<a class="nav-tab" onclick="showSection(\'social\')">Social</a>' : ''}
    </div>
  </nav>

  <div class="main">
    <div id="section-heroes">
      <div class="styles-grid">
        ${styles.map((style) => renderStyleSection(style, styleGroups, outputDir)).join('')}
      </div>
    </div>

    <div id="section-icons" style="display:none;">
      ${renderIconsSection(manifest.generated.icons, outputDir)}
    </div>

    <div id="section-social" style="display:none;">
      ${renderSocialSection(manifest.generated.social, outputDir)}
    </div>
  </div>

  <div class="footer">
    Generated with <a href="https://github.com/Cosmic-Game-studios/Brandkit-Forge">Brandkit Forge</a> v2.0
  </div>

  <div class="lightbox" id="lightbox" onclick="closeLightbox()">
    <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
    <div class="lightbox-content" onclick="event.stopPropagation()">
      <img id="lightbox-img" src="" alt="">
      <div class="lightbox-title" id="lightbox-title"></div>
    </div>
  </div>

  <script>
    function openLightbox(src, title) {
      document.getElementById('lightbox-img').src = src;
      document.getElementById('lightbox-title').textContent = title;
      document.getElementById('lightbox').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('active');
      document.body.style.overflow = '';
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
    });

    function showSection(id) {
      ['heroes', 'icons', 'social'].forEach(function(s) {
        var el = document.getElementById('section-' + s);
        if (el) el.style.display = s === id ? 'block' : 'none';
      });
      document.querySelectorAll('.nav-tab').forEach(function(tab) {
        tab.classList.toggle('active', tab.textContent.trim().toLowerCase() === id);
      });
    }
  </script>
</body>
</html>
`;

  writeFileSync(galleryPath, html, 'utf-8');
  console.log(`  Gallery created: ${galleryPath}`);
}
