# Production Testing Guide - Before Merging to Main

## Overview
This guide provides step-by-step instructions to test the production setup before merging the `fix-page-loading-on-prod-server` branch to `main`.

## Pre-Testing Checklist

### ✅ Development Environment
- [ ] All containers running locally: `docker-compose -f docker-compose.dev.yml ps`
- [ ] Frontend accessible: `http://localhost:4000`
- [ ] Backend API working: `http://localhost:8000/api/health`
- [ ] Login functional: Test with `admin@demo.com` / `password`

### ✅ Code Quality
- [ ] No linting errors: `npm run lint` (if available)
- [ ] All tests passing: `npm test` (if available)
- [ ] No console errors in browser developer tools

## Production Testing Steps

### 1. Deploy to Production Server

```bash
# SSH to your production server
ssh user@your-production-server

# Navigate to AssetNest directory
cd /path/to/AssetNest

# Pull the latest changes
git fetch origin
git checkout fix-page-loading-on-prod-server
git pull origin fix-page-loading-on-prod-server

# Stop existing containers
docker-compose down

# Build and start production containers
docker-compose build
docker-compose up -d

# Check container status
docker-compose ps
```

### 2. Verify Container Status

```bash
# Check all containers are running
docker-compose ps

# Expected output:
# assetnest-frontend    Up     (no ports exposed)
# assetnest-backend     Up     (no ports exposed)
# assetnest-mysql       Up     (no ports exposed)
```

### 3. Test Internal Communication

```bash
# Test frontend to backend communication
docker exec -it assetnest-frontend curl -I http://backend:8000/api/health

# Expected: HTTP/1.1 200 OK

# Test frontend nginx configuration
docker exec -it assetnest-frontend nginx -t

# Expected: nginx: configuration file /etc/nginx/nginx.conf syntax is ok
```

### 4. Configure Nginx Proxy Manager

#### A. Create/Update Proxy Host
1. **Domain**: `assetnest.btrnaidu.com`
2. **Forward to**: `http://frontend:80`
3. **SSL**: Enable SSL certificate
4. **Advanced Settings**:
   - ✅ Enable "Websocket Support"
   - ✅ Enable "Block Common Exploits"
   - ✅ Enable "Client Certificate" (optional)

#### B. Verify Proxy Configuration
```bash
# Test from production server
curl -I http://frontend:80

# Expected: HTTP/1.1 200 OK
```

### 5. Test External Access

#### A. Health Check
```bash
# Test API health endpoint
curl -I https://assetnest.btrnaidu.com/api/health

# Expected: HTTP/1.1 200 OK
```

#### B. Frontend Access
```bash
# Test frontend loading
curl -I https://assetnest.btrnaidu.com

# Expected: HTTP/1.1 200 OK
```

### 6. Browser Testing

#### A. Open Browser Developer Tools
1. Open `https://assetnest.btrnaidu.com`
2. Press `F12` to open developer tools
3. Go to **Network** tab
4. Go to **Console** tab

#### B. Test Login Functionality
1. **Navigate** to login page
2. **Enter credentials**:
   - Email: `admin@demo.com`
   - Password: `password`
3. **Click Login**
4. **Check for errors** in Console tab
5. **Verify successful login** and redirect to dashboard

#### C. Test API Calls
1. **Monitor Network tab** during login
2. **Verify** `POST /api/auth/login` returns 200
3. **Check** CORS headers are present
4. **Confirm** JWT token is received

### 7. Feature Testing

#### A. Dashboard
- [ ] Dashboard loads without errors
- [ ] Currency selector works in sidebar
- [ ] All stat cards display correctly
- [ ] Navigation menu works

#### B. Assets
- [ ] Assets page loads
- [ ] Add new asset works
- [ ] Currency filtering works
- [ ] Bank account linking works

#### C. Transactions
- [ ] Transactions page loads
- [ ] Add new transaction works
- [ ] Bank account selection works
- [ ] Currency filtering works

#### D. Bank Accounts
- [ ] Bank accounts page loads
- [ ] Add new bank account works
- [ ] View account details works
- [ ] Account balance updates work

#### E. Settings
- [ ] Settings page loads
- [ ] Currency management works
- [ ] Add/remove currencies works

### 8. Security Testing

#### A. Port Security
```bash
# Verify no external ports are exposed
docker ps

# Should show: (no ports exposed) for all containers
```

#### B. Network Isolation
```bash
# Test that host cannot access backend directly
curl -I http://localhost:8000/api/health

# Expected: Connection refused (this is good!)
```

#### C. CORS Configuration
```bash
# Test CORS with wrong origin
curl -X POST https://assetnest.btrnaidu.com/api/auth/login \
  -H "Origin: https://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}'

# Expected: CORS error (this is good!)
```

### 9. Performance Testing

#### A. Load Time
- [ ] Frontend loads in < 3 seconds
- [ ] API responses are < 1 second
- [ ] No timeout errors

#### B. Resource Usage
```bash
# Check container resource usage
docker stats --no-stream

# Verify reasonable CPU and memory usage
```

### 10. Error Handling

#### A. Test Error Scenarios
1. **Invalid login credentials**
2. **Network interruption** (temporarily stop backend)
3. **Database connection issues**
4. **Invalid API requests**

#### B. Verify Error Messages
- [ ] User-friendly error messages
- [ ] No technical details exposed
- [ ] Proper HTTP status codes

## Rollback Plan

### If Issues Found
```bash
# Revert to previous working version
git checkout main
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d

# Or use specific tag
git checkout v1.3.0
docker-compose down
docker-compose build
docker-compose up -d
```

## Success Criteria

### ✅ Ready for Merge
- [ ] All containers running without errors
- [ ] Frontend accessible via domain
- [ ] Login functionality works
- [ ] All major features functional
- [ ] No security vulnerabilities
- [ ] Performance acceptable
- [ ] Error handling working

### ❌ Do Not Merge If
- [ ] Any containers failing to start
- [ ] Frontend not loading
- [ ] Login not working
- [ ] API calls failing
- [ ] Security issues found
- [ ] Performance problems
- [ ] User experience degraded

## Final Steps Before Merge

### 1. Create Pull Request
```bash
# Push final changes
git push origin fix-page-loading-on-prod-server

# Create PR on GitHub
# Title: "Fix production page loading issues with Nginx Proxy Manager"
# Description: Include testing results and any notes
```

### 2. Update Version
```bash
# Update version in package.json
# From: "1.3.0"
# To: "1.3.1" or "1.4.0" depending on changes
```

### 3. Create Release Notes
- Document all changes
- Include testing results
- Note any breaking changes
- Provide upgrade instructions

## Contact Information

If issues are found during testing:
1. **Document the problem** with screenshots/logs
2. **Check container logs**: `docker-compose logs [service]`
3. **Verify configuration** matches this guide
4. **Test rollback** before making changes
