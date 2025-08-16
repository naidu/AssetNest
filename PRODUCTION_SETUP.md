# AssetNest Production Setup with Nginx Proxy Manager

## Overview
This guide explains how to properly configure AssetNest behind Nginx Proxy Manager to resolve API routing issues.

## Architecture

```
Internet → Nginx Proxy Manager → Frontend Container (nginx) → Backend Container
                                    ↓
                              React App (served by nginx)
                                    ↓
                              API calls proxied to backend
```

**Key Points:**
- **No external ports exposed** - All access through Nginx Proxy Manager
- **Internal communication** - Frontend nginx proxies API calls to backend
- **Network isolation** - Services communicate only through Docker network
- **Security** - No direct access to backend or database from outside

### How Internal Communication Works

Even without external port exposure, containers can communicate internally:

```bash
# This works because containers are in the same Docker network
docker exec -it assetnest-frontend curl http://backend:8000/api/health

# Docker automatically resolves 'backend' to the container's internal IP
# Backend container: 172.20.0.3:8000
# Frontend container: 172.20.0.4:80
# MySQL container: 172.20.0.2:3306
```

**Why this works:**
- **Docker DNS**: Container names resolve to internal IPs
- **Internal ports**: Port 8000 is still listening inside the backend container
- **Network isolation**: Only containers in the same network can communicate
- **No external exposure**: Host machine cannot directly access these ports

## Problem
When running AssetNest behind Nginx Proxy Manager, you may encounter:
- `405 Method Not Allowed` errors on API calls
- API requests not reaching the backend
- Frontend loading but API calls failing

## Solution

### 1. Updated Nginx Configuration
The frontend nginx configuration has been updated to properly proxy API requests to the backend:

```nginx
# Proxy API requests to backend
location /api/ {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
}
```

### 2. Nginx Proxy Manager Configuration

#### Option A: Single Domain Setup (Recommended)
1. **Create a single proxy host** for your domain (e.g., `assetnest.btrnaidu.com`)
2. **Forward to**: `http://frontend:80` (not the backend directly)
3. **Enable SSL** if needed
4. **Advanced settings**:
   - Enable "Websocket Support"
   - Enable "Block Common Exploits"
   - Enable "Client Certificate"

#### Option B: Separate API Domain (Alternative)
If you prefer separate domains:
1. **Frontend proxy**: `assetnest.btrnaidu.com` → `http://frontend:80`
2. **API proxy**: `api.assetnest.btrnaidu.com` → `http://backend:8000`

### 3. Environment Variables

Create a `.env` file in your project root with these variables:

```bash
# Database Configuration
DB_ROOT_PASSWORD=your_secure_root_password
DB_NAME=assetnest
DB_USER=assetnest_user
DB_PASSWORD=your_secure_db_password

# JWT Secret (generate a secure random string)
JWT_SECRET=your_very_long_secure_jwt_secret_key_here

# CORS Allowed Origins (comma-separated)
# For production, only include your actual domains
ALLOWED_ORIGINS=https://assetnest.btrnaidu.com,https://www.assetnest.btrnaidu.com

# Frontend API URL
# For production with Nginx Proxy Manager, use your domain
REACT_APP_API_URL=https://assetnest.btrnaidu.com/api
```

**Important Notes:**
- **REACT_APP_API_URL**: Must use your production domain, NOT localhost
- **ALLOWED_ORIGINS**: Only include your actual production domains
- **Never commit .env file**: It contains sensitive information

### 4. Docker Compose Production Setup

**Important**: The production configuration does NOT expose ports externally. All access is through Nginx Proxy Manager.

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    container_name: assetnest-frontend
    # No ports exposed - accessed only through Nginx Proxy Manager
    networks:
      - assetnest-network
    depends_on:
      - backend

  backend:
    build: ./backend
    container_name: assetnest-backend
    # No ports exposed - accessed only through internal Docker network
    environment:
      - NODE_ENV=production
      - ALLOWED_ORIGINS=https://assetnest.btrnaidu.com,https://www.assetnest.btrnaidu.com
    networks:
      - assetnest-network
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    container_name: assetnest-mysql
    # No ports exposed - accessed only through internal Docker network
    environment:
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_DATABASE: assetnest
      MYSQL_USER: assetnest_user
      MYSQL_PASSWORD: your_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - assetnest-network

networks:
  assetnest-network:
    driver: bridge

volumes:
  mysql_data:
```

## Testing

### 1. Health Check
Test if the API is accessible:
```bash
curl -I https://assetnest.btrnaidu.com/api/health
```

### 2. Login Test
Test the login endpoint:
```bash
curl -X POST https://assetnest.btrnaidu.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"password"}'
```

### 3. Browser Test
1. Open browser developer tools (F12)
2. Go to Network tab
3. Try to login
4. Check if API calls return 200 status codes

## Troubleshooting

### Common Issues

1. **405 Method Not Allowed**
   - Check if nginx proxy is forwarding requests correctly
   - Verify the proxy_pass URL in nginx configuration

2. **CORS Errors**
   - Ensure ALLOWED_ORIGINS includes your domain
   - Check if the origin is being forwarded correctly

3. **Connection Refused**
   - Verify backend container is running
   - Check if ports are exposed correctly

### Debug Steps

1. **Check container logs**:
   ```bash
   docker-compose logs frontend
   docker-compose logs backend
   ```

2. **Test internal connectivity**:
   ```bash
   docker exec -it assetnest-frontend curl http://backend:8000/api/health
   ```

3. **Check nginx configuration**:
   ```bash
   docker exec -it assetnest-frontend nginx -t
   ```

## Security Considerations

1. **SSL/TLS**: Always use HTTPS in production
2. **Rate Limiting**: Already configured in the backend
3. **CORS**: Properly configured for your domain
4. **Headers**: Security headers are set in nginx configuration
5. **Port Security**: No external ports exposed - all access through Nginx Proxy Manager
6. **Network Isolation**: Services communicate only through internal Docker network

## Performance Optimization

1. **Gzip Compression**: Enabled in nginx
2. **Static Asset Caching**: Configured for 1 year
3. **Database Indexing**: Proper indexes on frequently queried columns
4. **Connection Pooling**: MySQL connection pooling configured
