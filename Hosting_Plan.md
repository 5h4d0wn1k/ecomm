# Comprehensive Hosting Plan for GoCart Full Stack on dev.davcreation.in

## Overview
This document provides an in-depth, secure, and error-free plan for hosting the GoCart full-stack e-commerce application on a VPS at dev.davcreation.in. The application is built with Next.js 15, uses Prisma with Neon PostgreSQL, Clerk for authentication, Razorpay/Stripe for payments, and various other services.

## 1. Prerequisites
- **VPS Requirements**: Minimum 2GB RAM, 1 CPU core, 20GB SSD storage. Recommended providers: DigitalOcean, Linode, Vultr, or AWS EC2.
- **Domain**: dev.davcreation.in configured with DNS pointing to VPS IP address.
- **GitHub Repository**: Code repository with CI/CD capabilities.
- **External Services Accounts**:
  - Neon Database (PostgreSQL)
  - Clerk (Authentication)
  - Razorpay (Payments)
  - Stripe (Payments)
  - ShipRocket (Shipping)
  - ImageKit (Image management)
  - OpenAI (AI features)
- **Local Development**: Ensure the app runs locally without issues before deployment.

## 2. VPS Initial Setup
### Operating System
- Ubuntu 22.04 LTS (latest stable version)
- Update system packages:
  ```bash
  sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y
  ```

### Install Required Software
1. **Node.js 18+**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Nginx**:
   ```bash
   sudo apt install nginx -y
   sudo systemctl enable nginx
   ```

3. **PM2** (Process Manager):
   ```bash
   sudo npm install -g pm2
   ```

4. **Git**:
   ```bash
   sudo apt install git -y
   ```

5. **Certbot** (for SSL):
   ```bash
   sudo apt install snapd -y
   sudo snap install core; sudo snap refresh core
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   ```

## 3. VPS Security Hardening
### SSH Configuration
1. **Disable Root Login**:
   ```bash
   sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
   ```

2. **Use Key-Based Authentication**:
   - Generate SSH key pair locally: `ssh-keygen -t rsa -b 4096`
   - Copy public key to server: `ssh-copy-id user@your-vps-ip`
   - Disable password authentication:
     ```bash
     sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
     ```

3. **Change SSH Port** (optional, but recommended):
   ```bash
   sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
   sudo ufw allow 2222/tcp
   sudo systemctl restart sshd
   ```

### Firewall Setup
```bash
sudo ufw enable
sudo ufw allow 2222/tcp  # SSH (if changed)
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
```

### Additional Security Measures
1. **Fail2Ban** (prevents brute force attacks):
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

2. **Automatic Security Updates**:
   ```bash
   sudo apt install unattended-upgrades -y
   sudo dpkg-reconfigure --priority=low unattended-upgrades
   ```

3. **Non-Root User for Application**:
   ```bash
   sudo adduser appuser
   sudo usermod -aG sudo appuser
   ```

4. **Disable Unnecessary Services**:
   ```bash
   sudo systemctl disable --now apache2  # If installed
   ```

## 4. Domain Configuration and SSL
### DNS Setup
- Point dev.davcreation.in A record to your VPS IP address
- Wait for DNS propagation (can take up to 24 hours)

### SSL Certificate with Let's Encrypt
```bash
sudo certbot --nginx -d dev.davcreation.in
```
- Choose to redirect HTTP to HTTPS when prompted
- Certbot will automatically configure Nginx

### SSL Renewal
- Certbot handles automatic renewal
- Test renewal: `sudo certbot renew --dry-run`

## 5. Application Deployment
### Clone Repository
```bash
cd /home/appuser
git clone https://github.com/yourusername/your-repo.git gocart
cd gocart
```

### Install Dependencies
```bash
npm install
```

### Environment Configuration
Create `.env` file with all required variables (see Environment Variables section below)

### Build Application
```bash
npm run build
```

### Database Setup
- Prisma migrations are handled automatically via `npm run build` (which runs `prisma generate`)
- Ensure Neon database is accessible

### Process Management with PM2
1. Create ecosystem file `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'gocart',
       script: 'npm start',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production'
       }
     }]
   }
   ```

2. Start application:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Nginx Configuration
Create `/etc/nginx/sites-available/gocart`:
```nginx
server {
    listen 80;
    server_name dev.davcreation.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dev.davcreation.in;

    ssl_certificate /etc/letsencrypt/live/dev.davcreation.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev.davcreation.in/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/gocart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Environment Variables Configuration
Based on `.env.example`, create production `.env` with:

```bash
# Currency Symbol
NEXT_PUBLIC_CURRENCY_SYMBOL = '$'

# Base URL for internal API calls
NEXT_PUBLIC_BASE_URL = 'https://dev.davcreation.in'

# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# ShipRocket Configuration
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_WEBHOOK_SECRET=your_shiprocket_webhook_secret

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Inngest
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_EVENT_KEY=your_inngest_event_key
```

**Security Note**: Never commit `.env` to version control. Use GitHub Secrets for CI/CD.

## 7. CI/CD Pipeline with GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        DIRECT_URL: ${{ secrets.DIRECT_URL }}

    - name: Deploy to VPS
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        port: ${{ secrets.VPS_SSH_PORT }}
        script: |
          cd /home/appuser/gocart
          git pull origin main
          npm install --production=false
          npm run build
          pm2 restart gocart
          pm2 save
```

### GitHub Secrets Required:
- `DATABASE_URL`
- `DIRECT_URL`
- `VPS_HOST` (your VPS IP)
- `VPS_USER` (appuser)
- `VPS_SSH_KEY` (private SSH key)
- `VPS_SSH_PORT` (2222 or 22)

## 8. Monitoring and Error Handling
### Application Monitoring
1. **PM2 Monitoring**:
   ```bash
   pm2 monit
   pm2 logs gocart
   ```

2. **Health Check Endpoint**:
   Create `/api/health` route that returns 200 OK

3. **Nginx Logs**:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### Error Handling
1. **Custom Error Pages**:
   - Create `app/error.js` for Next.js error handling
   - Configure Nginx to serve custom error pages

2. **Logging**:
   - Use Winston or similar for structured logging
   - Log to files and external service (optional)

3. **Rate Limiting**:
   - Implement rate limiting for API endpoints
   - Use middleware for protection

### Performance Monitoring
- Monitor CPU, memory, disk usage with `htop` or `top`
- Set up alerts for high resource usage

## 9. Backup and Recovery Strategy
### Database Backups
- Neon provides automatic backups
- Export data periodically:
  ```bash
  pg_dump "your_neon_connection_string" > backup.sql
  ```

### Application Backups
- Backup environment files
- Backup uploaded files (if any)

### Automated Backup Script
Create `/home/appuser/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/appuser/backups"

mkdir -p $BACKUP_DIR

# Database backup
pg_dump "$DATABASE_URL" > $BACKUP_DIR/db_$DATE.sql

# Compress
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/db_$DATE.sql

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
```

Add to crontab for daily backups:
```bash
crontab -e
# Add: 0 2 * * * /home/appuser/backup.sh
```

### Recovery Plan
1. Restore from Neon backup if available
2. Deploy fresh application
3. Restore database from backup
4. Update DNS if necessary

## 10. Security Best Practices
### Ongoing Maintenance
1. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade
   npm audit fix
   ```

2. **Monitor Security Logs**:
   ```bash
   sudo journalctl -u ssh -f
   sudo journalctl -u fail2ban -f
   ```

3. **SSL Certificate Monitoring**:
   - Certbot handles renewal automatically
   - Monitor expiration dates

### Additional Security Layers
1. **Web Application Firewall** (optional):
   - Consider Cloudflare or similar for additional protection

2. **DDoS Protection**:
   - Use Cloudflare's free tier or similar service

3. **Regular Security Audits**:
   - Scan for vulnerabilities periodically

## 11. Troubleshooting Guide
### Common Issues and Solutions

1. **Application Not Starting**:
   - Check PM2 logs: `pm2 logs gocart`
   - Verify environment variables
   - Check database connectivity

2. **SSL Certificate Issues**:
   - Renew certificate: `sudo certbot renew`
   - Check Nginx configuration

3. **Database Connection Errors**:
   - Verify Neon connection strings
   - Check firewall rules
   - Ensure SSL mode is correct

4. **Performance Issues**:
   - Monitor resource usage: `htop`
   - Check Nginx configuration
   - Optimize Next.js build

5. **Deployment Failures**:
   - Check GitHub Actions logs
   - Verify SSH connection
   - Ensure correct file permissions

### Debug Commands
```bash
# Check application status
pm2 status

# View application logs
pm2 logs gocart

# Check Nginx status
sudo systemctl status nginx

# Test SSL certificate
openssl s_client -connect dev.davcreation.in:443

# Check DNS resolution
nslookup dev.davcreation.in
```

## 12. Cost Estimation
- **VPS**: $5-15/month (depending on provider and specs)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **External Services**: Varies by usage
- **Total Estimated**: $50-100/month + usage-based costs

## 13. Maintenance Checklist
- [ ] Weekly: Check system logs
- [ ] Monthly: Update system and dependencies
- [ ] Monthly: Verify backups
- [ ] Quarterly: Security audit
- [ ] Annually: Review and optimize costs

## 14. Rollback Plan
1. Keep previous deployment versions
2. Use Git tags for releases
3. Quick rollback via PM2: `pm2 revert gocart`
4. Database rollback via Neon backups

## Conclusion
This comprehensive plan ensures secure, reliable, and scalable hosting of the GoCart application. Follow the steps sequentially and test thoroughly at each stage. Regular monitoring and maintenance are crucial for long-term success.

For any issues during implementation, refer to the troubleshooting section or consult the respective service documentation.