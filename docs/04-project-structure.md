# Project Structure - Digital Coffee

This document provides a comprehensive overview of the Digital Coffee project structure, both locally and on the production VPS.

## Project Overview

**Digital Coffee** is an audio-based creativity enhancement mobile application that uses brainwave entrainment technology (binaural beats, isochronic tones) to help users achieve specific mental states:
- **Alpha waves** (8-12 Hz): Relaxation, creative flow, ideation
- **Beta waves** (12-30 Hz): Focus, productivity, active thinking

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend (Web)** | HTML5, CSS3, JavaScript | - |
| **Frontend (Mobile)** | React Native | TBD |
| **Backend** | Node.js + Express | v20.20.0 / v5.2.1 |
| **Web Server** | Nginx | Latest |
| **Process Manager** | PM2 | Latest |
| **Database** | PostgreSQL | 16.11 |
| **CDN** | Cloudflare | Free Plan |
| **SSL/TLS** | Let's Encrypt + Cloudflare | - |
| **Hosting** | VPS (Ubuntu 24.04) | 76.13.41.99 |

## Local Project Structure

```
/Users/camsoltechnology/dev/camsol_company/divisionalOfficer/DigitalCofee/
├── .git/                          # Git repository
├── .claude/                       # Claude Code configuration
├── docs/                          # Documentation (this directory)
│   ├── README.md                  # Documentation index
│   ├── 01-domain-setup.md         # Domain configuration guide
│   ├── 02-vps-setup.md            # VPS setup guide
│   ├── 03-cloudflare-cdn.md       # Cloudflare CDN guide
│   └── 04-project-structure.md    # This file
├── Report_Digital_coffee.pdf      # Original project specification
└── .DS_Store                      # macOS metadata (ignored)
```

## Production Server Structure

### VPS Directory Layout

```
/var/www/digitalcoffee/            # Main application directory
├── index.js                       # Express application entry point
├── package.json                   # Node.js dependencies
├── package-lock.json              # Dependency lock file
├── .env                           # Environment variables (SECRET!)
├── node_modules/                  # Installed npm packages
│   ├── express/
│   ├── dotenv/
│   ├── pg/                        # PostgreSQL client
│   └── ... (80 packages total)
└── public/                        # Static files served by Express
    ├── index.html                 # Welcome page
    └── audio/                     # Audio files directory
        ├── alpha/                 # Alpha wave tracks (8-12 Hz)
        │   ├── morning-flow.mp3
        │   └── relaxed-ideation.mp3
        ├── beta/                  # Beta wave tracks (12-30 Hz)
        │   ├── focus-boost.mp3
        │   └── active-thinking.mp3
        ├── samples/               # Test/sample files
        │   └── test-audio.txt
        └── playlists/             # Playlist metadata (JSON)
            └── morning-routine.json
```

### System Configuration Files

```
/etc/nginx/
├── nginx.conf                     # Main nginx config
├── sites-available/
│   ├── default
│   ├── digitalcoffee.cafe         # Digital Coffee site config
│   ├── emergingdream.com
│   └── fayshaa.com
└── sites-enabled/                 # Symbolic links to enabled sites
    ├── default -> ../sites-available/default
    ├── digitalcoffee.cafe -> ../sites-available/digitalcoffee.cafe
    ├── emergingdream.com -> ../sites-available/emergingdream.com
    └── fayshaa.com -> ../sites-available/fayshaa.com

/etc/letsencrypt/
└── live/
    └── digitalcoffee.cafe/
        ├── fullchain.pem          # SSL certificate
        ├── privkey.pem            # Private key
        ├── chain.pem              # Certificate chain
        └── cert.pem               # Certificate only

/root/
├── .pm2/                          # PM2 configuration
│   ├── logs/
│   │   ├── digitalcoffee-out.log  # Application output
│   │   └── digitalcoffee-error.log # Application errors
│   ├── dump.pm2                   # Saved process list
│   └── pm2.pid                    # PM2 process ID
└── .ssh/                          # SSH keys
    └── authorized_keys

/var/log/
└── nginx/
    ├── digitalcoffee-access.log   # Access logs
    └── digitalcoffee-error.log    # Error logs
```

## Application Architecture

### Request Flow

```
┌─────────────────┐
│  Mobile User    │
│  (Anywhere)     │
└────────┬────────┘
         │
         │ HTTPS Request (HTTP/3)
         ▼
┌─────────────────────────────────┐
│   Cloudflare Edge Server        │
│   (Nearest location globally)   │
│                                 │
│   - Cache Check                 │
│   - DDoS Protection             │
│   - SSL/TLS Termination         │
│   - HTTP/3 → HTTP/2             │
└────────┬────────────────────────┘
         │
         │ Cache MISS: Forward to origin
         │ Cache HIT: Return cached content
         ▼
┌─────────────────────────────────┐
│   Nginx (Port 443)              │
│   VPS: 76.13.41.99              │
│                                 │
│   - SSL/TLS Re-encryption       │
│   - Reverse Proxy               │
│   - Security Headers            │
│   - Load Balancing              │
└────────┬────────────────────────┘
         │
         │ HTTP (localhost:3001)
         ▼
┌─────────────────────────────────┐
│   Node.js + Express (Port 3001) │
│   Managed by PM2                │
│                                 │
│   - Route Handling              │
│   - API Endpoints               │
│   - Static File Serving         │
│   - Database Queries            │
└────────┬────────────────────────┘
         │
         │ File System / Database
         ▼
┌─────────────────────────────────┐
│   Resources                     │
│                                 │
│   - /public/audio/* (Files)     │
│   - PostgreSQL (Database)       │
│   - Environment Variables (.env)│
└─────────────────────────────────┘
```

### API Architecture

```
Base URL: https://digitalcoffee.cafe/api

Endpoints:
├── GET  /health                    # Health check
├── GET  /api/test                  # API test endpoint
├── GET  /api/audio/tracks          # List all audio tracks
├── GET  /audio/alpha/*             # Alpha wave audio files
├── GET  /audio/beta/*              # Beta wave audio files
└── GET  /audio/samples/*           # Test audio files

Future Endpoints:
├── POST /api/auth/register         # User registration
├── POST /api/auth/login            # User login
├── GET  /api/user/profile          # User profile
├── POST /api/sessions/start        # Start listening session
├── POST /api/sessions/end          # End listening session
└── GET  /api/sessions/history      # Session history
```

## File Organization

### Audio File Naming Convention

**Format:** `[category]-[name]-[quality].[ext]`

**Examples:**
```
alpha-morning-flow-128k.mp3
alpha-creative-ideation-320k.mp3
beta-focus-boost-binaural-192k.mp3
beta-active-thinking-isochronic-256k.wav
```

**Quality indicators:**
- 128k: Standard quality (smaller file, mobile-friendly)
- 192k: High quality (balanced)
- 256k/320k: Premium quality (larger file)

### Playlist Structure

**Location:** `/var/www/digitalcoffee/public/audio/playlists/`

**Format:** JSON files

**Example:** `morning-routine.json`
```json
{
  "id": "morning-routine",
  "name": "Morning Creative Routine",
  "description": "Start your day with creative energy",
  "duration": 1800,
  "tracks": [
    {
      "id": 1,
      "file": "/audio/alpha/morning-flow-192k.mp3",
      "duration": 600,
      "order": 1,
      "volume": 0.8
    },
    {
      "id": 2,
      "file": "/audio/beta/focus-boost-192k.mp3",
      "duration": 1200,
      "order": 2,
      "volume": 0.9
    }
  ],
  "tags": ["morning", "creativity", "focus"],
  "createdAt": "2026-02-23T00:00:00Z"
}
```

## Environment Configuration

### Environment Variables (.env)

**Location:** `/var/www/digitalcoffee/.env`

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digitalcoffee
DB_USER=digitalcoffee_user
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD

# Application Settings
APP_NAME=Digital Coffee
APP_VERSION=1.0.0
APP_URL=https://digitalcoffee.cafe

# API Keys (Future)
# JWT_SECRET=your-secret-key
# FIREBASE_API_KEY=your-firebase-key
# ANALYTICS_KEY=your-analytics-key
```

⚠️ **Security:**
- Never commit .env to git
- Use strong, unique passwords
- Rotate secrets regularly
- Use environment-specific values

### Multiple Environments

**Development (.env.development):**
```bash
NODE_ENV=development
PORT=3000
DB_NAME=digitalcoffee_dev
```

**Staging (.env.staging):**
```bash
NODE_ENV=staging
PORT=3001
DB_NAME=digitalcoffee_staging
APP_URL=https://staging.digitalcoffee.cafe
```

**Production (.env.production):**
```bash
NODE_ENV=production
PORT=3001
DB_NAME=digitalcoffee
APP_URL=https://digitalcoffee.cafe
```

## Database Schema (Planned)

### PostgreSQL Tables

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audio tracks table
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    wave_type VARCHAR(20), -- 'alpha' or 'beta'
    frequency_range VARCHAR(20), -- e.g., '8-12 Hz'
    duration INTEGER, -- in seconds
    format VARCHAR(10), -- 'mp3', 'wav', 'ogg'
    bitrate VARCHAR(10), -- '128k', '192k', '320k'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listening sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    track_id INTEGER REFERENCES tracks(id),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration INTEGER, -- actual listening time in seconds
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlists table
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlist tracks (many-to-many)
CREATE TABLE playlist_tracks (
    playlist_id INTEGER REFERENCES playlists(id),
    track_id INTEGER REFERENCES tracks(id),
    order_index INTEGER,
    PRIMARY KEY (playlist_id, track_id)
);
```

## Deployment Workflow

### Current Deployment Process

1. **Develop locally** (when mobile app is built)
2. **Test locally** on development server
3. **Connect to VPS** via SSH
4. **Update code** (manual file edit or git pull)
5. **Install dependencies** if needed (`npm install`)
6. **Restart application** (`pm2 restart digitalcoffee`)
7. **Monitor logs** (`pm2 logs digitalcoffee`)
8. **Verify deployment** (test endpoints)
9. **Purge CDN cache** if needed (Cloudflare dashboard)

### Future CI/CD Pipeline

**Planned automation:**
1. Git push to main branch
2. GitHub Actions workflow triggered
3. Run tests (unit, integration)
4. Build application
5. Deploy to staging server
6. Run smoke tests
7. Deploy to production (if tests pass)
8. Purge Cloudflare cache
9. Send notification (email/Slack)

## Version Control

### Git Strategy

**Current status:** Basic git repository

**Recommended branches:**
```
main (production)
├── develop (staging)
│   ├── feature/user-auth
│   ├── feature/mobile-app
│   └── feature/analytics
└── hotfix/critical-bug
```

### .gitignore

```
# Dependencies
node_modules/

# Environment variables
.env
.env.*

# Logs
*.log
npm-debug.log*
pm2-*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build
dist/
build/
*.tgz

# Temporary files
tmp/
temp/
```

## Monitoring & Observability

### Current Monitoring

**Application logs:**
- PM2 logs: `/root/.pm2/logs/digitalcoffee-*.log`
- View: `pm2 logs digitalcoffee`

**Web server logs:**
- Access: `/var/log/nginx/digitalcoffee-access.log`
- Errors: `/var/log/nginx/digitalcoffee-error.log`

**CDN analytics:**
- Cloudflare Dashboard: https://dash.cloudflare.com
- Metrics: Requests, bandwidth, cache ratio, threats

### Recommended Future Monitoring

**Application Performance Monitoring (APM):**
- New Relic (free tier available)
- DataDog
- Sentry (error tracking)

**Uptime monitoring:**
- UptimeRobot (free)
- Pingdom
- Better Uptime

**Analytics:**
- Google Analytics (web traffic)
- Mixpanel (user behavior)
- PostHog (product analytics)

## Backup Strategy

### What to Backup

**Critical data:**
1. Database (PostgreSQL)
2. Audio files (`/var/www/digitalcoffee/public/audio/`)
3. Configuration files (nginx, .env)
4. SSL certificates (Let's Encrypt)

### Backup Commands

**Database backup:**
```bash
pg_dump digitalcoffee > digitalcoffee-db-$(date +%Y%m%d).sql
```

**Application backup:**
```bash
tar -czf digitalcoffee-app-$(date +%Y%m%d).tar.gz /var/www/digitalcoffee
```

**Full system backup:**
```bash
tar -czf digitalcoffee-full-$(date +%Y%m%d).tar.gz \
  /var/www/digitalcoffee \
  /etc/nginx/sites-available/digitalcoffee.cafe \
  /etc/letsencrypt/live/digitalcoffee.cafe
```

### Recommended Backup Schedule

**Daily:** Database
**Weekly:** Application files + audio
**Monthly:** Full system snapshot

## Security Checklist

### Application Security

- [x] HTTPS enforced (via Cloudflare + nginx)
- [x] Environment variables for secrets
- [x] Security headers configured
- [ ] Input validation (pending)
- [ ] Rate limiting (pending)
- [ ] CSRF protection (pending)
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS protection (sanitize inputs)

### Server Security

- [x] Firewall configured (UFW)
- [x] SSH key authentication
- [ ] Disable root login (recommended)
- [ ] Regular security updates
- [ ] Fail2ban (brute force protection)
- [ ] Regular backups

### CDN Security

- [x] DDoS protection (Cloudflare)
- [x] SSL/TLS encryption
- [x] Bot protection
- [ ] Rate limiting rules (Pro plan)
- [ ] WAF rules (Pro plan)

## Performance Benchmarks

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Page Load Time** | < 2s | ~1s |
| **API Response Time** | < 200ms | ~50ms |
| **Audio File Load** | < 1s (first play) | ~500ms (cached) |
| **Cache Hit Ratio** | > 80% | ~85% (estimated) |
| **Global Latency** | < 200ms | Varies by location |
| **Uptime** | 99.9% | TBD |

### Performance Testing

**Load testing:**
```bash
# Using Apache Bench
ab -n 1000 -c 10 https://digitalcoffee.cafe/

# Using wrk
wrk -t12 -c400 -d30s https://digitalcoffee.cafe/
```

**Audio streaming test:**
```bash
# Test audio file delivery
time curl -o /dev/null https://digitalcoffee.cafe/audio/samples/test-audio.txt
```

## Scaling Considerations

### Current Capacity

**Estimated capacity (Free tier):**
- Concurrent users: ~1,000
- Audio streams: ~500 simultaneous
- Bandwidth: Unlimited (Cloudflare)
- Database connections: 100 (PostgreSQL default)

### Horizontal Scaling Plan

**Phase 1:** Single VPS (current)
- Load: < 10,000 monthly users
- Cost: ~$15/month (VPS)

**Phase 2:** Multiple application servers
- Load: 10,000 - 100,000 users
- Add: Load balancer (nginx or Cloudflare)
- Add: Redis for session management
- Cost: ~$50-100/month

**Phase 3:** Microservices architecture
- Load: 100,000+ users
- Separate: API, audio delivery, database
- Add: CDN storage (AWS S3 + Cloudflare)
- Add: Database read replicas
- Cost: $200-500/month

## Development Roadmap

### MVP1 (Current) - Infrastructure ✅
- [x] Domain setup
- [x] VPS configuration
- [x] Nginx reverse proxy
- [x] SSL/TLS certificates
- [x] Cloudflare CDN
- [x] Node.js/Express application
- [x] PM2 process management
- [x] Documentation

### MVP2 - Core Features (Next)
- [ ] PostgreSQL database setup
- [ ] User authentication (JWT)
- [ ] Audio track management
- [ ] Session tracking
- [ ] Basic analytics

### MVP3 - Mobile App
- [ ] React Native application
- [ ] Audio playback functionality
- [ ] Offline mode
- [ ] Push notifications
- [ ] User profiles

### Future Features
- [ ] AI-powered track recommendations
- [ ] Personalized audio mixing
- [ ] Wearable device integration (EEG)
- [ ] Social features (share sessions)
- [ ] Premium subscription tier

## Resources & References

### Documentation
- Project Spec: `Report_Digital_coffee.pdf`
- Domain Setup: `docs/01-domain-setup.md`
- VPS Setup: `docs/02-vps-setup.md`
- Cloudflare CDN: `docs/03-cloudflare-cdn.md`

### External Resources
- Express.js: https://expressjs.com
- PM2: https://pm2.keymetrics.io
- Nginx: https://nginx.org/en/docs/
- PostgreSQL: https://www.postgresql.org/docs/
- Cloudflare: https://developers.cloudflare.com

### Contact
- **Company:** Camsol Technologies Ltd
- **Email:** info@camsoltechnology.com
- **Phone:** +237 5325 5547
- **Website:** https://www.camsoltechnology.com

---

**Document Version:** 1.0
**Last Updated:** February 23, 2026
**Project Status:** MVP1 Infrastructure Complete ✅
**Next Phase:** Database & Authentication
