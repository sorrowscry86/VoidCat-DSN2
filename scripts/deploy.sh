#!/bin/bash

# VoidCat-DSN v2.0 - Deployment Script
# Automated deployment of the entire Sanctuary Network

set -e  # Exit on any error

echo "🚀 VoidCat-DSN v2.0 Deployment"
echo "================================"
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker 20.10+ first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose 2.0+ first."
    exit 1
fi

# Check API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY environment variable not set"
    echo "   Please set it with: export ANTHROPIC_API_KEY='your-api-key-here'"
    exit 1
fi

echo "   - Docker: $(docker --version)"
echo "   - Docker Compose: $(docker-compose --version)"
echo "   - API Key: Set ✓"
echo ""

# Create workspace directories
echo "✓ Creating workspace directories..."
mkdir -p workspace/artifacts workspace/manifests workspace/audit workspace/temp
echo "   - workspace/artifacts"
echo "   - workspace/manifests"
echo "   - workspace/audit"
echo "   - workspace/temp"
echo ""

# Build Docker images
echo "✓ Building Docker images..."
echo "   (This may take a few minutes on first run)"
docker-compose build

echo ""
echo "✓ Starting Sanctuary Network..."
docker-compose up -d

echo ""
echo "✓ Waiting for clones to initialize (30 seconds)..."
sleep 30

echo ""
echo "✓ Running health checks..."
echo ""

# Run health check
if npm run health-check; then
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📍 Sanctuary Network Status:"
    echo "   - Omega (Coordinator):   http://localhost:3000/health"
    echo "   - Beta (Analyzer):       http://localhost:3002/health"
    echo "   - Gamma (Architect):     http://localhost:3003/health"
    echo "   - Delta (Tester):        http://localhost:3004/health"
    echo "   - Sigma (Communicator):  http://localhost:3005/health"
    echo ""
    echo "📋 Useful Commands:"
    echo "   - View logs:     docker-compose logs -f"
    echo "   - Stop network:  docker-compose down"
    echo "   - Restart:       docker-compose restart"
    echo "   - Health check:  npm run health-check"
    echo ""
else
    echo ""
    echo "⚠️  Some clones may not be healthy yet."
    echo "   Give them a few more seconds to initialize, then run:"
    echo "   npm run health-check"
    echo ""
    echo "   To view logs: docker-compose logs -f"
    echo ""
fi
