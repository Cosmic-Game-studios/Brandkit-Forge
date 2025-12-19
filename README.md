<p align="center">
  <img src="assets/logo-placeholder.png" alt="Brandkit Forge" width="120" height="120" />
</p>

<h1 align="center">Brandkit Forge</h1>

<p align="center">
  <strong>One logo in. A complete brand asset pack out.</strong>
</p>

<p align="center">
  <a href="https://github.com/Cosmic-Game-studios/Brandkit-Forge/actions"><img src="https://img.shields.io/github/actions/workflow/status/Cosmic-Game-studios/Brandkit-Forge/ci.yml?branch=main&style=flat-square" alt="Build Status" /></a>
  <a href="https://www.npmjs.com/package/brandkit-forge"><img src="https://img.shields.io/npm/v/brandkit-forge?style=flat-square&color=cb3837" alt="npm version" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT" /></a>
  <a href="https://github.com/Cosmic-Game-studios/Brandkit-Forge/stargazers"><img src="https://img.shields.io/github/stars/Cosmic-Game-studios/Brandkit-Forge?style=flat-square" alt="GitHub Stars" /></a>
  <a href="https://github.com/Cosmic-Game-studios/Brandkit-Forge/issues"><img src="https://img.shields.io/github/issues/Cosmic-Game-studios/Brandkit-Forge?style=flat-square" alt="GitHub Issues" /></a>
  <a href="https://twitter.com/cosmicgamestudios"><img src="https://img.shields.io/twitter/follow/cosmicgamestudios?style=flat-square&logo=twitter" alt="Twitter Follow" /></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#api-reference">API</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="assets/demo.gif" alt="Brandkit Forge Demo" width="800" />
</p>

---

## Overview

**Brandkit Forge** is an AI-powered brand asset generator that transforms a single logo into a complete, production-ready brand kit. Built on OpenAI's `gpt-image-1.5` model, it generates backgrounds, hero compositions, icons, and social media assets in multiple styles—all with a single command or through an intuitive web interface.

Perfect for startups, indie developers, agencies, and anyone who needs professional brand assets fast.

```bash
npx brandkit-forge --logo logo.png --name "Acme Corp" --styles "minimal,neon,noir"
```

## Features

<table>
<tr>
<td width="50%">

### AI-Powered Generation
- **Smart Backgrounds** — Style-aware backgrounds that complement your brand
- **Hero Compositions** — Logo placement with optional tagline integration
- **Multiple Styles** — Minimal, Neon, Clay, Blueprint, and custom styles
- **Quality Presets** — Core, Soft, Bold, Noir aesthetic presets

</td>
<td width="50%">

### Production Ready
- **Icon Pack** — 16px to 1024px icons, favicon included
- **Social Assets** — OG images, Twitter/X cards, ready to deploy
- **Multiple Formats** — PNG, WebP, JPEG export options
- **ZIP Export** — One-click download of all assets

</td>
</tr>
<tr>
<td width="50%">

### Developer Experience
- **CLI & Web UI** — Use however you prefer
- **REST API** — Integrate into your workflow
- **Real-time Progress** — SSE-powered live updates
- **Cost Tracking** — Live API cost estimation

</td>
<td width="50%">

### Enterprise Features
- **Caching** — Skip regeneration of identical requests
- **Dry Run Mode** — Preview prompts without API calls
- **Full Manifest** — Complete audit trail in JSON
- **TypeScript** — Fully typed, modern codebase

</td>
</tr>
</table>

## Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **OpenAI API Key** with image generation access
- **npm** or **yarn** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/Cosmic-Game-studios/Brandkit-Forge.git
cd Brandkit-Forge

# Install dependencies
npm install

# Build the project
npm run build

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Your First Brand Kit

```bash
# Generate a complete brand kit
npm run forge -- \
  --logo ./your-logo.png \
  --name "Your Brand" \
  --tagline "Your amazing tagline" \
  --styles "minimal,neon,blueprint" \
  --quality high
```

### Web Interface

```bash
# Start development server
npm run dev:web

# Open http://localhost:3000
```

## Documentation

### Table of Contents

- [CLI Reference](#cli-reference)
- [Web UI Guide](#web-ui-guide)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Prompt Presets](#prompt-presets)
- [Custom Styles](#custom-styles)
- [Output Structure](#output-structure)
- [Cost Estimation](#cost-estimation)
- [Caching](#caching)
- [Architecture](#architecture)

---

### CLI Reference

```bash
brandkit-forge [options]
```

#### Required Options

| Option | Description |
|--------|-------------|
| `--logo <path>` | Path to your logo file (PNG, WebP, or JPEG) |
| `--name <name>` | Your brand name |

#### Optional Options

| Option | Description | Default |
|--------|-------------|---------|
| `--tagline <text>` | Brand tagline | — |
| `--colors <colors>` | Comma-separated hex colors | Auto-detected |
| `--styles <styles>` | Comma-separated style names | `minimal,neon,clay,blueprint` |
| `--preset <preset>` | Visual preset (`core\|soft\|bold\|noir`) | `core` |
| `-n <number>` | Variants per style | `2` |
| `--out <dir>` | Output directory | `./out` |
| `--format <fmt>` | Output format (`png\|webp\|jpeg`) | `png` |
| `--quality <q>` | Generation quality (`low\|medium\|high\|auto`) | `high` |
| `--dry-run` | Preview prompts without API calls | `false` |
| `--no-cache` | Disable caching | `false` |

#### Examples

```bash
# Minimal setup
brandkit-forge --logo logo.png --name "Acme"

# Full customization
brandkit-forge \
  --logo ./assets/logo.png \
  --name "Side Quest" \
  --tagline "Go outside. Level up." \
  --colors "#6D28D9,#06B6D4" \
  --styles "minimal,neon,blueprint" \
  --preset bold \
  -n 3 \
  --out ./brand-assets \
  --format webp \
  --quality high

# Dry run to preview prompts
brandkit-forge --logo logo.png --name "Test" --dry-run
```

---

### Web UI Guide

The web interface provides a visual, drag-and-drop experience for generating brand kits.

#### Starting the Server

```bash
# Development mode (hot reload)
npm run dev:web

# Production mode
npm run build:web
npm run start:web
```

#### Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 3001 | http://localhost:3001 |

#### Features

- **Drag & Drop** — Upload your logo with drag and drop
- **Live Preview** — See selected styles and settings in real-time
- **Cost Estimation** — View estimated API costs before generation
- **Progress Tracking** — Real-time progress with SSE updates
- **Gallery View** — Browse and download generated assets
- **ZIP Export** — Download everything in one click

---

### API Reference

The REST API enables integration with external tools and workflows.

#### Base URL

```
http://localhost:3001/api
```

#### Endpoints

##### Create Job

```http
POST /api/jobs
Content-Type: multipart/form-data
```

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Logo image file |
| `config` | JSON | Configuration object |

**Config Object:**

```json
{
  "name": "Brand Name",
  "tagline": "Optional tagline",
  "colors": "#6D28D9,#06B6D4",
  "styles": "minimal,neon",
  "preset": "core",
  "n": "2",
  "format": "png",
  "quality": "high",
  "apiKey": "sk-..."
}
```

**Response:**

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

##### Subscribe to Progress

```http
GET /api/jobs/:id/events
Accept: text/event-stream
```

**Event Types:**

```javascript
// Progress message
{ "message": "Generating background for minimal style..." }

// Cost update
{ "cost": { "totalCost": 0.25, "apiCalls": 1, "breakdown": { ... } } }

// Completion
{ "status": "completed" }
```

##### Get Result

```http
GET /api/jobs/:id/result
```

**Response:**

```json
{
  "manifest": { ... },
  "files": [
    { "path": "variants/minimal/0/hero-landscape.png", "url": "..." }
  ],
  "outputDir": "/path/to/output"
}
```

##### Download Files

```http
GET /api/jobs/:id/files/:path
GET /api/jobs/:id/download  # ZIP archive
```

---

### Configuration

#### Environment Variables

Create a `.env` file in the project root:

```env
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional
PORT=3001                    # API server port
NODE_ENV=development         # development | production
```

#### Project Configuration

Configuration can be provided via CLI flags, environment variables, or a `brandkit.config.json` file:

```json
{
  "defaults": {
    "quality": "high",
    "format": "png",
    "styles": ["minimal", "neon", "clay", "blueprint"],
    "preset": "core",
    "n": 2
  },
  "cache": {
    "enabled": true,
    "directory": ".cache"
  }
}
```

---

### Prompt Presets

Presets control the overall visual aesthetic while preserving your chosen styles.

| Preset | Description | Best For |
|--------|-------------|----------|
| `core` | Ultra-premium, cinematic, hero-grade polish | Product launches, premium brands |
| `soft` | Luminous luxury with dreamy softness | Lifestyle, wellness, creative |
| `bold` | Maximum contrast with bold energy | Gaming, tech startups, sports |
| `noir` | Dark, sleek, cinematic intensity | Luxury, finance, entertainment |

---

### Custom Styles

Beyond the built-in styles, you can create custom styles with your own prompts.

#### Via Web UI

1. Click "Add custom style" in the Styles section
2. Enter a name and description prompt
3. The style will be added to your selection

#### Via API

Include custom styles in the config:

```json
{
  "customStyles": {
    "retro-wave": "synthwave aesthetic, neon grid, 80s retro futurism, purple and cyan glow",
    "organic": "natural textures, earthy tones, botanical elements, sustainable feel"
  }
}
```

---

### Output Structure

Generated assets follow a consistent directory structure:

```
out/
└── 2024-01-15T10-30-00-000Z/
    ├── brandkit.json              # Complete manifest
    ├── gallery/
    │   └── index.html             # Visual gallery
    ├── icons/
    │   ├── favicon-16.png
    │   ├── favicon-32.png
    │   ├── app-icon-180.png
    │   ├── app-icon-192.png
    │   ├── app-icon-512.png
    │   └── app-icon-1024.png
    ├── social/
    │   ├── og-1200x630.png        # Open Graph
    │   └── x-1600x900.png         # Twitter/X
    └── variants/
        ├── minimal/
        │   ├── 0/
        │   │   ├── background.png
        │   │   ├── hero-landscape.png
        │   │   └── hero-square.png
        │   └── 1/
        │       └── ...
        ├── neon/
        │   └── ...
        └── blueprint/
            └── ...
```

---

### Cost Estimation

Brandkit Forge provides real-time cost tracking based on OpenAI's `gpt-image-1.5` pricing.

#### Pricing (December 2025)

| Quality | Square (1024×1024) | Landscape (1536×1024) |
|---------|-------------------|----------------------|
| Low | $0.01 | $0.015 |
| Medium | $0.04 | $0.06 |
| High | $0.17 | $0.25 |

#### Cost Formula

```
Cost = Styles × Variants × (1 background + 2 heroes) × Price per image
```

**Example:** 4 styles × 2 variants × 3 images × $0.25 = **$6.00** (high quality)

> **Note:** Actual costs may vary based on OpenAI's token-based pricing for prompts.

---

### Caching

Brandkit Forge caches generated images to avoid redundant API calls.

#### How It Works

1. Each generation request is hashed based on prompt + settings
2. If a matching hash exists, the cached image is returned
3. Cache is stored in `.cache/` directory

#### Cache Management

```bash
# Disable cache for a single run
brandkit-forge --logo logo.png --name "Test" --no-cache

# Clear cache manually
rm -rf .cache/
```

---

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Web Frontend                             │
│                    (React + Vite + TypeScript)                   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP/SSE
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Server                               │
│                   (Fastify + TypeScript)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │    Jobs     │  │      SSE Events         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Core Engine                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Forge     │  │   Prompts   │  │        Cache            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Pipeline                                  │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────────┐   │
│  │  Backgrounds  │  │     Heroes     │  │   Export/Resize   │   │
│  │   (Generate)  │  │     (Edit)     │  │     (Sharp)       │   │
│  └───────────────┘  └────────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     OpenAI Images API                            │
│                       (gpt-image-1.5)                            │
└─────────────────────────────────────────────────────────────────┘
```

#### Key Components

| Component | Description |
|-----------|-------------|
| `src/core/forge.ts` | Main orchestration engine |
| `src/lib/openai.ts` | OpenAI API client and cost calculation |
| `src/lib/prompts.ts` | Prompt generation and templates |
| `src/pipeline/` | Background, hero, and export pipelines |
| `src/server/` | Fastify API server |
| `web/` | React frontend application |

---

## Contributing

We love contributions! Whether it's bug fixes, new features, or documentation improvements.

### Development Setup

```bash
# Clone and install
git clone https://github.com/Cosmic-Game-studios/Brandkit-Forge.git
cd Brandkit-Forge
npm install

# Start development servers
npm run dev:web     # Backend + Frontend

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

### Contribution Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes with clear messages
4. **Push** to your fork
5. **Open** a Pull Request

### Pull Request Checklist

- [ ] Code follows the existing style
- [ ] TypeScript types are properly defined
- [ ] No console errors or warnings
- [ ] README updated if needed
- [ ] Tested locally

---

## Troubleshooting

<details>
<summary><strong>"OPENAI_API_KEY not found"</strong></summary>

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=sk-your-key-here
```

Or pass it via the Web UI's API key field.
</details>

<details>
<summary><strong>"Logo file not found"</strong></summary>

- Verify the file path is correct
- Use absolute paths or paths relative to your working directory
- Supported formats: PNG, WebP, JPEG
</details>

<details>
<summary><strong>API rate limits</strong></summary>

OpenAI has rate limits on image generation. If you hit limits:
- Reduce the number of variants (`-n`)
- Use fewer styles
- Wait and retry
</details>

<details>
<summary><strong>High API costs</strong></summary>

- Use `--quality low` or `--quality medium` for drafts
- Reduce variants with `-n 1`
- Use `--dry-run` to preview before generating
</details>

---

## Roadmap

- [ ] **v1.1** — Figma plugin export
- [ ] **v1.2** — Batch processing for multiple logos
- [ ] **v1.3** — Prompt library and community presets
- [ ] **v2.0** — Team workspaces and project history
- [ ] **v2.1** — Design system integration (Tailwind, CSS vars)

See the [open issues](https://github.com/Cosmic-Game-studios/Brandkit-Forge/issues) for feature requests.

---

## Security

- **API Keys** — Never committed to the repository
- **File Validation** — Only image files accepted
- **Sandboxed Jobs** — Each job runs in isolated temp directory
- **No Data Retention** — Generated files are not stored permanently

Report security vulnerabilities to [security@cosmic-game-studios.com](mailto:security@cosmic-game-studios.com).

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

```
MIT License

Copyright (c) 2025 Cosmic Game Studios

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## Acknowledgements

- [OpenAI](https://openai.com) — Images API (`gpt-image-1.5`)
- [Sharp](https://sharp.pixelplumbing.com/) — High-performance image processing
- [Fastify](https://www.fastify.io/) — Fast and low overhead web framework
- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Next generation frontend tooling
- [TypeScript](https://www.typescriptlang.org/) — Type safety

---

<p align="center">
  <sub>Built with passion by <a href="https://github.com/Cosmic-Game-studios">Cosmic Game Studios</a></sub>
</p>

<p align="center">
  <a href="https://github.com/Cosmic-Game-studios/Brandkit-Forge">
    <img src="https://img.shields.io/badge/Star_on_GitHub-⭐-yellow?style=for-the-badge" alt="Star on GitHub" />
  </a>
</p>
