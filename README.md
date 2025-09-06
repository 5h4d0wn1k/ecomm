# Multi-Vendor E-Commerce Platform

A comprehensive e-commerce platform built with Next.js, Node.js, Express, and PostgreSQL, supporting multiple vendors similar to Myntra.

## Features

- **Multi-Vendor Support**: Multiple vendors can sell products on the platform
- **Modern Tech Stack**: Next.js 14, Node.js, Express, PostgreSQL, Prisma
- **Authentication**: JWT-based authentication with role-based access
- **Payment Integration**: Stripe payment processing
- **Shipping Integration**: Shiprocket integration
- **File Storage**: Cloudinary for image storage
- **Real-time Notifications**: WebSocket-based notifications
- **Admin Dashboard**: Comprehensive admin panel
- **Vendor Dashboard**: Vendor management interface
- **Responsive Design**: Mobile-first responsive design
- **PWA Support**: Progressive Web App capabilities

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Zustand for state management
- React Hook Form with Zod validation

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- Redis for caching
- JWT for authentication
- Stripe for payments
- Shiprocket for shipping

### Infrastructure
- Docker & Docker Compose
- Nginx for reverse proxy
- PostgreSQL database
- Redis cache

## Getting Started

### Prerequisites
- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ecommerce-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

4. Start Docker services
```bash
npm run docker:up
```

5. Run database migrations
```bash
npm run db:migrate
```

6. Seed the database
```bash
npm run db:seed
```

7. Start the development servers
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- pgAdmin: http://localhost:5050
- Redis Commander: http://localhost:8081

## Project Structure

```
ecommerce-platform/
├── frontend/          # Next.js application
├── backend/           # Express.js API server
├── database/          # Database migrations and seeds
├── docker/            # Docker configurations
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── nginx/             # Nginx configuration
```

## Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run start` - Start production servers
- `npm run test` - Run tests
- `npm run lint` - Run linting
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database

## API Documentation

API documentation is available at `/api/docs` when the backend server is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.