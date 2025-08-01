# Contributing to AssetNest

Thank you for your interest in contributing to AssetNest! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Git
- Node.js 18+ (for local development)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/AssetNest.git
   cd AssetNest
   ```

2. **Set up the development environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/health

## 📝 How to Contribute

### 1. Reporting Issues

Before creating an issue, please:
- Check if the issue has already been reported
- Use the issue templates if available
- Provide detailed information including:
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details
  - Screenshots if applicable

### 2. Feature Requests

When requesting features:
- Describe the use case clearly
- Explain the expected benefits
- Consider if it aligns with the project's goals
- Check if similar features have been requested

### 3. Code Contributions

#### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run tests
   docker-compose exec backend npm test
   
   # Check for linting issues
   docker-compose exec frontend npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

#### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 4. Code Standards

#### Frontend (React)
- Use functional components with hooks
- Follow Material-UI design patterns
- Maintain responsive design
- Write meaningful component and function names
- Add PropTypes or TypeScript types

#### Backend (Node.js/Express)
- Follow RESTful API conventions
- Use async/await for database operations
- Implement proper error handling
- Add input validation
- Write comprehensive tests

#### Database
- Use migrations for schema changes
- Follow naming conventions
- Add appropriate indexes
- Document complex queries

### 5. Testing

#### Frontend Tests
- Unit tests for components
- Integration tests for user flows
- Test user interactions and state changes

#### Backend Tests
- Unit tests for controllers and services
- Integration tests for API endpoints
- Database transaction tests

### 6. Documentation

When contributing, please:
- Update README.md if needed
- Add inline code comments for complex logic
- Update API documentation
- Include setup instructions for new features

## 🏗️ Project Structure

```
AssetNest/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── routes/       # API routes
│   │   └── config/       # Configuration
│   └── package.json
├── frontend/          # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── context/      # React context
│   └── package.json
├── database/          # Database schema and migrations
│   └── init/
├── docker-compose.yml # Production setup
└── docker-compose.dev.yml # Development setup
```

## 🔧 Development Guidelines

### Environment Variables
- Use `.env.example` as a template
- Never commit sensitive information
- Document new environment variables

### Database Changes
- Create migration scripts
- Update seed data if needed
- Test migrations on clean database

### API Changes
- Maintain backward compatibility when possible
- Version APIs if breaking changes are needed
- Update API documentation

### UI/UX Changes
- Follow Material-UI design principles
- Ensure responsive design
- Test on different screen sizes
- Consider accessibility

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**
   - Operating system
   - Browser version (if applicable)
   - Docker version
   - Node.js version

2. **Steps to reproduce**
   - Clear, step-by-step instructions
   - Sample data if needed

3. **Expected vs actual behavior**
   - What you expected to happen
   - What actually happened

4. **Additional information**
   - Screenshots or screen recordings
   - Console errors
   - Network tab information

## 📋 Code Review Process

1. **Automated checks** must pass
   - Tests
   - Linting
   - Build process

2. **Manual review** by maintainers
   - Code quality
   - Security considerations
   - Performance impact

3. **Documentation** updates
   - README changes
   - API documentation
   - Code comments

## 🎯 Areas for Contribution

### High Priority
- Bug fixes
- Security improvements
- Performance optimizations
- Documentation improvements

### Medium Priority
- New features aligned with project goals
- UI/UX improvements
- Test coverage improvements
- Code refactoring

### Low Priority
- Nice-to-have features
- Cosmetic changes
- Experimental features

## 📞 Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check README.md and inline code comments

## 📄 License

By contributing to AssetNest, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AssetNest! 🎉 