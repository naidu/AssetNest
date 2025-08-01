# AssetNest v1.1.0 - Minor Release

## 🎉 What's New

AssetNest v1.1.0 brings significant improvements to the donation system, version management, and overall user experience.

## ✨ Key Features Added

### 🎨 **Enhanced Donation Section**
- **Uniform card heights** - All donation cards now have consistent sizing
- **Copy buttons** - One-click copy for all donation addresses (PayPal, Bitcoin, Ethereum)
- **Better readability** - Improved text contrast and spacing
- **Responsive design** - Works perfectly on all devices

### 🔧 **Automated Version Management**
- **Dynamic version display** - Landing page automatically reads version from package.json
- **Version update script** - Easy version bumping with `npm run version <version>`
- **Clean version display** - Removed emoji for better compatibility
- **Consistent versioning** - All package.json files stay in sync

### 🚀 **Technical Improvements**
- **Better UX** - Improved user interface and interactions
- **Enhanced accessibility** - Better contrast and readability
- **Professional appearance** - More polished donation section
- **Cross-platform compatibility** - Works across all browsers and systems

## 🛠️ Technical Details

### Version Management
- Automated version reading from package.json
- Script for easy version updates: `npm run version 1.1.0`
- Git tag automation
- Consistent versioning across all components

### Donation System
- PayPal: me@btrnaidu.com
- Bitcoin: 39bqKDKvyRmoHEXWaGcxuQf8aCaSoNfb3L
- Ethereum: 0xa6b7afc3d05f3197cd5b36a23270d92e31e45041

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/naidu/AssetNest.git
   cd AssetNest
   ```

2. **Deploy with Docker**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/health

## 🛠️ Tech Stack

- **Frontend**: React 18 + Material-UI + Recharts
- **Backend**: Node.js + Express + MySQL
- **Database**: MySQL 8.0 with comprehensive schema
- **Containerization**: Docker with multi-stage builds
- **Security**: Helmet, CORS, Rate Limiting, JWT

## 📚 Documentation

- [README.md](README.md) - Complete setup and usage guide
- [CHANGELOG.md](CHANGELOG.md) - Detailed changelog
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions

## 🔧 Development

For development setup:
```bash
docker-compose -f docker-compose.dev.yml up
```

## 💝 Support AssetNest

AssetNest is free and open source. If you find it useful, please consider supporting the project:

- **PayPal**: me@btrnaidu.com
- **Bitcoin**: `39bqKDKvyRmoHEXWaGcxuQf8aCaSoNfb3L`
- **Ethereum**: `0xa6b7afc3d05f3197cd5b36a23270d92e31e45041`

## 🤝 Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) and submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**AssetNest v1.1.0** - Your complete financial management solution for families and individuals.

## 🔗 Links

- **Repository**: https://github.com/naidu/AssetNest
- **Issues**: https://github.com/naidu/AssetNest/issues
- **Discussions**: https://github.com/naidu/AssetNest/discussions 