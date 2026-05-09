# VocabLearn

Extract vocabulary from movies and TV shows based on your language level.

## Features
- Search any movie/TV show
- Filter vocabulary by language level (A1-C2)
- Export to Anki flashcards
- Learn from native content

## Tech Stack
- Next.js 15
- React 18
- TypeScript
- PostgreSQL
- Stripe (payments)

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm

### Installation

```bash
# 1. Clone repo
git clone https://github.com/YOUR_USERNAME/vocab-learn.git
cd vocab-learn

# 2. Install dependencies
pnpm install

# 3. Set up database
pnpm prisma migrate dev

# 4. Copy env file
cp .env.example .env.local
# Fill in your API keys

# 5. Start dev server
pnpm dev
```

Visit http://localhost:3000

## Development

```bash
pnpm dev      # Start dev server
pnpm build    # Build for production
pnpm lint     # Check code quality
```

## Deployment

Deployed on Vercel. Push to `main` branch to auto-deploy.

## License

MIT