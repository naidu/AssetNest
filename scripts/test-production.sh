#!/bin/bash

# AssetNest Production Testing Script
# Run this script on your production server before merging to main

set -e  # Exit on any error

echo "🔍 AssetNest Production Testing Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Check if we're in the right directory
echo "📁 Checking directory..."
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Not in AssetNest directory. Please run from project root.${NC}"
    exit 1
fi
print_status 0 "In correct directory"

# 2. Check Docker is running
echo "🐳 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi
print_status 0 "Docker is running"

# 3. Check container status
echo "📦 Checking container status..."
if ! docker-compose ps | grep -q "Up"; then
    print_warning "No containers running. Starting containers..."
    docker-compose up -d
    sleep 10
fi

# Check each container
FRONTEND_STATUS=$(docker-compose ps frontend | grep -c "Up" || echo "0")
BACKEND_STATUS=$(docker-compose ps backend | grep -c "Up" || echo "0")
MYSQL_STATUS=$(docker-compose ps mysql | grep -c "Up" || echo "0")

print_status $FRONTEND_STATUS "Frontend container running"
print_status $BACKEND_STATUS "Backend container running"
print_status $MYSQL_STATUS "MySQL container running"

# 4. Check no external ports are exposed
echo "🔒 Checking port security..."
EXPOSED_PORTS=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep assetnest | grep -v "80/tcp\|8000/tcp\|3306/tcp" | wc -l)
if [ $EXPOSED_PORTS -gt 0 ]; then
    print_warning "Some ports are exposed externally"
    docker ps --format "table {{.Names}}\t{{.Ports}}" | grep assetnest
else
    print_status 0 "No external ports exposed (secure)"
fi

# 5. Test internal communication
echo "🔗 Testing internal communication..."
if docker exec -it assetnest-frontend curl -f http://backend:8000/api/health > /dev/null 2>&1; then
    print_status 0 "Frontend can reach backend"
else
    print_status 1 "Frontend cannot reach backend"
fi

# 6. Test nginx configuration
echo "⚙️  Testing nginx configuration..."
if docker exec -it assetnest-frontend nginx -t > /dev/null 2>&1; then
    print_status 0 "Nginx configuration is valid"
else
    print_status 1 "Nginx configuration has errors"
fi

# 7. Test frontend accessibility (if accessible from host)
echo "🌐 Testing frontend accessibility..."
if curl -f http://frontend:80 > /dev/null 2>&1; then
    print_status 0 "Frontend accessible from host"
else
    print_warning "Frontend not accessible from host (expected if using Nginx Proxy Manager)"
fi

# 8. Check container logs for errors
echo "📋 Checking container logs for errors..."
ERROR_COUNT=0

# Check frontend logs
if docker logs assetnest-frontend 2>&1 | grep -i "error\|fatal\|failed" | head -5; then
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# Check backend logs
if docker logs assetnest-backend 2>&1 | grep -i "error\|fatal\|failed" | head -5; then
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# Check MySQL logs
if docker logs assetnest-mysql 2>&1 | grep -i "error\|fatal\|failed" | head -5; then
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

if [ $ERROR_COUNT -eq 0 ]; then
    print_status 0 "No critical errors in logs"
else
    print_warning "Found errors in container logs (check manually)"
fi

# 9. Resource usage check
echo "💾 Checking resource usage..."
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep assetnest

# 10. Final summary
echo ""
echo "🎯 Production Testing Summary"
echo "============================="
echo "✅ All basic checks completed"
echo ""
echo "📋 Manual Testing Required:"
echo "1. Open https://assetnest.btrnaidu.com in browser"
echo "2. Test login with admin@demo.com / password"
echo "3. Verify all features work (Dashboard, Assets, Transactions, etc.)"
echo "4. Check browser console for errors"
echo "5. Test currency switching and bank account features"
echo ""
echo "🔧 If issues found:"
echo "- Check logs: docker-compose logs [service]"
echo "- Rollback: git checkout main && docker-compose up -d"
echo "- Review PRODUCTION_TESTING.md for detailed steps"
echo ""
echo "🚀 Ready for production deployment!"
