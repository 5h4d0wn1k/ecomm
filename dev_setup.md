# Development Environment Setup for Multi-Vendor E-Commerce Platform

## Overview
This document provides detailed setup instructions and configuration file descriptions for the development environment of the multi-vendor e-commerce platform.

## Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS 12+, or Ubuntu 20.04+
- **Node.js**: Version 18.17.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: Version 2.30.0 or higher
- **Docker**: Version 24.0.0 or higher
- **Docker Compose**: Version 2.0.0 or higher

### Development Tools
- **Code Editor**: Visual Studio Code with recommended extensions
- **Terminal**: Git Bash (Windows) or default terminal (macOS/Linux)
- **Database Client**: pgAdmin 4 or DBeaver for PostgreSQL
- **API Testing**: Postman or Insomnia
- **Browser**: Chrome/Edge with DevTools

## Project Structure Setup

### Root Directory Structure
```
ecommerce-platform/
├── frontend/          # Next.js application
├── backend/           # Express.js API server
├── database/          # Database migrations and seeds
├── docker/            # Docker configurations
├── docs/              # Documentation
├── scripts/           # Utility scripts
├── .gitignore
├── docker-compose.yml
├── package.json
└── README.md
```

## Configuration Files

### Root package.json
```json
{
  "name": "ecommerce-platform",
  "version": "1.0.0",
  "description": "Multi-vendor e-commerce platform monorepo",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=frontend\" \"npm run dev --workspace=backend\"",
    "build": "npm run build --workspace=frontend && npm run build --workspace=backend",
    "start": "concurrently \"npm run start --workspace=frontend\" \"npm run start --workspace=backend\"",
    "test": "npm run test --workspace=frontend && npm run test --workspace=backend",
    "lint": "npm run lint --workspace=frontend && npm run lint --workspace=backend",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:build": "docker-compose build",
    "db:migrate": "npm run db:migrate --workspace=backend",
    "db:seed": "npm run db:seed --workspace=backend",
    "clean": "npm run clean --workspace=frontend && npm run clean --workspace=backend"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "husky": "^8.0.3",
    "lint-staged": "^13.2.3"
  },
  "engines": {
    "node": ">=18.17.0",
    "npm": ">=9.0.0"
  }
}
```

### Frontend package.json
```json
{
  "name": "ecommerce-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next out node_modules"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.1.0",
    "@radix-ui/react-dialog": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.5",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-navigation-menu": "^1.1.3",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.4",
    "axios": "^1.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.263.1",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.45.1",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.6",
    "zod": "^3.22.2",
    "zustand": "^4.3.9"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.2",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.5.1",
    "@types/node": "^20.4.5",
    "@types/react": "^18.2.17",
    "@types/react-dom": "^18.2.7",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-config-next": "^14.0.0",
    "jest": "^29.6.1",
    "jest-environment-jsdom": "^29.6.1",
    "postcss": "^8.4.27",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.1.6"
  },
  "engines": {
    "node": ">=18.17.0"
  }
}
```

### Backend package.json
```json
{
  "name": "ecommerce-backend",
  "version": "1.0.0",
  "description": "Backend API for multi-vendor e-commerce platform",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^6.10.0",
    "helmet": "^7.0.0",
    "joi": "^17.9.2",
    "jsonwebtoken": "^9.0.1",
    "multer": "^1.4.5-lts.1",
    "redis": "^4.6.8",
    "winston": "^3.10.0",
    "zod": "^3.22.2"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0",
    "@types/cors": "^2.8.13",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.3",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/multer": "^1.4.7",
    "@types/node": "^20.4.5",
    "@types/supertest": "^2.0.12",
    "jest": "^29.6.1",
    "nodemon": "^3.0.1",
    "prisma": "^5.0.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.6"
  },
  "engines": {
    "node": ">=18.17.0"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## Environment Configuration

### Frontend Environment Variables (.env.local)
```bash
# Application Configuration
NEXT_PUBLIC_APP_NAME=E-Commerce Platform
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-key-here

# Payment Integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# File Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=GA_MEASUREMENT_ID

# Development
NEXT_PUBLIC_NODE_ENV=development
```

### Backend Environment Variables (.env)
```bash
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce_dev

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Authentication
BCRYPT_ROUNDS=12

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your E-Commerce Platform

# Payment Integration (Stripe)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Shipping Integration (Shiprocket)
SHIPROCKET_EMAIL=your-shiprocket-email
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# Session Configuration
SESSION_SECRET=your-session-secret-here
SESSION_MAX_AGE=604800000
```

## Docker Configuration

### Docker Compose (docker-compose.yml)
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: ecommerce-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ecommerce_dev
      POSTGRES_USER: ecommerce_user
      POSTGRES_PASSWORD: ecommerce_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - ecommerce-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: ecommerce-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - ecommerce-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ecommerce-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://ecommerce_user:ecommerce_password@postgres:5432/ecommerce_dev
      - REDIS_URL=redis://redis:6379
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    networks:
      - ecommerce-network
    command: npm run dev

  # Frontend Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ecommerce-frontend
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001/api/v1
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    networks:
      - ecommerce-network
    command: npm run dev

  # pgAdmin (Database Management)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: ecommerce-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@ecommerce.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - ecommerce-network

  # Redis Commander (Redis Management)
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: ecommerce-redis-commander
    restart: unless-stopped
    environment:
      - REDIS_HOSTS=local:redis:6379
    ports:
      - "8081:8081"
    depends_on:
      - redis
    networks:
      - ecommerce-network

volumes:
  postgres_data:
  redis_data:

networks:
  ecommerce-network:
    driver: bridge
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
```

## Database Configuration

### Prisma Schema (backend/prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                Int      @id @default(autoincrement())
  email             String   @unique
  passwordHash      String
  role              String
  firstName         String
  lastName          String
  phone             String?
  isActive          Boolean  @default(true)
  emailVerified     Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  vendor            Vendor?
  orders            Order[]
  reviews           Review[]
  wishlist          Wishlist[]
  sessions          Session[]
  notifications     Notification[]

  @@map("users")
}

model Vendor {
  id                Int      @id @default(autoincrement())
  userId            Int      @unique
  businessName      String
  businessDescription String?
  businessAddress   String
  businessPhone     String?
  taxId             String?
  commissionRate    Decimal  @default(10.00)
  isVerified        Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  products          Product[]

  @@map("vendors")
}

model Product {
  id                Int       @id @default(autoincrement())
  vendorId          Int
  categoryId        Int
  name              String
  description       String?
  price             Decimal
  stockQuantity     Int       @default(0)
  images            String[]
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  vendor            Vendor    @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  category          Category  @relation(fields: [categoryId], references: [id])
  orderItems        OrderItem[]
  reviews           Review[]
  wishlist          Wishlist[]

  @@map("products")
}

model Category {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  slug        String   @unique
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  products    Product[]

  @@map("categories")
}

model Order {
  id              Int         @id @default(autoincrement())
  userId          Int
  orderNumber     String      @unique
  status          String      @default("pending")
  subtotal        Decimal
  taxAmount       Decimal     @default(0)
  shippingAmount  Decimal     @default(0)
  totalAmount     Decimal
  shippingAddress Json
  billingAddress  Json
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItems      OrderItem[]
  payments        Payment[]

  @@map("orders")
}

model OrderItem {
  id          Int     @id @default(autoincrement())
  orderId     Int
  productId   Int
  quantity    Int
  unitPrice   Decimal
  totalPrice  Decimal

  // Relations
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}

model Payment {
  id              Int      @id @default(autoincrement())
  orderId         Int
  amount          Decimal
  status          String   @default("pending")
  transactionId   String?  @unique
  paymentMethod   String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("payments")
}

model Review {
  id          Int     @id @default(autoincrement())
  productId   Int
  userId      Int
  rating      Int
  comment     String?
  isApproved  Boolean @default(true)
  createdAt   DateTime @default(now())

  // Relations
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([productId, userId])
  @@map("reviews")
}

model Wishlist {
  id        Int      @id @default(autoincrement())
  userId    Int
  productId Int
  createdAt DateTime @default(now())

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@map("wishlists")
}

model Session {
  id            Int      @id @default(autoincrement())
  userId        Int
  sessionToken  String   @unique
  expiresAt     DateTime
  createdAt     DateTime @default(now())

  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int
  type      String
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

## Development Scripts

### Database Initialization Script (database/init.sql)
```sql
-- Create database and user
CREATE DATABASE ecommerce_dev;
CREATE USER ecommerce_user WITH PASSWORD 'ecommerce_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_dev TO ecommerce_user;

-- Connect to the database
\c ecommerce_dev;

-- Grant permissions on schema
GRANT ALL ON SCHEMA public TO ecommerce_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecommerce_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecommerce_user;

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Setup Script (scripts/setup.sh)
```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Multi-Vendor E-Commerce Platform${NC}"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed. Aborting.${NC}" >&2; exit 1; }

# Install root dependencies
echo -e "${YELLOW}Installing root dependencies...${NC}"
npm install

# Setup frontend
echo -e "${YELLOW}Setting up frontend...${NC}"
cd frontend
npm install
cp .env.example .env.local
cd ..

# Setup backend
echo -e "${YELLOW}Setting up backend...${NC}"
cd backend
npm install
cp .env.example .env
cd ..

# Setup Docker environment
echo -e "${YELLOW}Setting up Docker environment...${NC}"
docker-compose up -d postgres redis

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 10

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
cd backend
npm run db:migrate
npm run db:seed
cd ..

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Start the development servers: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. API documentation available at http://localhost:3001/api/docs"
```

## VS Code Configuration

### Recommended Extensions (.vscode/extensions.json)
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-css-peek",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-css-intellisense",
    "usernamehw.errorlens",
    "ms-vscode.vscode-jest",
    "humao.rest-client",
    "ms-vscode.vscode-docker",
    "ms-vscode-remote.remote-containers"
  ]
}
```

### VS Code Settings (.vscode/settings.json)
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "jest.autoRun": "off",
  "jest.showCoverageOnLoad": true
}
```

## Testing Configuration

### Jest Configuration (frontend/jest.config.js)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

### Jest Setup (frontend/jest.setup.js)
```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
    }
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api/v1'
```

## Deployment Configuration

### Nginx Configuration (nginx/nginx.conf)
```nginx
upstream backend {
    server backend:3001;
}

server {
    listen 80;
    server_name localhost;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /_next/static/ {
        proxy_pass http://frontend:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

This comprehensive development environment setup provides everything needed to start developing the multi-vendor e-commerce platform efficiently and consistently.