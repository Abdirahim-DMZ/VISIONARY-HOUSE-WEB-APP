# ExecutiveHub - Premium Executive Business Environment

A modern, production-ready Next.js website for ExecutiveHub, a premium executive ecosystem designed for founders, executives, and enterprises seeking excellence.

## Features

- **Premium Event Spaces** - Sophisticated venues for conferences, board meetings, and corporate gatherings
- **Executive Lounge Suite** - Premium relaxation spaces for executive comfort and private conversations
- **Virtual Office Services** - Professional business presence with mail handling and registered addresses
- **Professional Media Studios** - State-of-the-art facilities for podcasts and video production

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + ShadCN
- **Icons**: Lucide React
- **Fonts**: Inter (Sans) + Playfair Display (Serif)
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ or compatible runtime
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ecosystem-premier-hub
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
├── app/                   # Next.js App Router pages
│   ├── about/            # About page
│   ├── book/             # Booking page
│   ├── contact/          # Contact page
│   ├── gallery/          # Gallery page
│   ├── policies/         # Policies page
│   ├── services/         # Services page
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Home page
│   ├── not-found.tsx     # 404 page
│   └── globals.css       # Global styles
├── components/           
│   ├── layout/           # Layout components (Header, Footer)
│   ├── providers/        # React providers
│   └── ui/               # Reusable UI components (ShadCN)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
│   └── assets/           # Images and media
└── next.config.ts        # Next.js configuration
```

## Key Pages

- **Home** (`/`) - Hero section, services overview, testimonials
- **About** (`/about`) - Company story, values, mission
- **Services** (`/services`) - Detailed service offerings
- **Gallery** (`/gallery`) - Visual showcase of facilities
- **Book** (`/book`) - Booking form for reservations
- **Contact** (`/contact`) - Contact information and inquiry form
- **Policies** (`/policies`) - Legal policies and terms

## SEO & Performance

- Proper metadata and Open Graph tags on all pages
- Optimized images with Next.js Image component
- Semantic HTML structure
- Mobile-responsive design
- Fast page loads with Next.js optimizations
- Security headers configured

## Customization

### Colors

The color scheme uses a premium executive palette defined in `app/globals.css`:
- **Primary**: Deep charcoal navy (#1A1E2E)
- **Accent**: Warm champagne gold (#C9A054)
- **Background**: Soft cream (#FAF8F5)

### Fonts

- **Headings**: Playfair Display (Serif)
- **Body**: Inter (Sans-serif)

## License

All rights reserved © 2026 ExecutiveHub
