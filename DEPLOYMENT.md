# Deployment Guide

Complete guide for deploying the Physical AI & Robotics Book Platform to production.

## Architecture Overview

```
┌─────────────────────────────┐
│  GitHub Pages (Frontend)    │
│  robotics-book.github.io    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Render (Backend API)      │
│  api.robotics-book.onrender │
└──────────────┬──────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Neon         │  │ Qdrant Cloud │
│ PostgreSQL   │  │ Vector DB    │
└──────────────┘  └──────────────┘
```

## Prerequisites

- GitHub account with repository
- Neon account (PostgreSQL hosting)
- Qdrant Cloud account (Vector database)
- Render.com account
- Claude API key (Anthropic)

## Frontend Deployment (GitHub Pages)

### Step 1: Configure GitHub Pages

1. Go to repository settings
2. Navigate to "Pages"
3. Set source to "GitHub Actions"

### Step 2: GitHub Secrets

Add to Settings → Secrets and variables → Actions:

```
BACKEND_URL=https://robotics-book-backend.onrender.com
REACT_APP_API_BASE=https://robotics-book-backend.onrender.com/api
```

### Step 3: Trigger Deployment

```bash
git push origin main
```

GitHub Actions automatically builds and deploys to GitHub Pages.

### Step 4: Configure Custom Domain (Optional)

1. Add CNAME file with domain
2. Configure DNS to point to GitHub Pages
3. Enable HTTPS in settings

## Backend Deployment (Render)

### Step 1: Create Neon PostgreSQL Database

1. Go to Neon console
2. Create new project
3. Copy connection string:
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

### Step 2: Create Qdrant Cloud Vector Database

1. Go to Qdrant Cloud
2. Create cluster
3. Get API key and URL

### Step 3: Deploy to Render

1. **Connect Repository**
   - Go to Render dashboard
   - Create "Web Service"
   - Connect GitHub account
   - Select repository

2. **Configure Service**
   - Name: `robotics-book-backend`
   - Environment: `Python 3`
   - Build command: `pip install -r backend/requirements.txt`
   - Start command: `cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://...@...
   QDRANT_URL=https://...qdrant.io
   QDRANT_API_KEY=your-api-key
   CLAUDE_API_KEY=sk-...
   BETTERAUTH_SECRET=your-secret
   FRONTEND_URL=https://yourusername.github.io/robotics-book-platform
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Check logs for errors

### Step 4: Test Backend

```bash
# Check health endpoint
curl https://robotics-book-backend.onrender.com/health

# View API docs
https://robotics-book-backend.onrender.com/docs
```

## Database Setup

### Initialize Database Schema

```bash
# SSH into Render or run locally with production URL
cd backend
alembic upgrade head

# Or manually create tables (see data-model.md)
psql $DATABASE_URL < schema.sql
```

### Load Initial Data

```python
# scripts/init_db.py
from src.database import SessionLocal, init_db
from src.models.chapter import Chapter

init_db()

db = SessionLocal()

# Load 6 chapters
chapters = [
    Chapter(id=1, title="Introduction to Physical AI", slug="intro", content="...", order=1),
    # ... more chapters
]

for ch in chapters:
    db.add(ch)

db.commit()
db.close()
```

## Pre-Launch Checklist

- [ ] Frontend builds successfully
- [ ] Backend deploys without errors
- [ ] Database migrations run
- [ ] Health endpoint responds (200)
- [ ] API documentation loads (/docs)
- [ ] CORS configured correctly
- [ ] SSL certificates valid
- [ ] Environment variables set
- [ ] Frontend and backend URLs connected
- [ ] Email configuration (if using email)
- [ ] Monitoring/logging configured
- [ ] Backup strategy in place

## Performance Optimization

### Frontend

1. **Enable Gzip Compression**
   - Render enables by default

2. **CDN for Assets**
   - Use Docusaurus static asset optimization
   - GitHub Pages serves from CDN

3. **Code Splitting**
   - Already handled by Docusaurus

### Backend

1. **Database Optimization**
   - Indexes on frequently queried fields
   - Connection pooling configured

2. **Caching**
   - Personalized content cached for 30 days
   - Session caching

3. **Rate Limiting**
   - Optional: Configure rate limits on Render

## Monitoring & Logging

### Render Logs

```bash
# View logs from Render dashboard
# Or via CLI:
render logs robotics-book-backend
```

### Database Monitoring

- Neon provides query analytics
- Monitor connection count
- Watch for slow queries

### Error Tracking

Add error tracking (optional):

```python
# backend/src/config.py
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=0.1,
)
```

## Scaling Strategies

### Horizontal Scaling

1. **Database**
   - Upgrade Neon plan for more connections
   - Enable read replicas

2. **Backend**
   - Render scales automatically
   - Monitor memory usage

3. **Vector Store**
   - Qdrant Cloud handles scaling

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 100 https://api.robotics-book.onrender.com/health

# Using k6
k6 run load-test.js
```

## Rollback Procedure

### Frontend

1. Go to GitHub
2. Revert to previous commit
3. GitHub Actions auto-deploys

### Backend

1. Go to Render dashboard
2. Select previous deployment
3. Click "Redeploy"

## Disaster Recovery

### Database Backup

```bash
# Neon provides automatic backups
# Restore from Neon console

# Manual backup
pg_dump $DATABASE_URL > backup.sql
```

### Database Restore

```bash
psql $DATABASE_URL < backup.sql
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Secrets not in code
- [ ] API keys rotated
- [ ] Database backups encrypted
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens (if needed)
- [ ] Rate limiting enabled

## Maintenance

### Monthly Tasks

- [ ] Review logs for errors
- [ ] Update dependencies
- [ ] Check security advisories
- [ ] Monitor performance metrics
- [ ] Test backup restoration

### Quarterly Tasks

- [ ] Security audit
- [ ] Performance optimization
- [ ] Capacity planning
- [ ] Update documentation

## Troubleshooting

### Common Issues

#### 502 Bad Gateway
- Check backend logs on Render
- Verify environment variables
- Check database connectivity

#### CORS Errors
- Verify FRONTEND_URL in backend
- Check browser console
- Ensure credentials: true if needed

#### Slow Performance
- Check database query performance
- Review Neon metrics
- Check Render resource usage

#### Database Connection Errors
- Verify DATABASE_URL format
- Check Neon connection limits
- Review connection pooling

## Emergency Contacts

- **Render Support**: support@render.com
- **Neon Support**: https://neon.tech/docs/community/support
- **Qdrant Support**: https://qdrant.tech/support/

## Next Steps

1. Deploy frontend to GitHub Pages
2. Deploy backend to Render
3. Test all features
4. Monitor for 24 hours
5. Gather user feedback
6. Iterate and improve

---

**Happy deploying!** 🚀
