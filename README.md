# AssetNest - Family Asset & Finance Tracking Application

**AssetNest** is a comprehensive asset and finance tracking application designed for individuals and families. Track properties, stocks, gold, mutual funds, insurance policies, income, expenses, and budgets all in one place.

## Features

- 🏠 **Asset Management**: Property, Stocks, Gold, Mutual Funds, Insurance
- 💰 **Finance Tracking**: Income, Expenses, Budget Planning
- 👨‍👩‍👧‍👦 **Family Support**: Multi-user households with role-based access
- 📊 **Reports & Analytics**: Net worth tracking, spending analysis
- 🔒 **Secure**: JWT authentication, rate limiting, security headers
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🐳 **Docker Ready**: Production and development Docker configurations

## Quick Start

### Prerequisites
- Docker and Docker Compose
- 4GB+ available RAM
- 10GB+ available disk space

### Production Deployment

1. **Clone/Download the project**
   ```bash
   # If you have git
   git clone <your-repo-url>
   cd assetnest-docker

   # Or extract the downloaded zip file
   unzip assetnest-docker.zip
   cd assetnest-docker
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env file with secure passwords and JWT secret
   nano .env  # or use your preferred editor
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Verify Deployment**
   - Frontend: http://localhost:4000 (Landing page and application)
   - Backend API: http://localhost:8000/api/health
   - Login with demo credentials: admin@demo.com / password

### Environment Configuration

The application uses several environment variables for configuration. Create a `.env` file in the root directory:

```bash
# Database Configuration
DB_ROOT_PASSWORD=your_secure_root_password
DB_NAME=assetnest
DB_USER=assetnest_user
DB_PASSWORD=your_secure_user_password

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://localhost:4000

# Frontend API URL (optional, defaults to http://localhost:8000/api)
REACT_APP_API_URL=https://your-backend-domain.com/api
```

**Important Notes:**
- Replace all placeholder values with secure passwords and secrets
- For production, use strong passwords and a 32+ character JWT secret
- The `ALLOWED_ORIGINS` should include your frontend domain(s)
- If your backend is on a different domain than localhost, set `REACT_APP_API_URL`

### Development Setup

1. **Use development compose file**
   ```bash
   cp .env.example .env
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Hot reload enabled** - Changes to source files will automatically reload

## Architecture

- **Frontend**: React 18 + Material-UI + Recharts
- **Landing Page**: Modern, responsive design showcasing all features
- **Backend**: Node.js + Express + MySQL
- **Database**: MySQL 8.0 with comprehensive schema
- **Containerization**: Multi-stage Docker builds
- **Security**: Helmet, CORS, Rate Limiting, JWT

## Database Schema

The application uses a normalized MySQL schema supporting:
- Multi-tenant households with user roles
- Generic asset tracking with specialized detail tables
- Flexible transaction categorization
- Budget planning and monitoring
- Net worth snapshots for historical tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget

### Reports
- `GET /api/reports/networth` - Net worth over time
- `GET /api/reports/expenses` - Expense analysis
- `GET /api/reports/budget-vs-actual` - Budget comparison

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Security headers via Helmet
- Input validation and sanitization
- SQL injection prevention with parameterized queries

## Customization

### Adding New Asset Types
1. Add entry to `asset_types` table
2. Create detail table (e.g., `crypto_assets`)
3. Add API endpoints in `/backend/src/routes/assets.js`
4. Create React components in `/frontend/src/components/assets/`

### Adding New Transaction Categories
Categories are hierarchical and household-specific. Add via the UI or directly in the database.

## Production Considerations

### Performance
- Database indexing on frequently queried columns
- Connection pooling configured
- Compression middleware enabled
- Static asset caching

### Security
- Change all default passwords in `.env`
- Use strong JWT secret (32+ characters)
- Configure CORS for your domain in `ALLOWED_ORIGINS`
- Enable HTTPS in production
- Regular database backups
- Set appropriate `ALLOWED_ORIGINS` to prevent unauthorized access

### Monitoring
- Health check endpoints available
- Structured logging configured
- Container health checks enabled

## Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure your domain is included in `ALLOWED_ORIGINS`
- Check that the backend is accessible from your frontend domain
- Verify the `REACT_APP_API_URL` is set correctly for production

**Database Connection Issues:**
- Verify MySQL container is healthy: `docker-compose ps`
- Check database logs: `docker-compose logs mysql`
- Ensure environment variables are set correctly

**Frontend Not Loading:**
- Check if port 4000 is available (or change in docker-compose.yml)
- Verify frontend container is running: `docker-compose ps`
- Check frontend logs: `docker-compose logs frontend`

## Support

For issues, feature requests, or questions:
1. Check the logs: `docker-compose logs [service-name]`
2. Verify environment configuration
3. Ensure all containers are healthy: `docker-compose ps`

## License

MIT License - AssetNest is free and open source software.

## 💝 Support AssetNest

AssetNest is free and open source. If you find it useful, please consider supporting the project:

### Donation Options

- **PayPal**: me@btrnaidu.com
- **Bitcoin**: `39bqKDKvyRmoHEXWaGcxuQf8aCaSoNfb3L`
- **Ethereum**: `0xa6b7afc3d05f3197cd5b36a23270d92e31e45041`

Your donations help us maintain and improve AssetNest for everyone. Every contribution makes a difference!

---

Made with ❤️ for better family financial management
