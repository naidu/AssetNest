# AssetNest Deployment Guide

## Quick Setup

1. **Extract the files**
   ```bash
   unzip assetnest-docker.zip
   cd assetnest-docker
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your secure values:
   - Change DB_PASSWORD and DB_ROOT_PASSWORD to secure passwords
   - Set JWT_SECRET to a random 32+ character string
   - Update REACT_APP_API_URL if deploying to a different domain

3. **Deploy with Docker**
   ```bash
   # Production deployment
   docker-compose up -d

   # Development with hot reload
   docker-compose -f docker-compose.dev.yml up
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Database: localhost:3306

## Default Login Credentials

- **Admin User:** admin@demo.com / password
- **Member User:** member@demo.com / password

## Production Checklist

- [ ] Change all default passwords in .env
- [ ] Use a strong JWT secret (32+ characters)
- [ ] Configure CORS for your domain in backend/src/app.js
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Update REACT_APP_API_URL for production domain

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if MySQL container is running: `docker-compose ps`
   - Verify environment variables in .env file
   - Check container logs: `docker-compose logs mysql`

2. **Backend API Not Responding**
   - Check backend logs: `docker-compose logs backend`
   - Verify database is initialized with: `docker-compose logs mysql`
   - Ensure port 8000 is not in use by another application

3. **Frontend Not Loading**
   - Check frontend logs: `docker-compose logs frontend`
   - Verify backend is running and healthy
   - Check browser network tab for API call errors

### Container Management

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs [service-name]

# Restart services
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Rebuild containers
docker-compose build --no-cache
```

## Customization

### Adding New Asset Types
1. Add entry to asset_types table in database
2. Create new detail table (see existing examples)
3. Update backend controllers and routes
4. Add frontend components for the new asset type

### Modifying the UI
- Frontend source code is in `frontend/src/`
- Main theme configuration in `frontend/src/App.js`
- Component styles use Material-UI theming

### Database Schema Changes
- Create migration files in `backend/migrations/`
- Update the schema in `database/init/01-schema.sql`
- Rebuild containers to apply changes

## Support

For technical issues:
1. Check the container logs first
2. Verify all environment variables are set correctly
3. Ensure Docker and Docker Compose are properly installed
4. Check firewall settings for required ports (3000, 8000, 3306)

## Security Notes

- Never use default passwords in production
- Always use HTTPS in production
- Regularly backup your database
- Keep Docker images updated
- Implement proper logging and monitoring
