# AssetNest - Asset Management System

A comprehensive asset management system built with React frontend and Node.js backend, designed to help households track and manage their assets effectively.

## Features

- **User Authentication**: Secure registration and login system
- **Asset Management**: Track various types of assets (properties, vehicles, investments, etc.)
- **Bank Account Management**: Link transactions and assets to bank accounts
- **Multi-Currency Support**: Dynamic currency management with custom currencies
- **Budget Planning**: Create and manage household budgets
- **Transaction Tracking**: Monitor income and expenses with bank account linking
- **Reporting**: Generate comprehensive financial reports
- **Multi-User Support**: Household-based user management
- **Production Ready**: Optimized for Nginx Proxy Manager deployment

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/naidu/AssetNest.git
   cd AssetNest
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```bash
   # Edit .env file with your settings
   nano .env
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Verify deployment**
   - Frontend: http://localhost:4000 (Landing page and application)
   - Backend API: http://localhost:8000/api/health (Health check)
   - Database: MySQL running in container

### Production Deployment

For production deployment with Nginx Proxy Manager:

1. **Deploy containers** (no external ports exposed)
   ```bash
   docker-compose up -d
   ```

2. **Configure Nginx Proxy Manager**
   - Domain: `your-domain.com`
   - Forward to: `http://frontend:80`
   - Enable SSL and security features

3. **Run production tests**
   ```bash
   ./scripts/test-production.sh
   ```

4. **Access application**
   - URL: `https://your-domain.com`
   - Login: `admin@demo.com` / `password`

## Demo Access

The application comes with a pre-configured demo user for testing:

**Demo User Credentials:**
- **Email**: admin@demo.com
- **Password**: password
- **Name**: Demo Admin
- **Household**: Demo Family

**Alternative Demo User:**
- **Email**: member@demo.com
- **Password**: password
- **Name**: Demo Member
- **Household**: Demo Family

You can use these credentials to log in and explore the application features without creating a new account.

## Environment Configuration

### Local Development
For local development, ensure your `.env` file has:
```
REACT_APP_API_URL=http://localhost:8000/api
ALLOWED_ORIGINS=http://localhost:4000,https://assetnest.btrnaidu.com,https://www.assetnest.btrnaidu.com
```

### Production Deployment
For production deployment, use:
```
REACT_APP_API_URL=https://assetnest.btrnaidu.com/api
ALLOWED_ORIGINS=http://localhost:4000,https://assetnest.btrnaidu.com,https://www.assetnest.btrnaidu.com
```

**Note**: The frontend automatically detects the environment and uses the appropriate API URL. For localhost, it uses `http://localhost:8000/api`, and for production domains, it uses the same domain as the frontend.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_ROOT_PASSWORD=rootpassword123
DB_NAME=assetnest
DB_USER=assetnest_user
DB_PASSWORD=assetnest_password

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:4000,https://assetnest.btrnaidu.com,https://www.assetnest.btrnaidu.com

# Frontend API URL
REACT_APP_API_URL=http://localhost:8000/api
```

## Security

- **CORS**: Configured to allow specific origins
- **JWT**: Secure token-based authentication
- **Database**: Isolated MySQL container
- **Environment Variables**: Sensitive data stored in `.env` file

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Check that `ALLOWED_ORIGINS` includes your frontend URL
2. Ensure the backend is running and accessible
3. Verify the API URL configuration in `.env`

### Database Connection Issues
If the backend can't connect to the database:
1. Check that the MySQL container is running: `docker-compose ps`
2. Verify database credentials in `.env`
3. Check container logs: `docker-compose logs backend`

### Frontend Loading Issues
If the frontend doesn't load properly:
1. Check that the frontend container is running: `docker-compose ps`
2. Verify the API URL configuration
3. Check container logs: `docker-compose logs frontend`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Assets
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Health Check
- `GET /api/health` - API health status

## Development

### Project Structure
```
AssetNest/
├── backend/          # Node.js API server
├── frontend/         # React application
├── database/         # Database initialization scripts
├── docker-compose.yml
└── README.md
```

### Adding New Features
1. Backend: Add routes in `backend/src/routes/`
2. Frontend: Add components in `frontend/src/components/`
3. Database: Update schema in `database/init/01-schema.sql`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
