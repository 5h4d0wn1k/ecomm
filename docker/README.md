# Docker Directory

This directory contains Docker configurations for the multi-vendor e-commerce platform.

## Structure

- `frontend/` - Frontend Docker configuration
- `backend/` - Backend Docker configuration
- `database/` - Database Docker configuration

## Usage

Use Docker Compose from the root directory:

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# Build images
npm run docker:build
```

## Services

- **PostgreSQL**: Database server
- **Redis**: Cache and session store
- **Backend**: Node.js/Express API server
- **Frontend**: Next.js application
- **pgAdmin**: Database management interface
- **Redis Commander**: Redis management interface
- **Nginx**: Reverse proxy and load balancer

## Ports

- Frontend: 3000
- Backend API: 3001
- PostgreSQL: 5432
- Redis: 6379
- pgAdmin: 5050
- Redis Commander: 8081
- Nginx: 80

See `docker-compose.yml` in the root directory for complete configuration.