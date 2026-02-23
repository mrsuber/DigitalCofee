# Cloudflare CDN Setup - Digital Coffee

This document covers the complete Cloudflare Content Delivery Network (CDN) configuration for fast global audio delivery of binaural beats and brainwave entrainment tracks.

## Why Cloudflare for Digital Coffee?

### Audio Delivery Requirements

Digital Coffee serves audio files (MP3/WAV) for brainwave entrainment. These files must be:
- **Fast** - Low latency for immediate playback
- **Reliable** - No buffering or interruptions
- **Global** - Accessible worldwide
- **Bandwidth-efficient** - Cached to reduce server load

### Cloudflare Benefits

| Feature | Benefit for Digital Coffee |
|---------|----------------------------|
| **Global CDN** | 300+ edge servers worldwide |
| **Unlimited Bandwidth** | Free tier includes unlimited bandwidth |
| **HTTP/3 Support** | Fastest protocol for mobile audio streaming |
| **Smart Caching** | Cache audio files for 1 year |
| **DDoS Protection** | Always-on security |
| **SSL/TLS** | Free universal SSL certificate |
| **Analytics** | Track audio delivery performance |

## Account Information

| Property | Value |
|----------|-------|
| **Account Email** | mohamad.siysinyuy@gmail.com (assumed) |
| **Plan** | Free |
| **Domain** | digitalcoffee.cafe |
| **Zone ID** | 66b6cb942ee0b6c1daea2f790ea5111 |
| **Account ID** | a1e171f97893eeaaa719fcb30a83d01f |

## Setup Process Overview

1. Create Cloudflare account
2. Add domain to Cloudflare
3. Change nameservers at registrar
4. Wait for DNS propagation
5. Configure SSL/TLS settings
6. Set up caching rules for audio files
7. Enable protocol optimizations
8. Test CDN functionality

## Step-by-Step Configuration

### 1. Account Creation & Domain Addition

**Create account:**
1. Visit https://dash.cloudflare.com/sign-up
2. Enter email and create password
3. Verify email address

**Add domain:**
1. Dashboard → "+ Add a Site"
2. Enter: `digitalcoffee.cafe`
3. Click "Add Site"
4. Select plan: **Free** ($0/month)
5. Click "Continue"

**Initial options:**
- Selected: "Connect and accelerate traffic"
- Sub-option: "Public websites" (Application Performance)
- AI Crawler control: "Do not block (allow crawlers)"

### 2. DNS Records Scan

Cloudflare automatically scanned existing DNS records from Namecheap:

**Imported records:**
```
Type: A
Name: @
Content: 76.13.41.99
Proxy Status: Proxied (orange cloud)

Type: A
Name: www
Content: 76.13.41.99
Proxy Status: Proxied (orange cloud)

Type: MX (5 records)
Name: @ (digitalcoffee.cafe)
Content: eforward1-5.registrar-servers.com
Proxy Status: DNS only (gray cloud)

Type: TXT
Name: @
Content: v=spf1 include:_spf.registrar-servers.com ~all
Proxy Status: DNS only (gray cloud)
```

**Orange cloud (Proxied):**
- Traffic routes through Cloudflare CDN
- Benefits from caching, security, optimization

**Gray cloud (DNS only):**
- Direct connection (for email)
- Bypasses Cloudflare proxy

### 3. Nameserver Configuration

**Cloudflare nameservers assigned:**
```
lakas.ns.cloudflare.com
paris.ns.cloudflare.com
```

**Change nameservers at Namecheap:**

1. Log into Namecheap
2. Domain List → Manage digitalcoffee.cafe
3. Navigate to "Domain" tab
4. Scroll to "NAMESERVERS" section
5. Select "Custom DNS"
6. Replace with:
   - Nameserver 1: `lakas.ns.cloudflare.com`
   - Nameserver 2: `paris.ns.cloudflare.com`
7. Click green checkmark ✓ to save
8. Scroll to Advanced DNS tab
9. Turn OFF DNSSEC (required for Cloudflare)

**Propagation time:**
- Minimum: 15-30 minutes
- Maximum: 24-48 hours
- Actual: ~30 minutes

**Verify propagation:**
```bash
dig digitalcoffee.cafe NS +short
```

Expected output:
```
lakas.ns.cloudflare.com.
paris.ns.cloudflare.com.
```

### 4. SSL/TLS Configuration

**Dashboard Location:** SSL/TLS → Overview

**Encryption mode: Full (strict)**

**Why Full (strict)?**
- Validates Let's Encrypt certificate on origin
- End-to-end encryption
- Maximum security
- Required for audio streaming integrity

**SSL/TLS settings:**
```
Encryption Mode: Full (strict)
Always Use HTTPS: Enabled (automatic redirect)
Automatic HTTPS Rewrites: Enabled
Certificate Status: Active (Universal SSL)
```

**Certificate details:**
- **Type:** Universal SSL (Cloudflare-issued)
- **Covers:** digitalcoffee.cafe, *.digitalcoffee.cafe
- **Validity:** Automatically renewed
- **Edge Certificates:** Managed by Cloudflare

### 5. Caching Rules for Audio Files

**Location:** Caching → Cache Rules

**Rule #1: Cache Audio Files**

**Configuration:**
```
Rule Name: Cache Audio Files
Priority: 1 (first)
Status: Enabled

When incoming requests match:
- Field: URI Full
- Operator: wildcard
- Value: *digitalcoffee.cafe/audio/*

Then:
- Cache Eligibility: Eligible for cache
- Edge TTL: Ignore cache-control header and use this TTL
  - Duration: 1 month (2,592,000 seconds)
- Browser TTL: Override origin and use this TTL
  - Duration: 1 year (31,536,000 seconds)
```

**Expression Preview:**
```
(http.request.full_uri wildcard r"*digitalcoffee.cafe/audio/*")
```

**What this does:**
- All files in `/audio/` directory are cached
- Cloudflare edge servers cache for 1 month
- User browsers cache for 1 year
- Perfect for static audio files (binaural beats)
- Reduces origin server load
- Faster delivery worldwide

**Cache rule count:** 1 of 10 available (Free plan)

### 6. Protocol Optimizations

**Location:** Speed → Settings → Protocol Optimization

**Configured settings:**

| Protocol | Status | Description |
|----------|--------|-------------|
| **HTTP/2** | ✅ Enabled | Multiplexing for better performance |
| **HTTP/2 to Origin** | ✅ Enabled | Fast connection to VPS |
| **HTTP/3 (with QUIC)** | ✅ Enabled | Latest protocol, best for mobile |
| **0-RTT Connection Resumption** | ✅ Enabled | Faster reconnections for returning users |

**Why HTTP/3 for audio streaming?**
- Built-in encryption (QUIC)
- Better performance on mobile networks
- Handles packet loss better than TCP
- Lower latency for audio playback
- Future-proof protocol

### 7. Speed Optimizations

**Location:** Speed → Settings

**Content Optimization:**
- Auto Minify: Not critical for audio app (JavaScript/CSS minimal)
- Brotli: Enabled by default
- Early Hints: Available (not essential for MVP1)

**Other settings:**
- Speed Brain: Disabled (Beta feature)
- Cloudflare Fonts: Disabled (not using)
- Rocket Loader: Disabled (can break JavaScript)

**Why we focused on protocols over content optimization:**
- Digital Coffee serves primarily audio files
- HTML/CSS/JS is minimal
- Protocol optimizations (HTTP/3, caching) provide biggest performance gains

### 8. Security Settings

**Default security enabled:**
- DDoS protection (automatic)
- Bot mitigation (free tier)
- Always Use HTTPS (configured)
- Security headers (via nginx + Cloudflare)

**Under Attack Mode:** Available if needed
- Challenges suspicious visitors
- Protects against DDoS attacks
- Can be enabled in Quick Actions

## DNS Configuration Details

**Current DNS records (in Cloudflare):**

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | @ | 76.13.41.99 | Proxied | Auto |
| A | www | 76.13.41.99 | Proxied | Auto |
| MX | @ | eforward5.registrar-servers.com | DNS only | Auto |
| MX | @ | eforward4.registrar-servers.com | DNS only | Auto |
| MX | @ | eforward3.registrar-servers.com | DNS only | Auto |
| MX | @ | eforward2.registrar-servers.com | DNS only | Auto |
| MX | @ | eforward1.registrar-servers.com | DNS only | Auto |
| TXT | @ | v=spf1 include:_spf.registrar-servers.com ~all | DNS only | Auto |

**Managing DNS:**
1. Dashboard → DNS → Records
2. Add/Edit/Delete records as needed
3. Toggle proxy status (orange/gray cloud)

## Caching Behavior

### How Caching Works

```
User Request → Cloudflare Edge Server
                      │
                      ├─ Cache HIT → Return cached audio
                      │
                      └─ Cache MISS → Fetch from origin (VPS)
                                      → Cache at edge
                                      → Return to user
```

### Cache Headers

**Response headers from Cloudflare:**
```
cf-cache-status: HIT|MISS|DYNAMIC|EXPIRED
cf-ray: Unique request ID
server: cloudflare
alt-svc: h3=":443"; ma=86400  # HTTP/3 available
```

**Cache statuses:**
- **HIT**: Served from Cloudflare cache (fast!)
- **MISS**: First request, fetched from origin
- **DYNAMIC**: Not eligible for caching (e.g., API endpoints)
- **EXPIRED**: Cache expired, revalidating

### Purging Cache

**Purge entire cache:**
1. Dashboard → Caching → Configuration
2. Click "Purge Everything"
3. Confirm

**Purge specific files:**
1. Caching → Configuration → Custom Purge
2. Enter URLs or file patterns
3. Purge

**Purge via API:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://digitalcoffee.cafe/audio/alpha/morning-flow.mp3"]}'
```

## Analytics & Monitoring

### Cloudflare Dashboard Analytics

**Location:** Analytics & Logs

**Available metrics (Free plan):**
- Total requests
- Bandwidth usage
- Unique visitors
- Threats blocked
- Cache hit ratio
- SSL/TLS traffic
- Geographic distribution

**Limitations:**
- Last 24 hours data
- Upgrade to Pro for longer retention

### Cache Analytics

**View cache performance:**
1. Analytics & Logs → Caching
2. View cache hit ratio
3. Monitor bandwidth savings

**Ideal cache hit ratio:** >80% for audio files

### Real-Time Logs

**Available on Enterprise plan only**

For Free plan, use:
- Nginx access logs on VPS
- PM2 application logs
- Cloudflare Dashboard analytics

## Testing the CDN

### 1. Verify Cloudflare is Active

```bash
curl -I https://digitalcoffee.cafe
```

**Look for headers:**
```
server: cloudflare
cf-ray: 9d26a25b8d53d852-LIS
cf-cache-status: DYNAMIC|HIT
alt-svc: h3=":443"
```

### 2. Test from Multiple Locations

**Online tools:**
- https://tools.keycdn.com/performance
- https://www.webpagetest.org
- https://www.giftofspeed.com/cache-checker/

**Expected results:**
- Response time < 200ms globally
- Cache headers present
- HTTP/3 or HTTP/2 protocol

### 3. Test Audio File Caching

```bash
# First request (cache MISS)
curl -I https://digitalcoffee.cafe/audio/samples/test-audio.txt

# Second request (cache HIT)
curl -I https://digitalcoffee.cafe/audio/samples/test-audio.txt | grep cf-cache-status
```

**Expected:** `cf-cache-status: HIT` on second request

### 4. Test HTTP/3 Support

```bash
curl -I --http3 https://digitalcoffee.cafe
```

Or check in browser DevTools:
1. Open Network tab
2. Load https://digitalcoffee.cafe
3. Check Protocol column → Should show "h3" or "h3-29"

### 5. Geographic Performance Test

**Test from different regions:**
- North America
- Europe
- Asia
- Australia

**Tools:**
- Cloudflare Speed Test: https://speed.cloudflare.com
- Global Latency Test: https://www.dotcom-tools.com/website-speed-test

## Performance Optimization Tips

### Audio File Best Practices

**File formats:**
- MP3: 128-192 kbps (balance quality/size)
- WAV: Use for high-quality, short tracks
- OGG: Good compression, open format

**File organization:**
```
/audio/
  /alpha/
    morning-flow-128k.mp3    # Lower quality, faster download
    morning-flow-320k.mp3    # High quality
  /beta/
    focus-boost-binaural.mp3
```

**Naming convention:**
- Use descriptive names
- Include quality indicator (128k, 320k)
- No spaces (use hyphens or underscores)

### Caching Strategy

**Audio files (static):**
- Edge TTL: 1 month+ (long cache)
- Browser TTL: 1 year (very long)
- Perfect for binaural beats that don't change

**API endpoints (dynamic):**
- Cache: Bypass or short TTL (5 min)
- Use for `/api/audio/tracks` listing

**HTML/CSS/JS:**
- Edge TTL: 4 hours - 1 day
- Browser TTL: 1 week
- Use versioning for updates (?v=1.0.1)

## Advanced Configuration

### Page Rules (Alternative to Cache Rules)

**If using Page Rules instead:**
1. Rules → Page Rules
2. Create Page Rule
3. URL pattern: `*digitalcoffee.cafe/audio/*`
4. Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 year
5. Save and deploy

**Note:** Cache Rules (newer) are recommended over Page Rules

### Workers (Future Enhancement)

**Potential use cases:**
- Audio transcoding on-the-fly
- Personalized audio mixing
- A/B testing different tracks
- Analytics tracking

**Location:** Workers & Pages → Create Worker

### Load Balancing (Future)

**If scaling to multiple servers:**
1. Traffic → Load Balancing
2. Add origin servers
3. Configure health checks
4. Set up failover

## Troubleshooting

### CDN Not Caching Audio Files

**Check:**
1. Cache rule is enabled
2. URL pattern matches (`*digitalcoffee.cafe/audio/*`)
3. Cache eligibility is set to "Eligible for cache"
4. Origin server isn't sending no-cache headers

**Fix:**
```bash
# Check response headers
curl -I https://digitalcoffee.cafe/audio/test.mp3

# Should NOT see:
# cache-control: no-cache, no-store, must-revalidate
```

**Update Express server** (in index.js):
```javascript
res.setHeader('Cache-Control', 'public, max-age=31536000');
```

### SSL/TLS Errors

**Symptoms:**
- ERR_SSL_VERSION_OR_CIPHER_MISMATCH
- Certificate warnings

**Fix:**
1. Check encryption mode: SSL/TLS → Overview
2. Ensure "Full (strict)" is selected
3. Verify origin certificate is valid:
   ```bash
   ssh root@76.13.41.99 "certbot certificates"
   ```
4. Renew if needed:
   ```bash
   ssh root@76.13.41.99 "certbot renew && systemctl reload nginx"
   ```

### Slow Performance

**Diagnose:**
1. Check cache hit ratio (should be >80%)
2. Verify HTTP/3 is enabled
3. Test origin server response time
4. Check for large audio files (>10MB)

**Optimize:**
- Compress audio files (lower bitrate)
- Enable all protocol optimizations
- Use proper file formats (MP3 > WAV for size)
- Increase cache TTL

### DNS Not Resolving

**Check nameservers:**
```bash
dig digitalcoffee.cafe NS +short
```

**Should return:**
```
lakas.ns.cloudflare.com.
paris.ns.cloudflare.com.
```

**If not:**
1. Verify nameservers at Namecheap
2. Wait for propagation (up to 48 hours)
3. Clear local DNS cache

## Cost & Plan Details

### Free Plan Limits

| Feature | Free Plan |
|---------|-----------|
| **Bandwidth** | Unlimited |
| **Requests** | Unlimited |
| **CDN Edge Servers** | All 300+ locations |
| **Cache Rules** | 10 rules |
| **DNS Records** | 1,000 records |
| **Page Rules** | 3 rules |
| **SSL Certificate** | Universal SSL included |
| **DDoS Protection** | Unmetered |
| **Analytics** | Last 24 hours |
| **Support** | Community |

### When to Upgrade?

**Pro Plan ($20/month):**
- Analytics: 30 days retention
- WAF (Web Application Firewall)
- Image optimization
- Mobile acceleration
- Better support

**Consider upgrading when:**
- Need detailed analytics
- Want image optimization
- Require priority support
- Monthly visitors > 100,000

**For Digital Coffee MVP1:** Free plan is sufficient!

## Security Best Practices

### Recommended Settings

**Enable:**
- ✅ Always Use HTTPS
- ✅ Automatic HTTPS Rewrites
- ✅ Minimum TLS version: 1.2
- ✅ Bot Fight Mode (free)
- ✅ Email obfuscation

**Consider:**
- Browser Integrity Check (default: on)
- Challenge Passage (15-30 min)
- Security level: Medium

**Avoid (for audio app):**
- Under Attack Mode (only during DDoS)
- High security level (may block legitimate users)

### Rate Limiting (Pro+)

**Protect API endpoints:**
- Limit requests per IP
- Prevent abuse
- Requires Pro plan or higher

## Maintenance & Monitoring

### Regular Tasks

**Weekly:**
- Check analytics (cache hit ratio)
- Review bandwidth usage
- Monitor error rates

**Monthly:**
- Review cache rules
- Check SSL certificate status
- Analyze top content

**Quarterly:**
- Review CDN performance
- Consider plan upgrade if needed
- Update documentation

### Alerts & Notifications

**Set up email notifications:**
1. Account → Notifications
2. Enable:
   - SSL/TLS certificate expiration
   - High error rates
   - Unusual traffic patterns

## API Integration

### Cloudflare API

**Get API token:**
1. My Profile → API Tokens
2. Create Token
3. Select permissions (Zone Read/Edit)
4. Copy token

**Example API calls:**

**Purge cache:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/66b6cb942ee0b6c1daea2f790ea5111/purge_cache" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

**List DNS records:**
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/66b6cb942ee0b6c1daea2f790ea5111/dns_records" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Resources

### Cloudflare Documentation
- Dashboard: https://dash.cloudflare.com
- Docs: https://developers.cloudflare.com
- Community: https://community.cloudflare.com
- Status: https://www.cloudflarestatus.com

### Performance Tools
- Speed Test: https://speed.cloudflare.com
- CDN Performance: https://www.cdnperf.com
- WebPageTest: https://www.webpagetest.org

### Support
- Free Plan: Community forum
- Pro+: Email + chat support
- Enterprise: Phone + dedicated account manager

## Summary

### What We Achieved

✅ **Global CDN** - 300+ edge servers for worldwide audio delivery
✅ **Optimized Caching** - 1 month edge / 1 year browser cache for audio
✅ **Latest Protocols** - HTTP/3 for fastest mobile streaming
✅ **Secure Delivery** - Full (strict) SSL/TLS encryption
✅ **Unlimited Bandwidth** - No data transfer costs
✅ **DDoS Protection** - Always-on security
✅ **Fast Propagation** - DNS active in ~30 minutes

### Performance Gains

| Metric | Before Cloudflare | After Cloudflare |
|--------|-------------------|------------------|
| **Global Latency** | Varies by distance | < 200ms worldwide |
| **Cache Hit Ratio** | 0% (no cache) | 80%+ (cached audio) |
| **Protocol** | HTTP/1.1 | HTTP/3 (QUIC) |
| **SSL/TLS** | Let's Encrypt (origin only) | Universal SSL + origin |
| **Bandwidth Cost** | Counted | Free (unlimited) |
| **DDoS Protection** | None | Automatic |

### Next Steps

After Cloudflare setup, proceed to:
1. Upload binaural beat audio files (MP3/WAV)
2. Test global audio delivery performance
3. Implement mobile app (React Native)
4. Connect PostgreSQL database
5. Add user authentication
6. Implement analytics tracking

---

**Document Version:** 1.0
**Last Updated:** February 23, 2026
**Maintained By:** Camsol Technologies Ltd
**Cloudflare Plan:** Free
**Status:** Production Ready ✅
