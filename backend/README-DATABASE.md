# Database Setup Guide

This guide provides comprehensive instructions for setting up the database infrastructure for the multi-vendor e-commerce platform.

## Prerequisites

- Node.js 18.17.0 or higher
- PostgreSQL 12 or higher
- npm or yarn package manager

## Environment Configuration

### 1. Database Environment Variables

Copy the `.env.example` file to `.env` and configure the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce_dev

# For production
DATABASE_URL=postgresql://username:password@your-host:5432/ecommerce_prod
```

### 2. Database URL Format

The `DATABASE_URL` should follow this format:
```
postgresql://username:password@host:port/database
```

**Example configurations:**
- Local development: `postgresql://postgres:mypassword@localhost:5432/ecommerce_dev`
- Docker: `postgresql://postgres:password@db:5432/ecommerce_dev`
- Production: `postgresql://user:pass@your-db-host.com:5432/ecommerce_prod`

## Database Setup Commands

### Quick Setup (Recommended)

Run the complete database setup with a single command:

```bash
npm run db:setup
```

This command will:
1. Check database connection
2. Create database if it doesn't exist
3. Run migrations
4. Seed the database with sample data
5. Validate the setup

### Manual Setup

If you prefer to run each step individually:

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Run migrations
npm run db:migrate

# 3. Seed database with sample data
npm run db:seed
```

### Development Workflow

```bash
# Reset and refresh database (useful during development)
npm run db:refresh

# Reset database only (drops all data)
npm run db:reset

# Push schema changes without creating migrations
npm run db:push
```

### Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Check database health
npm run db:health

# Clean database (remove all data)
npm run db:clean
```

## Sample Data Overview

The seed script creates comprehensive sample data:

### Admin User
- **Email:** admin@ecommerce.com
- **Password:** admin123
- **Role:** admin

### Vendor Accounts (5 vendors)
1. **TechHub Electronics** - Approved, verified vendor
2. **StyleCraft Fashion** - Approved, verified vendor
3. **HomeComfort Supplies** - Approved, unverified vendor
4. **FitZone Sports** - Pending approval vendor
5. **Knowledge Corner Books** - Approved, verified vendor

### Categories (10 main categories with subcategories)
- Electronics (Smartphones, Laptops, Tablets)
- Fashion (Men's/Women's Clothing, Accessories)
- Home & Garden (Furniture, Kitchen, Garden)
- Sports & Fitness (Gym Equipment, Sports Gear)
- Books & Education (Fiction, Educational, Stationery)
- Beauty & Health (Skincare, Health Supplements)
- Automotive (Car Accessories, Car Parts)
- Food & Beverages (Snacks, Beverages)
- Toys & Games (Educational Toys, Board Games)
- Pet Supplies (Pet Food, Pet Accessories)

### Products (14 sample products)
- Electronics: iPhone 15 Pro Max, MacBook Pro 16", Samsung Galaxy Tab S9
- Fashion: Classic Denim Jacket, Elegant Evening Dress, Luxury Watch Set
- Home & Garden: Ergonomic Office Chair, Smart Coffee Maker, Garden Tool Set
- Sports: Professional Treadmill, Basketball Set
- Books: Programming Fundamentals, Mystery Novel Collection, Premium Notebook Set

### Shipping Zones
- **Domestic India:** Free shipping over ₹500, standard ₹50
- **International:** Standard ₹300, express ₹500

### Coupons
- **WELCOME10:** 10% off for new customers
- **FREESHIP:** Free shipping over ₹500
- **SAVE50:** Flat ₹50 off over ₹300
- **VENDOR15:** 15% off on specific vendor products

### Customer Accounts (3 sample customers)
- customer1@example.com / customer123
- customer2@example.com / customer123
- customer3@example.com / customer123

## Database Schema

The database includes the following main entities:

### Core Entities
- **Users:** Customer, vendor, and admin accounts
- **Vendors:** Vendor business profiles and settings
- **Products:** Product catalog with variants
- **Categories:** Hierarchical product categories
- **Orders:** Customer orders and order items
- **Payments:** Payment processing and tracking

### E-commerce Features
- **Reviews:** Product reviews and ratings
- **Wishlist:** Customer wishlists
- **Coupons:** Discount codes and promotions
- **Shipping:** Zones and rates configuration
- **Notifications:** User notifications system

### Security & Audit
- **Sessions:** User session management
- **Password History:** Password security tracking
- **Audit Logs:** System activity logging

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection manually
psql postgresql://username:password@localhost:5432/ecommerce_dev
```

#### 2. Migration Errors
```bash
# Reset and try again
npm run db:reset
npm run db:migrate
```

#### 3. Seed Data Issues
```bash
# Clean and reseed
npm run db:clean
npm run db:seed
```

#### 4. Permission Issues
```bash
# Create database manually
createdb ecommerce_dev

# Grant permissions
psql -c "GRANT ALL PRIVILEGES ON DATABASE ecommerce_dev TO your_username;"
```

### Health Check

Run the database health check to diagnose issues:

```bash
npm run db:health
```

This will check:
- Database connection
- Table structure
- Data integrity
- Query performance
- Index status

## Development Tips

### Database Schema Changes

When modifying the Prisma schema (`prisma/schema.prisma`):

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Or push changes directly (development only)
npm run db:push
```

### Working with Sample Data

```bash
# View data in Prisma Studio
npm run db:studio

# Reset to fresh sample data
npm run db:refresh
```

### Performance Monitoring

```bash
# Check query performance
npm run db:health

# View slow queries in logs
tail -f logs/app.log
```

## Production Deployment

### Environment Variables

For production, ensure these environment variables are set:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db-host:5432/ecommerce_prod
```

### Database Optimization

```bash
# Run migrations in production
npm run db:migrate

# Generate optimized Prisma client
npm run db:generate
```

### Backup Strategy

```bash
# Create database backup
pg_dump ecommerce_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql ecommerce_prod < backup_file.sql
```

## Support

For database-related issues:
1. Check the health status: `npm run db:health`
2. Review the logs in `logs/app.log`
3. Verify environment configuration
4. Ensure PostgreSQL is running and accessible

## Next Steps

After completing database setup:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the API endpoints** using the sample data

3. **Access Prisma Studio** to explore the data:
   ```bash
   npm run db:studio
   ```

4. **Begin development** with the fully populated database

The database is now ready for the multi-vendor e-commerce platform development!