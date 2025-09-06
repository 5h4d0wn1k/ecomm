# Docker Containerization Setup

This document provides comprehensive instructions for setting up and running the multi-vendor e-commerce platform using Docker containers.

## Architecture Overview

The Docker setup includes the following services:

- **PostgreSQL**: Primary database with optimized configuration
- **Redis**: Caching and session management
- **Backend**: Node.js/TypeScript API server
- **Nginx**: Reverse proxy with SSL termination and security headers

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- 10GB free disk space

## Quick Start

### Development Environment

1. **Clone and setup environment:**
   ```bash
   cp .env.development .env
   # Edit .env with your configuration
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

4. **Access the application:**
   - API: http://localhost:3001
   - Nginx Proxy: http://localhost

### Production Environment

1. **Setup production environment:**
   ```bash
   cp .env.production .env
   # Configure production secrets and settings
   ```

2. **Build and deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## Environment Configuration

### Development (.env.development)
- Hot reloading enabled
- Debug logging
- Development database
- Exposed ports for debugging

### Production (.env.production)
- Optimized for performance
- Production secrets required
- SSL/TLS configuration
- Resource limits applied

## Service Details

### PostgreSQL
- **Image**: postgres:15-alpine
- **Database**: ecommerce_dev (dev) / ecommerce_prod (prod)
- **Port**: 5432 (internal only)
- **Health Check**: pg_isready
- **Persistence**: Named volume `postgres_data`

### Redis
- **Image**: redis:7-alpine
- **Port**: 6379 (internal only)
- **Persistence**: Named volume `redis_data`
- **Configuration**: AOF enabled, password protection

### Backend
- **Base Image**: node:18-alpine
- **Build**: Multi-stage with security hardening
- **Health Check**: Custom health endpoint
- **Security**: Non-root user, read-only filesystem
- **Development**: Hot reloading with nodemon

### Nginx
- **Image**: nginx:1.25-alpine
- **Configuration**: Custom nginx.conf with security headers
- **SSL**: Ready for SSL certificate mounting
- **Rate Limiting**: API and auth endpoint protection

## Development Workflow

### Hot Reloading
The development setup includes:
- Volume mounting for source code
- Nodemon for automatic restarts
- Live debugging capabilities

### Database Management
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d ecommerce_dev

# Run migrations
docker-compose exec backend npx prisma migrate dev

# View Prisma Studio
docker-compose exec backend npx prisma studio
```

### Logs and Monitoring
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Monitor resource usage
docker stats
```

## Security Features

### Container Security
- Non-root user execution
- Minimal base images (Alpine Linux)
- Read-only root filesystem where possible
- Dropped capabilities
- Security options enabled

### Network Security
- Internal network isolation
- No exposed database ports in production
- SSL/TLS ready configuration
- Security headers in Nginx

### Application Security
- Environment-based secrets management
- JWT token authentication
- Rate limiting
- CORS configuration
- Input validation with Joi/Zod

## Production Deployment

### SSL Configuration
1. Obtain SSL certificates
2. Mount certificates:
   ```yaml
   volumes:
     - ./ssl/cert.pem:/etc/nginx/ssl/cert.pem:ro
     - ./ssl/key.pem:/etc/nginx/ssl/key.pem:ro
   ```
3. Uncomment SSL configuration in `nginx/conf.d/default.conf`

### Scaling
```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Update services
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup and Recovery
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres ecommerce_prod > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres ecommerce_prod < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3001
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database connection issues:**
   ```bash
   # Check database health
   docker-compose ps postgres
   docker-compose logs postgres
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Health Checks
All services include health checks:
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- Backend: Custom `/health` endpoint
- Nginx: HTTP status check

### Logs Analysis
```bash
# Follow logs with timestamps
docker-compose logs -f -t

# Search for specific errors
docker-compose logs | grep ERROR

# Export logs for analysis
docker-compose logs > logs.txt
```

## Performance Optimization

### Database Tuning
- Connection pooling with PgBouncer (recommended for production)
- Query optimization with Prisma
- Index management

### Caching Strategy
- Redis for session storage
- Application-level caching
- CDN integration for static assets

### Resource Limits
Production compose file includes:
- Memory limits
- CPU reservations
- Health-based restarts

## Monitoring and Observability

### Built-in Monitoring
- Health check endpoints
- Structured logging with Winston
- Docker logging drivers
- Resource usage monitoring

### External Monitoring (Optional)
For advanced monitoring, consider:
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Application Performance Monitoring (APM)

## Maintenance

### Updates
```bash
# Update all images
docker-compose pull

# Update specific service
docker-compose pull backend
docker-compose up -d backend
```

### Cleanup
```bash
# Remove stopped containers
docker-compose down

# Remove volumes (WARNING: destroys data)
docker-compose down -v

# Clean up unused images
docker image prune -f
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Docker and service logs
3. Verify environment configuration
4. Check network connectivity

## File Structure

```
.
├── docker-compose.yml          # Development setup
├── docker-compose.prod.yml     # Production setup
├── docker-compose.override.yml # Development overrides
├── docker-compose.security.yml # Security configurations
├── .env.development           # Development environment
├── .env.production           # Production environment
├── backend/
│   ├── Dockerfile            # Production container
│   ├── Dockerfile.dev        # Development container
│   ├── docker-entrypoint.sh  # Startup script
│   └── ...
├── nginx/
│   ├── nginx.conf           # Main configuration
│   └── conf.d/
│       └── default.conf     # Site configuration
└── README-Docker.md         # This file