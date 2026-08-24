# Digital Coffee - Admin Dashboard Credentials

## Admin Login

**Dashboard URL:** https://digitalcoffee.cafe/admin/login

**Credentials:**
- Email: `admin@digitalcoffee.cafe`
- Password: `admin123456`

## User Details
- User ID: `vt0h1IZOFBM7XsYdNUmHuymuBTH3`
- Role: `admin`
- Custom Claims: `{admin: true, role: 'admin'}`
- Subscription: `lifetime` / `active`

## Management Scripts

Located in `/var/www/digitalcoffee/scripts/` on VPS:

1. **createAdmin.js** - Create new admin user
   ```bash
   node scripts/createAdmin.js <email> <password> <name>
   ```

2. **setAdminClaims.js** - Grant admin privileges to existing user
   ```bash
   node scripts/setAdminClaims.js <email>
   ```

3. **resetAdminPassword.js** - Reset password for existing user
   ```bash
   node scripts/resetAdminPassword.js <email> <newPassword>
   ```

## Security Note

**IMPORTANT:** Change the default password after first login for production use.

## What You Can Do

With admin access, you can:
- View and manage all users
- Monitor user sessions and statistics
- Review and respond to user feedback
- Manage audio tracks (alpha & beta waves)
- Handle subscription management
- View analytics and engagement metrics
- Configure system settings
