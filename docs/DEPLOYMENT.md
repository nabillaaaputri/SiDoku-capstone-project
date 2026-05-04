# Deployment Guide - SiDoku

Panduan lengkap untuk deploy SiDoku ke production environments.

## 🚀 Deployment Architecture

```
GitHub Repository (main branch)
            ↓
    ┌───────┴───────┬─────────────┐
    ↓               ↓             ↓
Frontend        Backend       AI Service
(Vercel)        (Railway)     (Railway)
    ↓               ↓             ↓
Vercel CDN    Railway Cloud  Railway Cloud
Global        Server         Server
Distribution
```

---

## 1️⃣ Frontend Deployment (Vercel)

### Prerequisites
- GitHub account dengan repo SiDoku
- Vercel account (https://vercel.com)

### Step-by-Step

#### 1. Connect GitHub to Vercel
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Authorize Vercel access to GitHub
4. Select `sidoku` repository

#### 2. Configure Project
1. **Framework Preset**: Select "Vite"
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

#### 3. Environment Variables
Add these variables in Vercel Project Settings → Environment Variables:

```
VITE_API_URL=https://sidoku-api.railway.app
VITE_AI_SERVICE_URL=https://sidoku-ai.railway.app
```

#### 4. Deploy
- Click "Deploy"
- Vercel akan automatically deploy on git push ke main branch
- URL: `https://sidoku.vercel.app` (automatic)

#### 5. Configure Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS records di domain provider

### Post-Deployment
- Test all pages load correctly
- Check API calls to backend
- Monitor Vercel Analytics dashboard

---

## 2️⃣ Backend Deployment (Railway)

### Prerequisites
- Railway account (https://railway.app)
- PostgreSQL database (cloud or local)
- GitHub repository access

### Step-by-Step

#### 1. Create Railway Project
1. Go to https://railway.app/new
2. Click "GitHub Repo"
3. Select `sidoku` repository
4. Name: `sidoku-backend`

#### 2. Add PostgreSQL Database
1. Click "Add Service" → "PostgreSQL"
2. Railway akan auto-create database
3. Copy database credentials

#### 3. Configure Environment Variables
Railway Project Settings → Variables:

```
# Railway auto-provides DATABASE_URL

NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-secure-random-string>
CORS_ORIGIN=https://sidoku.vercel.app
AI_SERVICE_URL=https://sidoku-ai.railway.app
```

#### 4. Configure Deployment
1. Service Settings → Deployment
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Root Directory**: `/backend` (if monorepo)

#### 5. Deploy
- Railway auto-deploys on git push
- Check Logs → Deployments for status

#### 6. Database Migration
```bash
# SSH into Railway
railway shell

# Run migrations (jika ada)
npm run migrate

# Seed initial data (jika ada)
npm run seed

exit
```

### Post-Deployment
- Test API endpoints: `https://sidoku-api.railway.app/api/health`
- Check logs untuk errors
- Setup monitoring alerts

---

## 3️⃣ AI Service Deployment (Railway)

### Prerequisites
- Python 3.12.x
- FastAPI project configured
- GitHub repository access

### Step-by-Step

#### 1. Create Railway Project
1. Go to https://railway.app/new
2. Select "GitHub Repo"
3. Name: `sidoku-ai-service`

#### 2. Configure Environment Variables

```
FASTAPI_ENV=production
API_PORT=8000
BACKEND_URL=https://sidoku-api.railway.app
FRONTEND_URL=https://sidoku.vercel.app
DATABASE_URL=<dari backend PostgreSQL>
```

#### 3. Configure Deployment
1. Service Settings → Deployment
2. **Build Command**: 
```bash
pip install -r requirements.txt
```
3. **Start Command**: 
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```
4. **Root Directory**: `/ai-service` (if monorepo)

#### 4. Deploy
- Railway auto-deploys on git push

#### 5. Test AI Service
```bash
curl https://sidoku-ai.railway.app/docs
# Should return Swagger documentation
```

### Post-Deployment
- Check model loading in logs
- Test classification endpoint: `/api/classify`
- Monitor memory usage (models can be heavy)

---

## 🌍 Production Checklist

### Frontend
- [ ] Environment variables set in Vercel
- [ ] API URLs pointing to production
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Analytics/monitoring setup
- [ ] Security headers configured

### Backend
- [ ] All environment variables set
- [ ] Database properly configured
- [ ] JWT secret is strong & unique
- [ ] CORS origins updated to production URLs
- [ ] Database backups configured
- [ ] Error logging setup
- [ ] API documentation deployed
- [ ] Rate limiting enabled

### AI Service
- [ ] Models loaded successfully
- [ ] Environment variables correct
- [ ] Database connection verified
- [ ] Error logging configured
- [ ] Performance monitoring setup

### General
- [ ] HTTPS on all services
- [ ] SSL certificates valid
- [ ] DNS properly configured
- [ ] Monitoring & alerts configured
- [ ] Backup strategy in place
- [ ] Disaster recovery plan
- [ ] Security audit completed

---

## 📊 Monitoring & Logging

### Vercel
- Built-in analytics in Vercel dashboard
- Check Real-time tab for performance
- Set up alerts for errors

### Railway
- All services log automatically
- View logs in Railway dashboard: Project → Logs
- Setup Sentry for error tracking:

```bash
# Install Sentry in backend
npm install @sentry/node

# Configure in app.js
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### PostgreSQL
```sql
-- Monitor slow queries
SELECT query, mean_exec_time FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔒 Security in Production

### Secrets Management
- Use Railway/Vercel environment variables (never commit .env)
- Rotate JWT_SECRET periodically
- Use strong database passwords (min 16 chars, mixed case, numbers, symbols)

### Database Security
```sql
-- Create restricted user for app
CREATE USER sidoku_app WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE sidoku_db TO sidoku_app;
GRANT USAGE ON SCHEMA public TO sidoku_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sidoku_app;
```

### API Security
- Enable CORS only for trusted origins
- Implement rate limiting
- Validate all inputs
- Use JWT with expiration
- Implement refresh tokens

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy SiDoku

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g railway
          railway up --service backend
```

---

## 🚨 Troubleshooting

### Frontend Issues
```
# Build fails
- Check Node version matches (20.x LTS)
- Clear Vercel cache: Project Settings → Git → Purge build cache

# API calls fail
- Check VITE_API_URL environment variable
- Verify backend CORS allows frontend origin
```

### Backend Issues
```
# Database connection error
- Check DATABASE_URL format
- Verify network access to PostgreSQL
- Test: psql $DATABASE_URL

# Port already in use
- Change PORT environment variable
```

### AI Service Issues
```
# Model loading fails
- Check model files exist
- Check memory allocation
- Verify paths in environment

# Slow responses
- Check model size
- Monitor memory usage
- Consider model compression
```

---

## 📈 Performance Optimization

### Frontend
- Enable Vercel analytics
- Use image optimization
- Code splitting with React.lazy()
- Monitor Core Web Vitals

### Backend
- Connection pooling for database
- Cache frequently accessed data
- Pagination for large datasets
- Index optimization

### AI Service
- Model compression/quantization
- Batch processing
- Caching predictions
- Load testing before production

---

## 🔄 Rollback Procedure

### If production has critical issues:

1. **Frontend**: Revert in Vercel (automatic via git or manual)
2. **Backend**: Railway → Deployments → Select previous version
3. **Database**: Restore from backup (if available)

```bash
# Manual rollback via GitHub
git revert <commit-hash>
git push origin main
# Redeploy services
```

---

## 📞 Support & Escalation

- **Vercel Issues**: https://vercel.com/support
- **Railway Issues**: https://railway.app/help
- **PostgreSQL Issues**: https://www.postgresql.org/support/
- **Team Slack**: #sidoku-deployment channel
