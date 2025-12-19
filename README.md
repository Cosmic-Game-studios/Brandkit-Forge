# Brandkit Forge

One logo in -> complete launch asset pack out.

Brandkit Forge is a CLI tool and Web App that turns a single logo into a full
brand asset pack using the OpenAI Images API (model `gpt-image-1.5`). It is
ideal for quick launches, prototypes, and brand exploration.

If this project helps you, consider giving it a star. It signals demand and
keeps the roadmap moving.

## Contents

- [Why Brandkit Forge](#why-brandkit-forge)
- [What you get](#what-you-get)
- [Quickstart](#quickstart)
- [Web UI](#web-ui)
- [CLI usage](#cli-usage)
- [Prompt presets](#prompt-presets)
- [API endpoints](#api-endpoints)
- [How it works](#how-it-works)
- [Output structure](#output-structure)
- [Manifest](#manifest)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Credits](#credits)

## Why Brandkit Forge

- Launch faster: generate a full set of brand assets from one logo.
- Stay consistent: styles, sizes, and exports stay aligned across outputs.
- Keep control: prompts, parameters, and outputs are fully transparent.

## What you get

- Backgrounds in multiple styles
- Hero compositions with logo placement and optional tagline
- Icons in common sizes (16px to 1024px)
- Social media assets (OG image and X/Twitter card)
- Static HTML gallery with download links
- Full manifest (`brandkit.json`) with prompts and parameters
- Prompt presets to steer the overall look
- Web UI with drag and drop, live progress, and a gallery view
- REST API for workflow integration

## Quickstart

```bash
# 1. Clone
git clone <repo-url>
cd brandkit-forge

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Create .env
echo "OPENAI_API_KEY=your_openai_api_key" > .env

# 5. Run
npm run forge -- --logo ./assets/logo.png --name "Side Quest" --tagline "Go outside. Level up."
```

## Web UI

```bash
# Development (backend + frontend)
npm run dev:web

# Build for production
npm run build:web

# Start production server
npm run start:web
```

The Web UI runs on `http://localhost:3000` (frontend) and
`http://localhost:3001` (backend API).

## CLI usage

### Base command

```bash
brandkit-forge --logo <path> --name <name> [options]
```

### Example

```bash
brandkit-forge \
  --logo ./assets/logo.png \
  --name "Side Quest" \
  --tagline "Go outside. Level up." \
  --colors "#6D28D9,#06B6D4" \
  --styles "minimal,neon,blueprint" \
  --n 2 \
  --out ./out \
  --format png \
  --quality high
```

### Options

| Option | Description | Default | Required |
|--------|-------------|---------|----------|
| `--logo <path>` | Path to logo (png/webp/jpg) | - | yes |
| `--name <name>` | Brand name | - | yes |
| `--tagline <text>` | Tagline (optional) | - | no |
| `--colors <colors>` | Comma-separated colors (#RRGGBB) | - | no |
| `--styles <styles>` | Comma-separated styles | `minimal,neon,clay,blueprint` | no |
| `--preset <preset>` | Prompt preset (`core|soft|bold|noir`) | `core` | no |
| `-n <number>` | Variants per style | `2` | no |
| `--out <dir>` | Output directory | `./out` | no |
| `--format <format>` | `png|webp|jpeg` | `png` | no |
| `--quality <quality>` | `low|medium|high|auto` | `high` | no |
| `--dry-run` | Show prompts and plan without API calls | `false` | no |
| `--no-cache` | Disable caching | `false` | no |

## API endpoints

- `POST /api/jobs` - Create a new job (multipart/form-data: file + config JSON)
- `GET /api/jobs/:id/events` - Server-Sent Events for progress
- `GET /api/jobs/:id/result` - Job result (manifest + file list)
- `GET /api/jobs/:id/files/*` - File serving
- `GET /api/jobs/:id/download` - ZIP download of the complete output

## Prompt presets

Presets steer the overall look while keeping your chosen styles. Available presets:

- `core`: ultra-premium, cinematic, hero-grade polish
- `soft`: luminous luxury with dreamy softness
- `bold`: maximum contrast with bold energy
- `noir`: dark, sleek, cinematic intensity

## How it works

1. Background generation (Generate API)
   - Style template plus optional brand colors
   - Safety constraints: background only, no text

2. Hero composition (Edit API)
   - Logo stays unchanged
   - Optional tagline in a clean sans-serif

3. Export and resizing
   - Icons and social formats generated from hero assets

4. Gallery generation
   - Static HTML gallery for review and download

## Output structure

```
out/
|-- <timestamp>/
|   |-- brandkit.json          # Manifest with prompts and parameters
|   |-- icons/
|   |   |-- app-icon-1024.png
|   |   |-- app-icon-512.png
|   |   |-- ...
|   |   `-- favicon-16.png
|   |-- social/
|   |   |-- og-1200x630.png
|   |   `-- x-1600x900.png
|   |-- variants/
|   |   |-- minimal/
|   |   |   |-- 0/
|   |   |   |   |-- background.png
|   |   |   |   |-- hero-landscape.png
|   |   |   |   |-- hero-square.png
|   |   |   `-- 1/
|   |   |       `-- ...
|   |   |-- neon/
|   |   |   `-- ...
|   |   `-- ...
|   `-- gallery/
|       `-- index.html
```

## Manifest

The manifest contains all key information:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "input": {
    "logo": "./assets/logo.png",
    "name": "Side Quest",
    "tagline": "Go outside. Level up.",
    "colors": ["#6D28D9", "#06B6D4"]
  },
  "config": {
    "styles": ["minimal", "neon", "blueprint"],
    "n": 2,
    "format": "png",
    "quality": "high"
  },
  "prompts": {
    "backgrounds": {
      "minimal-0": "minimalist, clean...",
      "minimal-1": "..."
    },
    "edits": {
      "minimal-0-landscape": "Keep the provided logo...",
      "...": "..."
    }
  },
  "generated": {
    "backgrounds": ["..."],
    "heroes": ["..."],
    "icons": ["..."],
    "social": ["..."]
  },
  "outputDir": "./out/2024-01-15T10-30-00-000Z"
}
```

## Screenshots

Add screenshots to highlight the output quality. Recommended:

- Web UI create page
- Results gallery with multiple styles
- Icon grid
- Social assets (OG and X/Twitter)

## Roadmap

- Preset packs for startups and product categories
- Prompt library with shareable presets
- Batch processing for multiple logos
- Export to Figma and design systems
- Team and project history

## Contributing

Contributions are welcome.

1. Fork the repo
2. Create a feature branch
3. Commit with clear messages
4. Open a pull request with context and screenshots

## Troubleshooting

### "OPENAI_API_KEY not found"

- Create a `.env` file in the project root
- Add: `OPENAI_API_KEY=your_key`

### "Logo file not found"

- Check the logo path
- Use a relative or absolute path

### "Unsupported format"

- Supported formats: `png`, `webp`, `jpeg`
- Default is `png`

## License

MIT

## Credits

- Powered by the OpenAI Images API (`gpt-image-1.5`)
- Built with TypeScript, Sharp, Commander, Fastify, React, Vite
