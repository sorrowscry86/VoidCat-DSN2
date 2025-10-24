# VoidCat-DSN v2.0 - Troubleshooting Guide

## Quick Diagnostics

Start with these quick checks:

```bash
# 1. Check if Docker is running
docker --version
docker-compose --version

# 2. Check clone health
npm run health-check

# 3. Check Docker containers
docker-compose ps

# 4. View recent logs
docker-compose logs --tail=50
```

## Common Issues

### Issue: Clones Won't Start

**Symptoms:**
- `docker-compose up` fails
- Containers exit immediately
- Health checks fail

**Solutions:**

1. **Check API Key**
   ```bash
   echo $ANTHROPIC_API_KEY
   # Should show: sk-ant-...
   ```
   If empty:
   ```bash
   export ANTHROPIC_API_KEY="your-key-here"
   ```

2. **Port Conflicts**
   Check if ports 3000-3005 are already in use:
   ```bash
   # Linux/macOS
   lsof -i :3000
   lsof -i :3002
   lsof -i :3003
   lsof -i :3004
   lsof -i :3005
   
   # Windows PowerShell
   netstat -ano | findstr :3000
   netstat -ano | findstr :3002
   # etc.
   ```
   
   If ports are in use, either:
   - Stop the conflicting service
   - Change ports in `docker-compose.yml`

3. **Build Errors**
   ```bash
   # Clean rebuild
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **Check Logs**
   ```bash
   # View logs for specific clone
   docker-compose logs omega
   docker-compose logs beta
   
   # Follow logs in real-time
   docker-compose logs -f omega
   ```

### Issue: Health Check Fails

**Symptoms:**
- `npm run health-check` shows clones as unhealthy
- `/health` endpoint returns errors
- Container marked as unhealthy in `docker-compose ps`

**Solutions:**

1. **Wait for Initialization**
   Clones need 15-30 seconds to initialize:
   ```bash
   # Wait and retry
   sleep 30
   npm run health-check
   ```

2. **Check Container Status**
   ```bash
   docker-compose ps
   # All should show "Up (healthy)"
   ```

3. **Manual Health Check**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3002/health
   curl http://localhost:3003/health
   curl http://localhost:3004/health
   curl http://localhost:3005/health
   ```

4. **Restart Unhealthy Clone**
   ```bash
   docker-compose restart omega
   # Wait 30 seconds
   curl http://localhost:3000/health
   ```

5. **Check AutoGen Connection**
   Review the health response:
   ```json
   {
     "integrity": {
       "autoGenConnected": true,  // Should be true
       "evidenceCollectorActive": true,
       "artifactManagerInitialized": true
     }
   }
   ```

### Issue: Artifact Storage Not Working

**Symptoms:**
- Cannot store artifacts
- `POST /artifacts` fails
- Checksum errors

**Solutions:**

1. **Verify Workspace Volumes**
   ```bash
   # Check volume exists
   docker volume ls | grep sanctuary-workspace
   
   # Inspect volume
   docker volume inspect sanctuary-workspace
   ```

2. **Check Directory Permissions**
   ```bash
   ls -la workspace/
   # Should show artifacts/, manifests/, audit/ directories
   ```

3. **Test Artifact Storage**
   ```bash
   curl -X POST http://localhost:3000/artifacts \
     -H "Content-Type: application/json" \
     -d '{"type":"test","content":"test","metadata":{}}'
   ```

4. **Clear and Recreate Volumes**
   ```bash
   # WARNING: This deletes all artifacts
   docker-compose down -v
   docker-compose up -d
   ```

### Issue: Clone Communication Fails

**Symptoms:**
- Orchestration times out
- Clones can't reach each other
- Network errors in logs

**Solutions:**

1. **Check Network**
   ```bash
   docker network inspect sanctuary-network
   # Should show all 5 containers
   ```

2. **Test Inter-Clone Communication**
   ```bash
   # From inside Omega container, ping Beta
   docker exec ryuzu-omega-sanctuary curl http://ryuzu-beta-sanctuary:3001/health
   ```

3. **Verify Container Names**
   ```bash
   docker-compose ps
   # Should show:
   # ryuzu-omega-sanctuary
   # ryuzu-beta-sanctuary
   # ryuzu-gamma-sanctuary
   # ryuzu-delta-sanctuary
   # ryuzu-sigma-sanctuary
   ```

4. **Recreate Network**
   ```bash
   docker-compose down
   docker network rm sanctuary-network
   docker-compose up -d
   ```

### Issue: MCP Server Not Working

**Symptoms:**
- MCP tools not appearing in Claude Desktop
- MCP server won't start
- Connection timeouts

**Solutions:**

1. **Verify MCP Dependencies**
   ```bash
   npm list @modelcontextprotocol/sdk
   # Should show version ^1.0.0
   ```
   
   If missing:
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. **Test MCP Server Manually**
   ```bash
   node src/mcp/server.js
   # Should show: "Sanctuary MCP Server v2.0.0 running on stdio"
   # Press Ctrl+C to exit
   ```

3. **Check Claude Desktop Config**
   Location: `~/.claude_desktop_config.json`
   
   Verify:
   - Absolute path to server.js is correct
   - Node is in PATH or full path to node binary is used
   
   ```json
   {
     "mcpServers": {
       "sanctuary": {
         "command": "node",
         "args": ["/absolute/path/to/VoidCat-DSN2/src/mcp/server.js"]
       }
     }
   }
   ```

4. **Check Claude Desktop Logs**
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%/Claude/logs/`
   
   Look for MCP-related errors.

5. **Ensure Clones Are Running**
   MCP server requires all clones to be accessible:
   ```bash
   npm run health-check
   ```

### Issue: High Memory Usage

**Symptoms:**
- Containers using excessive memory
- System becomes slow
- OOM (Out of Memory) errors

**Solutions:**

1. **Add Resource Limits**
   Edit `docker-compose.yml`:
   ```yaml
   services:
     omega:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
           reservations:
             memory: 256M
   ```

2. **Monitor Resource Usage**
   ```bash
   docker stats
   ```

3. **Restart Clones Periodically**
   ```bash
   docker-compose restart
   ```

### Issue: Tests Failing

**Symptoms:**
- `npm test` fails
- E2E tests time out
- Integration tests fail

**Solutions:**

1. **Unit Tests Failing**
   ```bash
   # Run specific test file
   npm test -- test/unit/clones/beta/test-beta-clone.test.js
   ```
   
   Check for:
   - Missing dependencies
   - Environment issues
   - Code changes breaking tests

2. **Integration Tests Failing**
   Ensure clones can start on different ports:
   ```bash
   # Integration tests use dynamic ports
   npm run test:integration
   ```

3. **E2E Tests Failing**
   E2E tests require deployed network:
   ```bash
   # Start network first
   docker-compose up -d
   
   # Wait for initialization
   sleep 30
   
   # Run E2E tests
   npm run test:e2e
   ```

### Issue: Performance Issues

**Symptoms:**
- Slow response times
- High latency
- Timeouts

**Solutions:**

1. **Check System Resources**
   ```bash
   docker stats
   # Look for high CPU/memory usage
   ```

2. **Increase Timeouts**
   For slow systems, increase timeouts in tests and API calls.

3. **Reduce Concurrent Operations**
   Limit number of simultaneous clone operations.

4. **Check Network Latency**
   ```bash
   # Test clone response time
   time curl http://localhost:3000/health
   ```

## Debugging Techniques

### View Clone Logs in Real-Time

```bash
# All clones
docker-compose logs -f

# Specific clone
docker-compose logs -f omega

# Last 100 lines
docker-compose logs --tail=100 beta
```

### Access Clone Container Shell

```bash
# Open shell in Omega container
docker exec -it ryuzu-omega-sanctuary /bin/sh

# Check files
ls -la /tmp/sanctuary-workspace/

# Exit
exit
```

### Check Artifact Storage

```bash
# List artifacts
ls -la workspace/artifacts/

# List manifests
ls -la workspace/manifests/

# Check audit logs
ls -la workspace/audit/
```

### Test Individual Clone

```bash
# Stop all except Omega
docker-compose stop beta gamma delta sigma

# Test Omega alone
curl http://localhost:3000/health
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","context":{}}'

# Restart others
docker-compose up -d
```

### Network Diagnostics

```bash
# Check DNS resolution
docker exec ryuzu-omega-sanctuary nslookup ryuzu-beta-sanctuary

# Check connectivity
docker exec ryuzu-omega-sanctuary ping -c 3 ryuzu-beta-sanctuary

# Check open ports
docker exec ryuzu-omega-sanctuary netstat -tulpn
```

## Clean Restart Procedure

If all else fails, perform a clean restart:

```bash
# 1. Stop all containers
docker-compose down

# 2. Remove volumes (WARNING: deletes artifacts)
docker-compose down -v

# 3. Remove dangling images
docker image prune -f

# 4. Rebuild from scratch
docker-compose build --no-cache

# 5. Start fresh
docker-compose up -d

# 6. Wait for initialization
sleep 30

# 7. Verify
npm run health-check
```

## Getting Help

If issues persist:

1. **Gather diagnostic information:**
   ```bash
   # Save all logs
   docker-compose logs > sanctuary-logs.txt
   
   # Save configuration
   cat docker-compose.yml > config.txt
   
   # Save health status
   npm run health-check > health.txt
   ```

2. **Check documentation:**
   - [DEPLOYMENT.md](../DEPLOYMENT.md)
   - [plan.md](../plan.md)
   - [CLAUDE_DESKTOP_INTEGRATION.md](CLAUDE_DESKTOP_INTEGRATION.md)

3. **Review test results:**
   ```bash
   npm test
   npm run test:integration
   npm run test:e2e
   ```

## Prevention Best Practices

1. **Regular Health Checks**
   ```bash
   # Add to cron job
   0 * * * * cd /path/to/VoidCat-DSN2 && npm run health-check
   ```

2. **Monitor Logs**
   ```bash
   # Check logs daily
   docker-compose logs --since 24h
   ```

3. **Backup Artifacts**
   ```bash
   # Regular backups
   tar -czf sanctuary-backup-$(date +%Y%m%d).tar.gz workspace/
   ```

4. **Keep Dependencies Updated**
   ```bash
   npm outdated
   npm update
   ```

5. **Monitor Resources**
   ```bash
   # Check disk space
   df -h
   
   # Check Docker disk usage
   docker system df
   ```

## Emergency Contacts

For critical issues:
- Review GitHub Issues
- Check project documentation
- Run validation: `node scripts/validate-deployment.js`
