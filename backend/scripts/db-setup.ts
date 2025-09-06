#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

class DatabaseSetup {
  private config: DatabaseConfig;

  constructor() {
    this.config = this.loadDatabaseConfig();
  }

  private loadDatabaseConfig(): DatabaseConfig {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Parse PostgreSQL connection string
    const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = databaseUrl.match(urlPattern);

    if (!match) {
      throw new Error('Invalid DATABASE_URL format. Expected: postgresql://username:password@host:port/database');
    }

    const [, username, password, host, port, database] = match;

    return {
      host,
      port: parseInt(port, 10),
      database,
      username,
      password,
      ssl: process.env.NODE_ENV === 'production'
    };
  }

  async checkDatabaseConnection(): Promise<boolean> {
    try {
      console.log('🔍 Checking database connection...');
      await prisma.$connect();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async createDatabaseIfNotExists(): Promise<void> {
    try {
      console.log('🏗️ Creating database if it doesn\'t exist...');

      // Connect to postgres database to create the target database
      const postgresPrisma = new PrismaClient({
        datasourceUrl: `postgresql://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/postgres`
      });

      await postgresPrisma.$connect();

      // Check if database exists
      const result = await postgresPrisma.$queryRaw`
        SELECT 1 FROM pg_database WHERE datname = ${this.config.database}
      ` as any[];

      if (result.length === 0) {
        // Create database
        await postgresPrisma.$executeRaw`
          CREATE DATABASE ${this.config.database}
        `;
        console.log(`✅ Database '${this.config.database}' created successfully`);
      } else {
        console.log(`ℹ️ Database '${this.config.database}' already exists`);
      }

      await postgresPrisma.$disconnect();
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    try {
      console.log('📦 Running database migrations...');

      // Generate Prisma client
      execSync('npx prisma generate', { stdio: 'inherit' });

      // Run migrations
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });

      console.log('✅ Migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  async runSeed(): Promise<void> {
    try {
      console.log('🌱 Running database seed...');

      execSync('npm run db:seed', { stdio: 'inherit' });

      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      throw error;
    }
  }

  async validateSetup(): Promise<void> {
    try {
      console.log('🔍 Validating database setup...');

      // Check if tables exist
      const tables = await prisma.$queryRaw`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_prisma_%'
      ` as any[];

      if (tables.length === 0) {
        throw new Error('No tables found in database');
      }

      console.log(`✅ Found ${tables.length} tables in database`);

      // Check if seed data exists
      const userCount = await prisma.user.count();
      const categoryCount = await prisma.category.count();
      const productCount = await prisma.product.count();

      console.log(`📊 Validation Results:`);
      console.log(`   👤 Users: ${userCount}`);
      console.log(`   🛍️ Categories: ${categoryCount}`);
      console.log(`   📦 Products: ${productCount}`);

      if (userCount === 0 || categoryCount === 0 || productCount === 0) {
        console.warn('⚠️ Some seed data may be missing');
      } else {
        console.log('✅ Database setup validation passed');
      }
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }

  async setup(): Promise<void> {
    try {
      console.log('🚀 Starting complete database setup...\n');

      // Step 1: Check connection
      const isConnected = await this.checkDatabaseConnection();
      if (!isConnected) {
        await this.createDatabaseIfNotExists();
      }

      // Step 2: Run migrations
      await this.runMigrations();

      // Step 3: Run seed
      await this.runSeed();

      // Step 4: Validate setup
      await this.validateSetup();

      console.log('\n🎉 Database setup completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Start the development server: npm run dev');
      console.log('2. Access Prisma Studio: npm run db:studio');
      console.log('3. Test the API endpoints');

    } catch (error) {
      console.error('\n💥 Database setup failed:', error.message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  async reset(): Promise<void> {
    try {
      console.log('🔄 Resetting database...');

      // Drop all tables
      await prisma.$executeRaw`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
        END $$;
      `;

      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Database reset failed:', error.message);
      throw error;
    }
  }

  async healthCheck(): Promise<void> {
    try {
      console.log('🏥 Performing database health check...\n');

      // Connection test
      const startTime = Date.now();
      await prisma.$connect();
      const connectionTime = Date.now() - startTime;

      console.log(`✅ Connection: ${connectionTime}ms`);

      // Basic queries
      const userCount = await prisma.user.count();
      const productCount = await prisma.product.count();
      const orderCount = await prisma.order.count();

      console.log(`📊 Data Summary:`);
      console.log(`   👤 Users: ${userCount}`);
      console.log(`   📦 Products: ${productCount}`);
      console.log(`   📋 Orders: ${orderCount}`);

      // Performance check
      const queryStart = Date.now();
      await prisma.product.findMany({ take: 10 });
      const queryTime = Date.now() - queryStart;

      console.log(`⚡ Query Performance: ${queryTime}ms for 10 products`);

      console.log('\n✅ Database health check passed');

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'setup';
  const dbSetup = new DatabaseSetup();

  switch (command) {
    case 'setup':
      await dbSetup.setup();
      break;
    case 'reset':
      await dbSetup.reset();
      break;
    case 'health':
      await dbSetup.healthCheck();
      break;
    case 'validate':
      await dbSetup.validateSetup();
      break;
    default:
      console.log('Usage: ts-node scripts/db-setup.ts [setup|reset|health|validate]');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

export default DatabaseSetup;