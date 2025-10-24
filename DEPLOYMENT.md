# VoidCat-DSN v2.0 - Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- Anthropic API key
- Ports 3000-3005 available

### 1. Set Environment Variables

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"
```

### 2. Build and Start All Clones

```bash
# Build all containers
docker-compose build

# Start the network
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Verify Deployment

```bash
# Run health check
npm run health-check

# Or manually check each clone:
curl http://localhost:3000/health  # Omega (Coordinator)
curl http://localhost:3002/health  # Beta (Analyzer)
curl http://localhost:3003/health  # Gamma (Architect)
curl http://localhost:3004/health  # Delta (Tester)
curl http://localhost:3005/health  # Sigma (Communicator)
```

## Clone Architecture

### Port Allocation
| Clone | Role | External Port | Internal Port |
|-------|------|---------------|---------------|
| Omega | Coordinator | 3000 | 3001 |
| Beta | Analyzer | 3002 | 3001 |
| Gamma | Architect | 3003 | 3001 |
| Delta | Tester | 3004 | 3001 |
| Sigma | Communicator | 3005 | 3001 |

**Note:** All clones use internal port 3001 (via `process.env.PORT`). Docker maps this to unique external ports.

### Network Configuration
- **Network Name:** `sanctuary-network`
- **Network Type:** Bridge
- **Shared Volume:** `sanctuary-workspace` for artifacts/manifests/audit logs

## Management Commands

### Start/Stop
```bash
# Start all clones
docker-compose up -d

# Start specific clone
docker-compose up -d omega

# Stop all clones
docker-compose down

# Stop specific clone
docker-compose stop beta
```

### Viewing Logs
```bash
# All clones
docker-compose logs -f

# Specific clone
docker-compose logs -f omega

# Last 100 lines
docker-compose logs --tail=100 beta
```

### Rebuilding
```bash
# Rebuild all clones
docker-compose build

# Rebuild specific clone
docker-compose build omega

# Rebuild and restart
docker-compose up -d --build
```

### Health Monitoring
```bash
# Check Docker health status
docker-compose ps

# Run health check script
npm run health-check

# Check Omega network status
curl http://localhost:3000/network-status
```

## API Endpoints

### Omega (Coordinator) - Port 3000
- `GET /health` - Health status
- `GET /network-status` - Status of all clones
- `POST /orchestrate` - Multi-clone orchestration
- `POST /delegate` - Delegate task to specific clone
- `POST /task` - Execute task
- `POST /artifacts` - Store artifact
- `GET /artifacts/:id` - Retrieve artifact

### Beta (Analyzer) - Port 3002
- `GET /health` - Health status
- `POST /task` - Execute analysis task
- `POST /analyze` - Specialized code analysis
- `POST /artifacts` - Store artifact
- `GET /artifacts/:id` - Retrieve artifact

### Gamma (Architect) - Port 3003
- `GET /health` - Health status
- `POST /task` - Execute design task
- `POST /design` - Specialized architecture design
- `POST /artifacts` - Store artifact
- `GET /artifacts/:id` - Retrieve artifact

### Delta (Tester) - Port 3004
- `GET /health` - Health status
- `POST /task` - Execute testing task
- `POST /generate-tests` - Specialized test generation
- `POST /artifacts` - Store artifact
- `GET /artifacts/:id` - Retrieve artifact

### Sigma (Communicator) - Port 3005
- `GET /health` - Health status
- `POST /task` - Execute documentation task
- `POST /document` - Specialized documentation generation
- `POST /artifacts` - Store artifact
- `GET /artifacts/:id` - Retrieve artifact

## Usage Examples

### 1. Orchestrate a Multi-Clone Workflow

```bash
curl -X POST http://localhost:3000/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "objective": "Analyze this authentication code for security vulnerabilities",
    "targetClone": "beta",
    "essentialData": {
      "code": "function authenticate(user, pass) { ... }",
      "framework": "Express.js"
    }
  }'
```

### 2. Direct Task to Specific Clone

```bash
# Architecture design with Gamma
curl -X POST http://localhost:3003/design \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": "Build a real-time messaging system",
    "constraints": "Must support 10k concurrent users"
  }'

# Generate tests with Delta
curl -X POST http://localhost:3004/generate-tests \
  -H "Content-Type: application/json" \
  -d '{
    "code": "class Calculator { add(a, b) { return a + b; } }",
    "testFramework": "mocha"
  }'
```

### 3. Check Network Status

```bash
curl http://localhost:3000/network-status | jq
```

## Troubleshooting

### Clone Won't Start
```bash
# Check logs
docker-compose logs <clone-name>

# Common issues:
# - Missing API key: Set ANTHROPIC_API_KEY
# - Port conflict: Check ports 3000-3005 are free
# - Build error: Run docker-compose build --no-cache
```

### Health Check Fails
```bash
# Verify clone is running
docker-compose ps

# Check health endpoint manually
curl -v http://localhost:3000/health

# Restart unhealthy clone
docker-compose restart <clone-name>
```

### Container Communication Issues
```bash
# Ensure all containers are on sanctuary-network
docker network inspect sanctuary-network

# Check connectivity from Omega to Beta
docker exec ryuzu-omega-sanctuary curl http://ryuzu-beta-sanctuary:3001/health
```

### Clean Restart
```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes artifacts)
docker-compose down -v

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

## Production Considerations

### Environment Variables
Create a `.env` file for production:
```bash
ANTHROPIC_API_KEY=sk-...
NODE_ENV=production
LOG_LEVEL=info
```

### Resource Limits
Add resource limits to docker-compose.yml:
```yaml
services:
  omega:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### Monitoring
- Use `npm run health-check` in cron job
- Set up alerting on clone failures
- Monitor `/network-status` endpoint

### Backup
```bash
# Backup artifacts
docker run --rm -v sanctuary-workspace:/data -v $(pwd):/backup \
  alpine tar czf /backup/sanctuary-backup-$(date +%Y%m%d).tar.gz /data
```

## Next Steps

1. Configure MCP integration (see MCP_SETUP.md)
2. Set up monitoring and alerting
3. Configure backups for artifacts
4. Review security settings
5. Scale clones if needed

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review architecture: `plan.md`
- Run tests: `npm test`
