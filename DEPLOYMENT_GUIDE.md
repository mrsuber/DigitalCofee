# SMTP Email Service Deployment Guide

## Current Status

The SMTP email service has been fully configured locally and is ready for deployment to the VPS at `digitalcoffee.cafe`.

### What's Been Completed Locally:

1. Created `package.json` with nodemailer dependency
2. Installed all dependencies including nodemailer v6.10.1
3. Created `services/emailService.js` with:
   - Welcome email functionality
   - Test email functionality
   - Notification email functionality
4. Updated `index.js` to import emailService and add email endpoints
5. Created `.env` with SMTP configuration

### VPS Access Issue

SSH access to the VPS is currently unavailable (connection timeout on port 22). The domain resolves to Cloudflare IP 172.67.141.231, suggesting the actual VPS IP may be different or SSH port is firewalled.

## Deployment Steps (When VPS Access is Restored)

### 1. Transfer Files to VPS

```bash
# Transfer package.json
scp package.json root@digitalcoffee.cafe:/var/www/digitalcoffee/

# Transfer services directory
scp -r services root@digitalcoffee.cafe:/var/www/digitalcoffee/

# Transfer updated index.js
scp index.js root@digitalcoffee.cafe:/var/www/digitalcoffee/

# Transfer .env (verify credentials first!)
scp .env root@digitalcoffee.cafe:/var/www/digitalcoffee/
```

### 2. Install Dependencies on VPS

```bash
ssh root@digitalcoffee.cafe
cd /var/www/digitalcoffee
npm install
```

### 3. Verify Configuration

Check that `.env` has the correct SMTP settings:

```bash
cat /var/www/digitalcoffee/.env
```

Should contain:
```
SMTP_HOST=mail.digitalcoffee.cafe
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@digitalcoffee.cafe
SMTP_PASS=your-smtp-password-here
SMTP_FROM_NAME=Digital Coffee
SMTP_FROM_EMAIL=noreply@digitalcoffee.cafe
```

### 4. Restart Backend Service

```bash
pm2 restart digitalcoffee
pm2 logs digitalcoffee --lines 50
```

Look for the log message: `SMTP server ready to send emails`

### 5. Test Email Functionality

Once the server is running, test the email endpoints:

```bash
# Test endpoint (requires authentication token)
curl -X POST https://digitalcoffee.cafe/api/email/test \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json"
```

## Troubleshooting

### If "nodemailer.createTransporter is not a function" error occurs:

1. Verify nodemailer is installed:
   ```bash
   npm list nodemailer
   ```

2. If not installed or wrong version:
   ```bash
   npm install nodemailer@^6.9.7 --save
   ```

3. Check node version:
   ```bash
   node --version
   ```
   (Should be v14 or higher)

4. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### If SMTP connection fails:

1. Verify SMTP server is accessible from VPS:
   ```bash
   telnet mail.digitalcoffee.cafe 587
   ```

2. Check SMTP credentials are correct

3. Verify port 587 (TLS) is not blocked by firewall

4. Check PM2 logs for detailed error messages:
   ```bash
   pm2 logs digitalcoffee --err
   ```

## Email API Endpoints

Once deployed, these endpoints will be available:

- `POST /api/email/test` - Send test email to authenticated user
- `POST /api/email/welcome` - Send welcome email (body: {email, name})

Both endpoints require Firebase authentication token in Authorization header.

## Next Steps After Deployment

1. Test email sending with a real user account
2. Integrate welcome email into registration flow
3. Consider adding email verification emails through this service
4. Set up email templates for different notification types
