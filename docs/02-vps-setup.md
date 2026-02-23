# VPS Server Configuration - Digital Coffee

This document covers the complete Virtual Private Server setup for hosting the Digital Coffee Node.js application with audio streaming capabilities.

## Server Information

| Property | Value |
|----------|-------|
| **IP Address** | 76.13.41.99 |
| **Hostname** | srv1408774 |
| **Operating System** | Ubuntu 24.04 LTS |
| **RAM** | 2GB (estimated) |
| **CPU** | 2 cores (estimated) |
| **Storage** | SSD |
| **Provider** | (Shared VPS) |

## Server Access

### SSH Connection

```bash
ssh root@76.13.41.99
```

**Login Details:**
- User: root
- Authentication: SSH key or password

### Initial Server Status

When first accessed, the server already had:
- ✅ Ubuntu 24.04 configured
- ✅ Node.js v20.20.0 installed
- ✅ npm 10.8.2 installed
- ✅ Nginx installed and running
- ✅ PostgreSQL 16.11 installed (shared database)
- ✅ PM2 process manager installed

## Installed Software Stack

### 1. Web Server - Nginx

**Version:** Latest (from Ubuntu repositories)

**Purpose:**
- Reverse proxy for Node.js application
- SSL/TLS termination
- Static file serving
- Load balancing capability

**Status check:**
```bash
systemctl status nginx
```

**Configuration file:**
```bash
/etc/nginx/sites-available/digitalcoffee.cafe
```

### 2. Node.js Runtime

**Version:** v20.20.0
**npm Version:** 10.8.2

**Verify installation:**
```bash
node --version  # v20.20.0
npm --version   # 10.8.2
```

**Managed via nvm (Node Version Manager):**
```bash
nvm use v25.0.0  # Switches to v25 (also installed)
```

### 3. Process Manager - PM2

**Purpose:**
- Keep Node.js app running
- Auto-restart on crashes
- Auto-start on server reboot
- Log management
- Monitoring

**Check PM2 status:**
```bash
pm2 list
```

### 4. Database - PostgreSQL

**Version:** 16.11

**Status:**
```bash
systemctl status postgresql
```

**Note:** Database is shared across multiple applications on this VPS to conserve resources.

**Connection details:**
```
Host: localhost
Port: 5432
Database: digitalcoffee (to be created)
User: digitalcoffee_user (to be created)
```

## Project Directory Structure

### Application Location

```
/var/www/digitalcoffee/
├── index.js              # Main Express application
├── package.json          # Node.js dependencies
├── package-lock.json     # Dependency lock file
├── .env                  # Environment variables (not in git)
├── node_modules/         # Installed packages
└── public/               # Static files
    ├── index.html        # Welcome page
    └── audio/            # Audio files directory
        ├── alpha/        # Alpha wave tracks (8-12 Hz)
        ├── beta/         # Beta wave tracks (12-30 Hz)
        ├── samples/      # Test/sample files
        └── playlists/    # Playlist metadata
```

### Directory Permissions

```bash
# Application directory
drwxr-xr-x  root root  /var/www/digitalcoffee

# Audio directory (publicly accessible)
drwxr-xr-x  root root  /var/www/digitalcoffee/public/audio
```

## Nginx Configuration

### Site Configuration File

**Location:** `/etc/nginx/sites-available/digitalcoffee.cafe`

```nginx
# Digital Coffee Application - nginx Configuration
# Domain: digitalcoffee.cafe

server {
    listen 80;
    listen [::]:80;

    server_name digitalcoffee.cafe www.digitalcoffee.cafe;

    # Logs
    access_log /var/log/nginx/digitalcoffee-access.log;
    error_log /var/log/nginx/digitalcoffee-error.log;

    # Application proxy
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security: Hide nginx version
    server_tokens off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### SSL/TLS Configuration (Let's Encrypt)

After Certbot configuration, SSL sections are automatically added:

```nginx
server {
    server_name digitalcoffee.cafe www.digitalcoffee.cafe;

    # ... (same proxy config as above)

    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/digitalcoffee.cafe/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/digitalcoffee.cafe/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP to HTTPS redirect
server {
    if ($host = www.digitalcoffee.cafe) {
        return 301 https://$host$request_uri;
    }

    if ($host = digitalcoffee.cafe) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;

    server_name digitalcoffee.cafe www.digitalcoffee.cafe;
    return 404;
}
```

### Enable Site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/digitalcoffee.cafe /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

## SSL/TLS Certificate Setup

### Let's Encrypt with Certbot

**Installation** (if needed):
```bash
apt update
apt install certbot python3-certbot-nginx
```

**Obtain certificate:**
```bash
certbot --nginx -d digitalcoffee.cafe -d www.digitalcoffee.cafe \
  --non-interactive \
  --agree-tos \
  --register-unsafely-without-email \
  --redirect
```

**Certificate details:**
- **Certificate:** `/etc/letsencrypt/live/digitalcoffee.cafe/fullchain.pem`
- **Private Key:** `/etc/letsencrypt/live/digitalcoffee.cafe/privkey.pem`
- **Expires:** 90 days from issue date
- **Auto-renewal:** Configured via systemd timer

**Check certificate:**
```bash
certbot certificates
```

**Test renewal:**
```bash
certbot renew --dry-run
```

## Node.js Application

### Main Application File - index.js

**Location:** `/var/www/digitalcoffee/index.js`

```javascript
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with proper headers
app.use(express.static('public', {
    setHeaders: (res, filePath) => {
        // Set caching headers for audio files
        if (filePath.endsWith('.mp3') || filePath.endsWith('.wav') || filePath.endsWith('.ogg')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
            res.setHeader('Accept-Ranges', 'bytes'); // Enable range requests for audio streaming
        }
        // Set CORS headers for audio streaming
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Digital Coffee API is running' });
});

// API routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'Digital Coffee API is working!', timestamp: new Date() });
});

// Audio tracks API endpoint
app.get('/api/audio/tracks', (req, res) => {
    res.json({
        alpha: [
            { id: 1, name: 'Morning Creative Flow', duration: 600, file: '/audio/alpha/morning-flow.mp3' },
            { id: 2, name: 'Relaxed Ideation', duration: 900, file: '/audio/alpha/relaxed-ideation.mp3' }
        ],
        beta: [
            { id: 3, name: 'Afternoon Focus Boost', duration: 1200, file: '/audio/beta/focus-boost.mp3' },
            { id: 4, name: 'Active Thinking', duration: 600, file: '/audio/beta/active-thinking.mp3' }
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Digital Coffee server running on port ${PORT}`);
    console.log(`Audio files will be served from /audio directory`);
    console.log(`CDN-ready with proper caching headers`);
});
```

### Package Dependencies - package.json

```json
{
  "name": "digitalcoffee",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "pg": "^8.18.0"
  }
}
```

### Environment Variables - .env

**Location:** `/var/www/digitalcoffee/.env`

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digitalcoffee
DB_USER=digitalcoffee_user
DB_PASSWORD=changeme_secure_password

# Application Settings
APP_NAME=Digital Coffee
```

⚠️ **Security:** Never commit .env file to git!

## PM2 Process Management

### Start Application

```bash
cd /var/www/digitalcoffee
pm2 start index.js --name digitalcoffee
```

### Save PM2 Process List

```bash
pm2 save
```

### Configure Auto-Start on Reboot

```bash
pm2 startup systemd
```

This creates `/etc/systemd/system/pm2-root.service`

### PM2 Commands

**List processes:**
```bash
pm2 list
```

**View logs:**
```bash
pm2 logs digitalcoffee
pm2 logs digitalcoffee --lines 50
pm2 logs digitalcoffee --nostream  # Don't tail
```

**Restart application:**
```bash
pm2 restart digitalcoffee
```

**Stop application:**
```bash
pm2 stop digitalcoffee
```

**Delete from PM2:**
```bash
pm2 delete digitalcoffee
```

**Monitor resources:**
```bash
pm2 monit
```

### PM2 Log Locations

```bash
# Application output
/root/.pm2/logs/digitalcoffee-out.log

# Application errors
/root/.pm2/logs/digitalcoffee-error.log
```

## Frontend - Welcome Page

**Location:** `/var/www/digitalcoffee/public/index.html`

Features:
- Responsive design
- Gradient background (purple theme)
- Coffee icon (☕)
- API status check
- Test button for API endpoint

**Live URL:** https://digitalcoffee.cafe

## Audio File Organization

### Directory Structure

```
/var/www/digitalcoffee/public/audio/
├── alpha/                    # Alpha wave tracks (8-12 Hz)
│   ├── morning-flow.mp3      # Creative ideation
│   └── relaxed-ideation.mp3  # Brainstorming sessions
├── beta/                     # Beta wave tracks (12-30 Hz)
│   ├── focus-boost.mp3       # Afternoon productivity
│   └── active-thinking.mp3   # Problem solving
├── samples/                  # Test files
│   └── test-audio.txt        # Sample for CDN testing
└── playlists/                # Playlist metadata (JSON)
    └── morning-routine.json
```

### Supported Audio Formats

- MP3 (recommended for compatibility)
- WAV (high quality, larger files)
- OGG (open format, good compression)

### Upload Audio Files

```bash
# Via SCP from local machine
scp /path/to/audio.mp3 root@76.13.41.99:/var/www/digitalcoffee/public/audio/alpha/

# Or via SSH
ssh root@76.13.41.99
cd /var/www/digitalcoffee/public/audio/alpha/
# Upload via SFTP client or wget
```

## API Endpoints

### Current Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Welcome page (HTML) |
| GET | /health | Health check (JSON) |
| GET | /api/test | Test API endpoint |
| GET | /api/audio/tracks | List available audio tracks |
| GET | /audio/{type}/{file} | Stream audio file |

### Example API Responses

**GET /health:**
```json
{
  "status": "ok",
  "message": "Digital Coffee API is running"
}
```

**GET /api/test:**
```json
{
  "message": "Digital Coffee API is working!",
  "timestamp": "2026-02-23T12:00:00.000Z"
}
```

**GET /api/audio/tracks:**
```json
{
  "alpha": [
    {
      "id": 1,
      "name": "Morning Creative Flow",
      "duration": 600,
      "file": "/audio/alpha/morning-flow.mp3"
    }
  ],
  "beta": [
    {
      "id": 3,
      "name": "Afternoon Focus Boost",
      "duration": 1200,
      "file": "/audio/beta/focus-boost.mp3"
    }
  ]
}
```

## Testing the Setup

### 1. Test Local Application

```bash
ssh root@76.13.41.99
curl http://localhost:3001
curl http://localhost:3001/api/test
```

### 2. Test Nginx Proxy

```bash
curl http://76.13.41.99
curl -I http://76.13.41.99
```

### 3. Test Domain Resolution

```bash
curl https://digitalcoffee.cafe
curl -I https://digitalcoffee.cafe
```

### 4. Test SSL Certificate

```bash
curl -vI https://digitalcoffee.cafe 2>&1 | grep "SSL certificate"
```

### 5. Test Audio File Delivery

```bash
curl -I https://digitalcoffee.cafe/audio/samples/test-audio.txt
```

## Monitoring & Logs

### Nginx Logs

**Access log:**
```bash
tail -f /var/log/nginx/digitalcoffee-access.log
```

**Error log:**
```bash
tail -f /var/log/nginx/digitalcoffee-error.log
```

### Application Logs (PM2)

```bash
pm2 logs digitalcoffee --lines 100
```

### System Logs

```bash
# General system log
journalctl -xe

# Nginx service
journalctl -u nginx -f

# PostgreSQL service
journalctl -u postgresql -f
```

## Maintenance Tasks

### Update Application Code

```bash
ssh root@76.13.41.99
cd /var/www/digitalcoffee

# Pull latest changes (if using git)
git pull origin main

# Install new dependencies
npm install

# Restart application
pm2 restart digitalcoffee
```

### Update Node.js Packages

```bash
cd /var/www/digitalcoffee
npm update
npm audit fix  # Security updates
pm2 restart digitalcoffee
```

### Backup Application

```bash
# Backup entire application directory
tar -czf digitalcoffee-backup-$(date +%Y%m%d).tar.gz /var/www/digitalcoffee

# Backup database (when configured)
pg_dump digitalcoffee > digitalcoffee-db-$(date +%Y%m%d).sql
```

### Renew SSL Certificate

**Automatic:**
- Certbot timer runs daily
- Auto-renews certificates within 30 days of expiration

**Manual:**
```bash
certbot renew
systemctl reload nginx
```

## Troubleshooting

### Application Not Starting

**Check PM2 logs:**
```bash
pm2 logs digitalcoffee --err
```

**Common issues:**
- Port 3001 already in use
- Missing dependencies (`npm install`)
- .env file missing or incorrect
- Permission issues

**Solution:**
```bash
cd /var/www/digitalcoffee
npm install
pm2 restart digitalcoffee
```

### Nginx 502 Bad Gateway

**Cause:** Node.js application not running

**Check:**
```bash
pm2 list
curl http://localhost:3001
```

**Fix:**
```bash
pm2 restart digitalcoffee
```

### SSL Certificate Issues

**Check certificate:**
```bash
certbot certificates
```

**Renew certificate:**
```bash
certbot renew --force-renewal
systemctl reload nginx
```

### High Memory Usage

**Check processes:**
```bash
pm2 monit
top
htop
```

**Restart application:**
```bash
pm2 restart digitalcoffee
```

## Security Best Practices

### Firewall (UFW)

**Allow HTTP/HTTPS:**
```bash
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
```

### Regular Updates

```bash
apt update
apt upgrade
apt autoremove
```

### Secure SSH

Edit `/etc/ssh/sshd_config`:
```
PermitRootLogin prohibit-password
PasswordAuthentication no
```

### Application Security

- ✅ Use environment variables for secrets
- ✅ Keep dependencies updated (`npm audit`)
- ✅ Implement rate limiting
- ✅ Validate user input
- ✅ Use HTTPS only (via Cloudflare)

## Next Steps

After VPS setup, proceed to:
1. [Cloudflare CDN Setup](./03-cloudflare-cdn.md) - Add global CDN for fast audio delivery
2. Database configuration (PostgreSQL)
3. User authentication implementation
4. Mobile app development (React Native)

---

**Document Version:** 1.0
**Last Updated:** February 23, 2026
**Maintained By:** Camsol Technologies Ltd
