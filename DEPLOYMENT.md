# VocabLearn Deployment Guide

Choose one of the following deployment options. **Vercel is recommended** for easiest setup.

---

## 🚀 Option 1: Vercel (Recommended) - 15 minutes

Vercel is the official Next.js hosting platform with zero-config deployments.

### Prerequisites
- GitHub account (repo already connected)
- TMDB API key
- OpenAI API key
- PostgreSQL database URL

### Steps

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your GitHub repo (vocab-learn)
   - Click "Import"

3. **Configure Environment Variables**
   - In the "Environment Variables" section, add:
   ```
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=https://yourdomain.vercel.app
   DATABASE_URL=postgresql://user:password@host:5432/vocab_learn
   TMDB_API_KEY=your-tmdb-api-key
   OPENAI_API_KEY=sk-your-openai-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Visit your deployment URL

5. **Set Custom Domain (Optional)**
   - Go to "Settings" → "Domains"
   - Add your custom domain
   - Update DNS records (instructions provided)

### Database Setup for Vercel
You'll need a managed PostgreSQL database:

**Option A: Vercel PostgreSQL** (Easiest)
```
1. Go to "Storage" tab in Vercel dashboard
2. Click "Create Database"
3. Select "PostgreSQL"
4. Name: vocab-learn-db
5. Copy DATABASE_URL to environment variables
6. Click "Connect" → select your project
```

**Option B: External Database** (Railway, Render, etc.)
```
1. Sign up at railway.app or render.com
2. Create PostgreSQL database
3. Copy connection string
4. Add as DATABASE_URL in Vercel
```

### Run Migrations
```bash
# After deployment, run migrations
pnpm prisma migrate deploy
```

Or run via Vercel CLI:
```bash
vercel env pull  # Download environment variables
pnpm prisma migrate deploy
```

---

## 🐳 Option 2: Docker + Custom Server - 30 minutes

For complete control over your deployment.

### Prerequisites
- Docker installed
- Server with 2GB+ RAM
- PostgreSQL server running
- Domain name (optional)

### Steps

1. **Create Dockerfile**
   ```dockerfile
   # apps/web/Dockerfile
   FROM node:20-alpine
   
   WORKDIR /app
   
   # Install dependencies
   COPY package*.json ./
   RUN npm install -g pnpm && pnpm install
   
   # Copy code
   COPY . .
   
   # Build
   RUN pnpm build
   
   # Expose port
   EXPOSE 3000
   
   # Start
   CMD ["pnpm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     app:
       build: ./apps/web
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: postgresql://vocab:vocab@db:5432/vocab_learn
         NEXTAUTH_SECRET: your-secret-key
         NEXTAUTH_URL: https://yourdomain.com
         TMDB_API_KEY: your-tmdb-key
         OPENAI_API_KEY: your-openai-key
       depends_on:
         - db
   
     db:
       image: postgres:15-alpine
       environment:
         POSTGRES_USER: vocab
         POSTGRES_PASSWORD: vocab
         POSTGRES_DB: vocab_learn
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"
   
   volumes:
     postgres_data:
   ```

3. **Create .env file**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Edit with your actual keys
   ```

4. **Run Locally**
   ```bash
   docker-compose up -d
   # Access at http://localhost:3000
   ```

5. **Deploy to Server**
   ```bash
   # On your server:
   git clone https://github.com/yourusername/vocab-learn.git
   cd vocab-learn
   docker-compose up -d
   ```

6. **Set Up Nginx Reverse Proxy** (Optional, recommended)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🚂 Option 3: Railway.app - 20 minutes

Easiest alternative to Vercel with free tier.

### Steps

1. **Sign up at railway.app**
   - Connect your GitHub account

2. **Create New Project**
   - Click "Create New"
   - Select "Deploy from GitHub"
   - Choose your repo

3. **Add PostgreSQL**
   - Click "Add Plugin"
   - Select "PostgreSQL"
   - Confirm

4. **Configure Environment**
   - Click "Variables"
   - Add each from `.env.example`:
   ```
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=your-railway-url
   DATABASE_URL=postgresql://postgres:password@db:5432/vocab_learn
   TMDB_API_KEY=your-key
   OPENAI_API_KEY=your-key
   ```

5. **Deploy**
   - Railway auto-deploys from GitHub
   - Wait 3-5 minutes
   - Visit provided URL

6. **Run Migrations**
   - Click "Deployments" → latest
   - Click "Logs"
   - Run command:
   ```bash
   pnpm prisma migrate deploy
   ```

---

## 🔒 SSL/HTTPS Setup

### For Vercel
- Automatic (included with vercel.app domain)
- Custom domain: Automatic after DNS setup

### For Docker/Railway
- Use Let's Encrypt (free)
- Install Certbot:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot certonly --nginx -d yourdomain.com
  ```
- Configure Nginx to use certificates

### For custom domains
- Point DNS to your server
- Update NEXTAUTH_URL to https://yourdomain.com

---

## ⚠️ Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database connection working
- [ ] Prisma migrations run
- [ ] Build succeeds: `pnpm build`
- [ ] Tests pass: `pnpm test` (if available)
- [ ] No console errors in production build

---

## 🚨 Post-Deployment Checklist

- [ ] Visit homepage and verify loading
- [ ] Test signup/login flow
- [ ] Test movie search
- [ ] Test vocabulary extraction
- [ ] Test spaced repetition
- [ ] Check error logs
- [ ] Set up monitoring (Sentry recommended)
- [ ] Set up analytics (Plausible recommended)

---

## 📊 Monitoring & Maintenance

### Essential: Error Tracking (Sentry)
```bash
# 1. Sign up at sentry.io
# 2. Create Next.js project
# 3. Install Sentry SDK
pnpm add @sentry/nextjs

# 4. Initialize in your app
# 5. Environment variable: NEXT_PUBLIC_SENTRY_DSN
```

### Recommended: Analytics (Plausible)
```bash
# 1. Sign up at plausible.io
# 2. Add script tag to next.config.ts
# 3. Track user behavior
```

### Backups
- PostgreSQL automated backups (Vercel handles)
- Manual backup: `pg_dump vocab_learn > backup.sql`
- Backup frequency: Daily

---

## 🐛 Troubleshooting

### "Database connection refused"
- Check DATABASE_URL is correct
- Verify database is running
- Check firewall rules

### "NextAuth secret invalid"
- Generate new secret: `openssl rand -base64 32`
- Update NEXTAUTH_SECRET

### "Build fails"
- Run `pnpm install` locally
- Check for TypeScript errors: `pnpm type-check`
- Check logs for specific errors

### "Migrations fail"
- Ensure database exists
- Run: `pnpm prisma migrate resolve --rolled-back <migration-name>`
- Try reset: `pnpm prisma migrate reset` (dev only!)

---

## 📞 Getting Help

- Check logs: `vercel logs`, `docker logs`, or platform dashboard
- GitHub Issues: Create issue in repo
- Email: your-email@example.com

---

**Status**: Ready to deploy! Choose your platform above and follow the steps.
