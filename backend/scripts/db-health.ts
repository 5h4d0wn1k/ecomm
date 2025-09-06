#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

class DatabaseHealthCheck {
  async checkConnection(): Promise<HealthCheckResult> {
    try {
      const startTime = Date.now();
      await prisma.$connect();
      const connectionTime = Date.now() - startTime;

      if (connectionTime > 5000) {
        return {
          status: 'warning',
          message: `Slow connection (${connectionTime}ms)`,
          details: { connectionTime }
        };
      }

      return {
        status: 'healthy',
        message: `Connection successful (${connectionTime}ms)`,
        details: { connectionTime }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Connection failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async checkTables(): Promise<HealthCheckResult> {
    try {
      const tables = await prisma.$queryRaw`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_prisma_%'
      ` as any[];

      const expectedTables = [
        'users', 'password_history', 'vendors', 'products', 'product_variants',
        'categories', 'orders', 'order_items', 'payments', 'vendor_earnings',
        'coupons', 'shipping_zones', 'shipping_rates', 'reviews', 'wishlists',
        'sessions', 'notifications'
      ];

      const missingTables = expectedTables.filter(table =>
        !tables.some(t => t.tablename === table)
      );

      if (missingTables.length > 0) {
        return {
          status: 'error',
          message: `Missing tables: ${missingTables.join(', ')}`,
          details: { missingTables, foundTables: tables.map(t => t.tablename) }
        };
      }

      return {
        status: 'healthy',
        message: `All ${tables.length} tables present`,
        details: { tableCount: tables.length, tables: tables.map(t => t.tablename) }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Table check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async checkDataIntegrity(): Promise<HealthCheckResult> {
    try {
      const results = await Promise.all([
        prisma.user.count(),
        prisma.category.count(),
        prisma.product.count(),
        prisma.vendor.count(),
        prisma.order.count()
      ]);

      const [userCount, categoryCount, productCount, vendorCount, orderCount] = results;

      const issues = [];

      if (userCount === 0) issues.push('No users found');
      if (categoryCount === 0) issues.push('No categories found');
      if (productCount === 0) issues.push('No products found');

      if (issues.length > 0) {
        return {
          status: 'warning',
          message: `Data integrity issues: ${issues.join(', ')}`,
          details: { userCount, categoryCount, productCount, vendorCount, orderCount, issues }
        };
      }

      return {
        status: 'healthy',
        message: 'Data integrity check passed',
        details: { userCount, categoryCount, productCount, vendorCount, orderCount }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Data integrity check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async checkPerformance(): Promise<HealthCheckResult> {
    try {
      // Test query performance
      const startTime = Date.now();
      await prisma.product.findMany({
        take: 100,
        include: {
          vendor: true,
          category: true
        }
      });
      const queryTime = Date.now() - startTime;

      if (queryTime > 2000) {
        return {
          status: 'warning',
          message: `Slow query performance (${queryTime}ms)`,
          details: { queryTime }
        };
      }

      return {
        status: 'healthy',
        message: `Query performance good (${queryTime}ms)`,
        details: { queryTime }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Performance check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async checkIndexes(): Promise<HealthCheckResult> {
    try {
      const indexes = await prisma.$queryRaw`
        SELECT indexname, tablename
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname NOT LIKE 'pg_%'
      ` as any[];

      const expectedIndexes = [
        'users_email_key', 'users_pkey',
        'categories_pkey', 'categories_slug_key',
        'products_pkey', 'products_sku_key',
        'orders_pkey', 'orders_order_number_key'
      ];

      const missingIndexes = expectedIndexes.filter(index =>
        !indexes.some(i => i.indexname === index)
      );

      if (missingIndexes.length > 0) {
        return {
          status: 'warning',
          message: `Missing indexes: ${missingIndexes.join(', ')}`,
          details: { missingIndexes, foundIndexes: indexes.map(i => i.indexname) }
        };
      }

      return {
        status: 'healthy',
        message: `All ${indexes.length} indexes present`,
        details: { indexCount: indexes.length, indexes: indexes.map(i => i.indexname) }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Index check failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async runHealthCheck(): Promise<void> {
    console.log('🏥 Database Health Check\n');
    console.log('=' .repeat(50));

    const checks = [
      { name: 'Database Connection', check: this.checkConnection.bind(this) },
      { name: 'Table Structure', check: this.checkTables.bind(this) },
      { name: 'Data Integrity', check: this.checkDataIntegrity.bind(this) },
      { name: 'Query Performance', check: this.checkPerformance.bind(this) },
      { name: 'Index Status', check: this.checkIndexes.bind(this) }
    ];

    let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';
    const results = [];

    for (const { name, check } of checks) {
      try {
        const result = await check();
        results.push({ name, ...result });

        const statusIcon = {
          healthy: '✅',
          warning: '⚠️',
          error: '❌'
        }[result.status];

        console.log(`${statusIcon} ${name}: ${result.message}`);

        if (result.status === 'error') {
          overallStatus = 'error';
        } else if (result.status === 'warning' && overallStatus === 'healthy') {
          overallStatus = 'warning';
        }
      } catch (error) {
        console.log(`❌ ${name}: Check failed - ${error.message}`);
        overallStatus = 'error';
        results.push({ name, status: 'error', message: error.message });
      }
    }

    console.log('\n' + '=' .repeat(50));

    const statusIcon = {
      healthy: '✅',
      warning: '⚠️',
      error: '❌'
    }[overallStatus];

    console.log(`${statusIcon} Overall Status: ${overallStatus.toUpperCase()}`);

    if (overallStatus !== 'healthy') {
      console.log('\n🔧 Recommendations:');
      if (overallStatus === 'error') {
        console.log('- Check database connection and credentials');
        console.log('- Run database migrations: npm run db:migrate');
        console.log('- Run database seed: npm run db:seed');
      } else {
        console.log('- Consider optimizing slow queries');
        console.log('- Review missing indexes');
        console.log('- Check data consistency');
      }
    }

    console.log('\n📊 Detailed Results:');
    results.forEach(result => {
      if (result.details) {
        console.log(`\n${result.name}:`);
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`  ${key}: ${JSON.stringify(value)}`);
        });
      }
    });

    // Exit with appropriate code
    if (overallStatus === 'error') {
      process.exit(1);
    } else if (overallStatus === 'warning') {
      process.exit(2);
    } else {
      process.exit(0);
    }
  }
}

async function main() {
  const healthCheck = new DatabaseHealthCheck();

  try {
    await healthCheck.runHealthCheck();
  } catch (error) {
    console.error('Health check execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export default DatabaseHealthCheck;