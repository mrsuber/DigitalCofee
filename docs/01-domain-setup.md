# Domain Name Setup - Digital Coffee

This document covers the domain registration and initial DNS configuration for digitalcoffee.cafe.

## Domain Information

| Property | Value |
|----------|-------|
| **Domain Name** | digitalcoffee.cafe |
| **Registrar** | Namecheap |
| **Registration Date** | February 19, 2026 |
| **Expiration Date** | February 19, 2027 |
| **Status** | Active |
| **Auto-Renew** | Enabled |

## Domain Selection Rationale

### Why `.cafe`?
- Aligns with the "Digital Coffee" brand metaphor
- Memorable and unique TLD
- Available and affordable (~$10-15/year)
- Perfect for lifestyle/wellness applications

### Alternative Options Considered
- `digitalcoffee.app` - App-focused TLD (requires HTTPS)
- `digitalcoffee.io` - Tech/startup vibe
- `mindboost.audio` - Alternative branding

## Initial DNS Configuration

### Original Nameservers (Namecheap)
When first registered, the domain used Namecheap's BasicDNS:

```
Nameserver 1: dns1.registrar-servers.com
Nameserver 2: dns2.registrar-servers.com
```

### Initial DNS Records

**A Records (pointing to VPS):**
```
Type: A
Host: @
Value: 76.13.41.99
TTL: Auto

Type: A
Host: www
Value: 76.13.41.99
TTL: Auto
```

**Email Forwarding (MX Records):**
```
Type: MX
Host: @
Priority: 10
Value: eforward1.registrar-servers.com

Type: MX
Host: @
Priority: 10
Value: eforward2.registrar-servers.com

Type: MX
Host: @
Priority: 15
Value: eforward3.registrar-servers.com

Type: MX
Host: @
Priority: 10
Value: eforward4.registrar-servers.com

Type: MX
Host: @
Priority: 20
Value: eforward5.registrar-servers.com
```

**SPF Record:**
```
Type: TXT
Host: @
Value: v=spf1 include:_spf.registrar-servers.com ~all
```

## Namecheap Management

### Accessing Domain Settings

1. **Login to Namecheap:**
   - URL: https://www.namecheap.com/myaccount/login/
   - Email: mohamad.siysinyuy@gmail.com

2. **Navigate to Domain:**
   - Dashboard → Domain List
   - Click "Manage" next to digitalcoffee.cafe

3. **Domain Tabs:**
   - **Domain:** General settings, nameservers
   - **Products:** Additional services
   - **Sharing & Transfer:** Domain transfer settings
   - **Advanced DNS:** DNS records management

### DNSSEC Configuration

**Status:** Disabled (required for Cloudflare)

When using Cloudflare nameservers, DNSSEC must be turned OFF at the registrar level to prevent DNS resolution conflicts.

**To verify/disable:**
1. Go to Advanced DNS tab
2. Scroll to DNSSEC section
3. Ensure toggle is OFF

## DNS Propagation

### Initial Propagation (Namecheap DNS)
- **Time:** ~15-30 minutes
- **Global propagation:** 24-48 hours maximum

### Testing DNS Resolution

**Check nameservers:**
```bash
dig digitalcoffee.cafe NS +short
```

**Check A record:**
```bash
dig digitalcoffee.cafe A +short
```

**Global DNS propagation checker:**
```
https://www.whatsmydns.net/#A/digitalcoffee.cafe
```

## Domain Migration to Cloudflare

The domain nameservers were later changed to Cloudflare for CDN integration. See [03-cloudflare-cdn.md](./03-cloudflare-cdn.md) for details.

### Nameserver Change Process

**Before (Namecheap DNS):**
```
dns1.registrar-servers.com
dns2.registrar-servers.com
```

**After (Cloudflare):**
```
lakas.ns.cloudflare.com
paris.ns.cloudflare.com
```

**How to change nameservers:**

1. Log into Namecheap
2. Go to Domain List → Manage digitalcoffee.cafe
3. Scroll to "NAMESERVERS" section
4. Select "Custom DNS"
5. Replace with Cloudflare nameservers
6. Click green checkmark ✓ to save
7. Wait 15 mins - 48 hours for propagation

## Email Configuration

### Custom Email Addresses

**Planned addresses:**
- support@digitalcoffee.cafe
- feedback@digitalcoffee.cafe
- info@digitalcoffee.cafe

**Email Provider Options:**
- Google Workspace (~$6/user/month)
- Zoho Mail (free tier available)
- Email forwarding (via Namecheap or Cloudflare)

### Current Setup
Email forwarding is configured through Namecheap's MX records (see Initial DNS Records above).

## Domain Security

### Auto-Renewal
- **Status:** Enabled
- **Purpose:** Prevents accidental domain expiration
- **Notification:** Email reminder 30 days before expiration

### WhoisGuard Protection
- **Status:** Enabled (Free with Namecheap)
- **Purpose:** Hides personal contact information from WHOIS database
- **Privacy:** Protects registrant details

### Domain Lock
- **Status:** Should be enabled
- **Purpose:** Prevents unauthorized domain transfers
- **Location:** Domain settings → Transfer Lock

## Common Domain Tasks

### Checking Domain Status

**Via Namecheap dashboard:**
1. Login → Domain List
2. View status badge (Active, Expired, etc.)
3. Check expiration date

**Via WHOIS lookup:**
```bash
whois digitalcoffee.cafe
```

Or use: https://www.whois.com/whois/digitalcoffee.cafe

### Renewing Domain

**Automatic:**
- Enabled by default with saved payment method
- Renews 30 days before expiration

**Manual:**
1. Domain List → Manage
2. Click "Renew" button
3. Select duration (1-10 years)
4. Complete payment

### Transferring Domain

**To another registrar:**
1. Unlock domain (disable transfer lock)
2. Get EPP/Auth code from Namecheap
3. Initiate transfer at new registrar
4. Approve transfer via email
5. Wait 5-7 days for completion

⚠️ **Note:** Keep domain locked when not transferring!

## Troubleshooting

### Domain Not Resolving

**Check nameservers:**
```bash
dig digitalcoffee.cafe NS +short
```

**Expected result (after Cloudflare migration):**
```
lakas.ns.cloudflare.com
paris.ns.cloudflare.com
```

**If showing old nameservers:**
- Changes may still be propagating (wait up to 48 hours)
- Verify nameserver change was saved at Namecheap
- Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)

### Email Not Working

**Check MX records:**
```bash
dig digitalcoffee.cafe MX +short
```

**Verify:**
- MX records point to correct email provider
- SPF record is configured
- Email forwarding is active (if using)

### SSL Certificate Issues

**Ensure:**
- Domain resolves to correct IP (76.13.41.99)
- A records exist for both @ and www
- Cloudflare SSL/TLS mode is "Full (strict)"

## Best Practices

### Security
- ✅ Enable domain lock when not transferring
- ✅ Enable auto-renewal
- ✅ Use WhoisGuard/domain privacy
- ✅ Use strong Namecheap account password
- ✅ Enable 2FA on Namecheap account

### Management
- 📅 Review domain annually
- 📧 Keep email address current for renewal notifications
- 💳 Maintain valid payment method
- 📄 Document all DNS changes
- 🔄 Test domain resolution after changes

### Performance
- ⚡ Use CDN nameservers (Cloudflare) for better performance
- 🌍 Minimize TTL during development, increase for production
- 📊 Monitor DNS query performance

## Resources

### Namecheap Documentation
- Domain Management: https://www.namecheap.com/support/knowledgebase/category/20/domains/
- DNS Settings: https://www.namecheap.com/support/knowledgebase/category/22/dns/

### DNS Tools
- DNS Checker: https://www.whatsmydns.net
- WHOIS Lookup: https://www.whois.com
- DNS Propagation: https://dnschecker.org

### Contact Support
- Namecheap Support: https://www.namecheap.com/support/
- Live Chat: Available 24/7

## Next Steps

After domain setup, proceed to:
1. [VPS Server Configuration](./02-vps-setup.md) - Configure hosting infrastructure
2. [Cloudflare CDN Setup](./03-cloudflare-cdn.md) - Add global CDN for fast delivery

---

**Document Version:** 1.0
**Last Updated:** February 23, 2026
**Maintained By:** Camsol Technologies Ltd
