# Digital Coffee - Infrastructure Documentation

> Audio-based creativity enhancement app using brainwave entrainment technology

This documentation covers the complete infrastructure setup for Digital Coffee MVP1, including domain configuration, VPS deployment, and global CDN delivery for fast audio streaming.

## Table of Contents

1. [Domain Name Setup](./01-domain-setup.md)
   - Domain registration
   - DNS configuration
   - Nameserver management

2. [VPS Server Configuration](./02-vps-setup.md)
   - Initial server setup
   - Node.js and Express installation
   - Nginx reverse proxy configuration
   - SSL/TLS certificates with Let's Encrypt
   - PM2 process manager
   - Audio file directory structure

3. [Cloudflare CDN Setup](./03-cloudflare-cdn.md)
   - Account setup and domain integration
   - SSL/TLS configuration
   - Caching rules for audio files
   - Protocol optimizations (HTTP/3, HTTP/2)
   - Performance settings

4. [Project Structure](./04-project-structure.md)
   - Server directory layout
   - Application architecture
   - API endpoints
   - Audio file organization

## Quick Reference

### Domain Information
- **Domain:** digitalcoffee.cafe
- **Registrar:** Namecheap
- **DNS:** Cloudflare
- **Nameservers:**
  - lakas.ns.cloudflare.com
  - paris.ns.cloudflare.com

### Server Information
- **VPS IP:** 76.13.41.99
- **OS:** Ubuntu 24.04
- **Web Server:** Nginx
- **Application:** Node.js (v20.20.0) + Express
- **Process Manager:** PM2
- **Database:** PostgreSQL 16.11 (shared)

### Application URLs
- **Main Site:** https://digitalcoffee.cafe
- **API Base:** https://digitalcoffee.cafe/api
- **Audio Files:** https://digitalcoffee.cafe/audio/

## Key Features

### Audio Delivery Optimization
- **Global CDN:** Cloudflare edge servers (300+ locations)
- **Caching Strategy:**
  - Edge TTL: 1 month
  - Browser TTL: 1 year
- **Protocols:** HTTP/3, HTTP/2, 0-RTT
- **SSL:** Full (strict) encryption

### Audio File Types
- **Alpha Waves** (8-12 Hz): Creativity and relaxation
- **Beta Waves** (12-30 Hz): Focus and productivity
- **Formats:** MP3, WAV, OGG

## Architecture Overview

```
┌─────────────┐
│   Mobile    │
│   Users     │
└──────┬──────┘
       │
       │ HTTPS (HTTP/3)
       ▼
┌──────────────────┐
│   Cloudflare     │
│   CDN Network    │
│  (300+ edges)    │
└──────┬───────────┘
       │
       │ HTTPS (HTTP/2)
       ▼
┌──────────────────┐
│  Nginx (443)     │
│  Reverse Proxy   │
└──────┬───────────┘
       │
       │ HTTP (3001)
       ▼
┌──────────────────┐
│  Node.js/Express │
│  Application     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Audio Files     │
│  /audio/*        │
└──────────────────┘
```

## Getting Started

### Prerequisites
- SSH access to VPS: `ssh root@76.13.41.99`
- Cloudflare account access
- Domain registrar (Namecheap) access

### Testing the Setup

1. **Check domain resolution:**
   ```bash
   dig digitalcoffee.cafe
   ```

2. **Test HTTPS connection:**
   ```bash
   curl -I https://digitalcoffee.cafe
   ```

3. **Check Cloudflare integration:**
   ```bash
   curl -I https://digitalcoffee.cafe | grep cf-ray
   ```

4. **Test audio file delivery:**
   ```bash
   curl -I https://digitalcoffee.cafe/audio/samples/test-audio.txt
   ```

### Application Management

**View application status:**
```bash
ssh root@76.13.41.99 "pm2 list"
```

**View logs:**
```bash
ssh root@76.13.41.99 "pm2 logs digitalcoffee"
```

**Restart application:**
```bash
ssh root@76.13.41.99 "pm2 restart digitalcoffee"
```

## Support & Maintenance

### Common Commands

**Nginx:**
```bash
# Check config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# View logs
tail -f /var/log/nginx/digitalcoffee-access.log
```

**Application:**
```bash
# SSH to server
ssh root@76.13.41.99

# Navigate to project
cd /var/www/digitalcoffee

# View files
ls -la public/audio/
```

### Monitoring

- **Cloudflare Analytics:** https://dash.cloudflare.com
- **Server Logs:** `/var/log/nginx/digitalcoffee-*.log`
- **PM2 Monitoring:** `pm2 monit`

## Next Steps

1. Upload binaural beat audio files (MP3/WAV)
2. Implement mobile app (React Native)
3. Connect to PostgreSQL database
4. Add user authentication
5. Implement session tracking

## Version History

- **v1.0** (2026-02-23): Initial infrastructure setup
  - Domain configured
  - VPS deployed with Node.js/Express
  - Cloudflare CDN integrated
  - Audio delivery optimized

---

**Project:** Digital Coffee MVP1
**Company:** Camsol Technologies Ltd
**Date:** February 2026
**Status:** Infrastructure Ready ✅
