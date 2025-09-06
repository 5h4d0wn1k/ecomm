# Database Directory

This directory contains all database-related files for the multi-vendor e-commerce platform.

## Structure

- `migrations/` - Database migration files
- `seeds/` - Database seed files for initial data
- `functions/` - Custom database functions
- `views/` - Database views
- `indexes/` - Database index definitions

## Usage

Migrations are handled by Prisma. Use the following commands:

```bash
# Generate migration
npm run db:migrate

# Seed database
npm run db:seed
```

## Database Schema

The database uses PostgreSQL with the following main tables:
- Users (customers, vendors, admins)
- Vendors
- Products
- Categories
- Orders
- Payments
- Reviews
- Wishlists
- Notifications

See `backend/prisma/schema.prisma` for the complete schema definition.