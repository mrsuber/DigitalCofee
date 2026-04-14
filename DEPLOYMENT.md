# Digital Coffee - Deployment Guide

This guide will help you deploy the Digital Coffee admin dashboard and backend server to your VPS.

## Prerequisites

1. A VPS running Ubuntu/Debian with root access
2. Domain name pointed to your VPS (e.g., admin.digitalcoffee.cafe)
3. Firebase project with web app configured
4. SSH access to your VPS

## VPS Setup

### 1. Install Required Software

Connect to your VPS via SSH and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Create Directory Structure

```bash
sudo mkdir -p /var/www/digitalcoffee
sudo chown -R $USER:$USER /var/www/digitalcoffee
```

## Firebase Configuration

### 1. Get Firebase Web App Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "digital-coffee-app" project
3. Go to Project Settings > Your apps
4. If you haven't added a web app:
   - Click "Add app" > Web icon
   - Register the app with nickname "Digital Coffee Admin"
5. Copy the firebaseConfig object values

### 2. Update Local Configuration

Edit `admin-dashboard/.env.production`:

```bash
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=digital-coffee-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=digital-coffee-app
VITE_FIREBASE_STORAGE_BUCKET=digital-coffee-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
VITE_API_URL=https://admin.digitalcoffee.cafe
```

## Deployment Steps

### 1. Configure Deployment Script

Edit `deploy.sh` and set your VPS details:

```bash
VPS_USER="root"
VPS_HOST="your-vps-ip-or-domain"
DOMAIN="admin.digitalcoffee.cafe"
```

### 2. Run Deployment

From your local machine in the DigitalCofee directory:

```bash
./deploy.sh
```

This script will:
- Build the admin dashboard for production
- Create a deployment package
- Upload files to your VPS
- Install dependencies
- Configure PM2 to run the backend
- Set up Nginx configuration

### 3. Set Up SSL Certificate

After deployment, SSH into your VPS and run:

```bash
sudo certbot --nginx -d admin.digitalcoffee.cafe
```

Follow the prompts to set up SSL. Choose option 2 to redirect HTTP to HTTPS.

### 4. Create Admin User

SSH into your VPS and create an admin user:

```bash
cd /var/www/digitalcoffee
node scripts/create-admin.js
```

Enter the admin credentials when prompted:
- Email: your-admin-email@example.com
- Password: (minimum 6 characters)
- Display Name: Admin Name

### 5. Update Firebase Credentials on VPS

After deployment, you need to update the Firebase credentials on the VPS:

```bash
ssh root@your-vps
cd /var/www/digitalcoffee/admin

# Edit the JavaScript file to update Firebase config
# The config is embedded in the built JavaScript file
# Alternatively, rebuild locally with correct .env.production and redeploy
```

**Better approach:** Before running deploy.sh, ensure admin-dashboard/.env.production has the correct Firebase credentials, then rebuild:

```bash
cd admin-dashboard
cp .env.production .env
npm run build
cd ..
./deploy.sh
```

## Verify Deployment

### 1. Check Backend Server

```bash
pm2 status
pm2 logs digitalcoffee
```

### 2. Check Nginx Configuration

```bash
sudo nginx -t
sudo systemctl status nginx
```

### 3. Test the Admin Dashboard

Open your browser and navigate to:
- https://admin.digitalcoffee.cafe

You should see the Digital Coffee admin login page.

## Troubleshooting

### Backend server not starting

```bash
# Check logs
pm2 logs digitalcoffee

# Restart server
pm2 restart digitalcoffee
```

### Nginx errors

```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Firebase authentication not working

1. Verify Firebase credentials in the built JavaScript file
2. Check Firebase Console > Authentication > Sign-in method > Email/Password is enabled
3. Check browser console for errors

### SSL certificate issues

```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## Updating the Application

To deploy updates:

1. Make changes locally
2. Update version if needed
3. Run deployment script again:

```bash
./deploy.sh
```

PM2 will automatically restart the backend server.

## Maintenance

### View server logs

```bash
pm2 logs digitalcoffee
```

### Restart backend

```bash
pm2 restart digitalcoffee
```

### Monitor server

```bash
pm2 monit
```

### Auto-start on reboot

The deployment script sets this up automatically, but you can verify:

```bash
pm2 startup
pm2 save
```

## Security Recommendations

1. Set up firewall (UFW):
```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

2. Regularly update system:
```bash
sudo apt update && sudo apt upgrade -y
```

3. Use strong admin passwords (minimum 12 characters)

4. Keep Firebase credentials secure and never commit them to version control

5. Regularly backup your Firebase data

## Support

For issues or questions:
- Check logs: `pm2 logs digitalcoffee`
- Review nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check Firebase Console for authentication issues

## Domain Configuration

Ensure your domain DNS records are set up correctly:

```
Type: A
Name: admin.digitalcoffee.cafe
Value: your-vps-ip-address
TTL: 3600
```

Wait for DNS propagation (can take up to 48 hours but usually much faster).
