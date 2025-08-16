# AssetNest Production Setup with Nginx Proxy Manager

## Overview
This guide explains how to properly configure AssetNest behind Nginx Proxy Manager to resolve API routing issues.

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

Set these environment variables in your production environment:

```bash
# Backend
NODE_ENV=production
ALLOWED_ORIGINS=https://assetnest.btrnaidu.com,https://www.assetnest.btrnaidu.com

# Frontend
REACT_APP_API_URL=https://assetnest.btrnaidu.com/api
```

### 4. Docker Compose Production Setup

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    container_name: assetnest-frontend
    networks:
      - assetnest-network
    depends_on:
      - backend

  backend:
    build: ./backend
    container_name: assetnest-backend
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

## Performance Optimization

1. **Gzip Compression**: Enabled in nginx
2. **Static Asset Caching**: Configured for 1 year
3. **Database Indexing**: Proper indexes on frequently queried columns
4. **Connection Pooling**: MySQL connection pooling configured
