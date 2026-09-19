# Flix | Gurawa

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/github/package-json/dependency-version/viperadnan-git/debridui/next?logo=next.js&logoColor=white&label=Next.js&color=black" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/github/package-json/dependency-version/viperadnan-git/debridui/dev/typescript?logo=typescript&logoColor=white&label=TypeScript&color=3178C6" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/github/package-json/dependency-version/viperadnan-git/debridui/dev/tailwindcss?logo=tailwind-css&logoColor=white&label=Tailwind&color=06B6D4" alt="Tailwind CSS" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/viperadnan-git/debridui?color=blue" alt="License" /></a>
</p>

A modern debrid client for managing your files, discovering trending movies and shows — with addon support and streaming to your preferred media player.

> [!IMPORTANT]
> This project does not provide, host, or stream any content. Flix | Gurawa is a client interface that connects to third-party debrid service APIs to display authorized users' private files and content. [Read full disclaimer](DISCLAIMER.md).

## Comparison: Flix | Gurawa vs Original DebridUI

| Feature / Area | Original DebridUI | Flix \| Gurawa |
| :--- | :--- | :--- |
| **Media Metadata Provider** | Trakt.tv (API locked behind paid paywall) | **TMDB (The Movie Database)** — free, reliable, with native external IMDb ID mapping |
| **Stream Link Security** | Raw TorBox / Debrid API tokens exposed directly in URLs | **Obfuscated & Proxied (`/api/stream`)** — tokens encrypted with AES-256-GCM; TorBox CDN redirects resolved server-side |
| **Addon Access Control** | Open to all registered users without restriction | **Admin Password Protected** — requires admin authentication challenge to view, add, or reorder addons |
| **User Registration** | Open email registration (or disable flag only) | **Admin Password Required** — registration gated by `ADMIN_PASSWORD` with server-side validation |
| **Admin Privileges** | No distinction between users | **Dynamic First-User Admin Detection** — first user created in Neon DB dynamically recognized as admin at runtime |
| **Landing Experience** | Public marketing page with "Get Started" CTA | **Direct Authentication Redirect** — visits to `/` redirect immediately to `/login` or `/dashboard` |
| **TMDB Configuration** | Required manual user entry of TMDB API key in Settings UI | **Baked-In Default** — server `TMDB_API_KEY` works automatically for all accounts; UI input removed |
| **Playback & Download Flow** | In-browser media player | Streamlined **"Copy Link"** (with external player reminder) and **direct "Download"** |
| **Branding & Title** | DebridUI | **Flix \| Gurawa** |
| **UI Accent Color** | Yellow-gold (`oklch(... 89)`) | **Royal Violet (`#7160db`)** across light & dark themes |
| **Sensitive Data Display** | Raw usernames and email addresses visible on accounts page | **Privacy-masked** credentials across account cards and switchers |
| **Dashboard Layout** | Generic catalog rails | Cleaned up, focused media discovery and search |

## Features

### File Management

- **Multi-account support** - Manage multiple debrid accounts seamlessly
- **Real-time file tracking** - Live updates for download progress and status
- **Advanced file explorer** - Tree view, search, sorting, and batch operations
- **Direct streaming** - Stream to VLC, IINA, MPV, PotPlayer, Kodi, MX Player
- **Drag & drop uploads** - Upload files and links easily

### Media Discovery

- **TMDB catalogue** - Browse trending movies and TV shows (powered by The Movie Database)
- **Smart search** - Find content across multiple sources
- **Media details** - Cast info, ratings, trailers, and recommendations
- **Season/episode browser** - Navigate TV shows with ease

### User Experience

- **Dark/Light mode** - Automatic theme switching
- **Responsive design** - Works on desktop, tablet, and mobile
- **Keyboard shortcuts** - Quick navigation with Cmd/Ctrl+K search
- **Progress tracking** - Visual indicators for active downloads
- **Context menus** - Right-click actions for quick operations

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL 14+
- A debrid account (Real-Debrid, TorBox, AllDebrid supported)

### Configuration

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

See [`.env.example`](.env.example) for all available environment variables and their descriptions.

### Installation

```bash
# Clone the repository
git clone https://github.com/viperadnan-git/debridui
cd debridui

# Install dependencies
bun install

# Configure environment (see Configuration section above)
cp .env.example .env.local

# Set up database
bunx drizzle-kit push

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

### Deployment

**Vercel (Recommended):**

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)
4. Configure environment variables
5. Deploy

**Standalone (Self-hosted):**

This app uses Next.js standalone output for optimized self-hosting.

**Environment Variables:**
Ensure all required environment variables from [`.env.example`](.env.example) are set in your production environment.

```bash
# Build the app
bun run build

# Static files are automatically copied to .next/standalone via postbuild script

# Start the server
NODE_ENV=production node .next/standalone/server.js
```

## CORS Proxy

Addons require a CORS proxy to function. Deploy `proxy.worker.js` to Cloudflare Workers:

1. Create a [Cloudflare Workers](https://workers.cloudflare.com) account
2. Click "Create Application" → "Create Worker"
3. Replace worker code with contents of `proxy.worker.js`
4. Update `ALLOWED_ORIGINS` array with your domain(s)
5. Deploy and copy the worker URL
6. Add to `.env.local`: `NEXT_PUBLIC_CORS_PROXY_URL=https://your.worker.workers.dev?url=`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Disclaimer

> **⚠️ Important Legal Notice**: This project is a client interface only and does not host, store, or distribute any content. Users are solely responsible for ensuring their use complies with all applicable laws, copyright regulations, and third-party service terms. By using this software, you acknowledge and agree to the [full disclaimer](DISCLAIMER.md).

## License

GPL-3.0-or-later - see [LICENSE](LICENSE) file for details.
