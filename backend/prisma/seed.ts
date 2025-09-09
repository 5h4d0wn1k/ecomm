import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { updateCategoryPath, rebuildAllCategoryPaths } from '../src/utils/category-paths';

const prisma = new PrismaClient();

// Utility function for password hashing
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Progress logging utility
function logProgress(message: string, step?: number, total?: number) {
  const stepInfo = step && total ? `[${step}/${total}] ` : '';
  console.log(`🌱 ${stepInfo}${message}`);
}

// Sample data
const sampleCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest electronics and gadgets',
    subcategories: [
      { name: 'Smartphones', slug: 'smartphones', description: 'Mobile phones and accessories' },
      { name: 'Laptops', slug: 'laptops', description: 'Computers and laptops' },
      { name: 'Tablets', slug: 'tablets', description: 'Tablets and e-readers' }
    ]
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing and fashion accessories',
    subcategories: [
      { name: 'Men\'s Clothing', slug: 'mens-clothing', description: 'Men\'s fashion and apparel' },
      { name: 'Women\'s Clothing', slug: 'womens-clothing', description: 'Women\'s fashion and apparel' },
      { name: 'Accessories', slug: 'fashion-accessories', description: 'Fashion accessories and jewelry' }
    ]
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Home improvement and garden supplies',
    subcategories: [
      { name: 'Furniture', slug: 'furniture', description: 'Home and office furniture' },
      { name: 'Kitchen', slug: 'kitchen', description: 'Kitchen appliances and utensils' },
      { name: 'Garden', slug: 'garden', description: 'Gardening tools and plants' }
    ]
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Sports equipment and fitness gear',
    subcategories: [
      { name: 'Gym Equipment', slug: 'gym-equipment', description: 'Fitness and gym equipment' },
      { name: 'Sports Gear', slug: 'sports-gear', description: 'Sports equipment and accessories' }
    ]
  },
  {
    name: 'Books & Education',
    slug: 'books-education',
    description: 'Books, educational materials, and stationery',
    subcategories: [
      { name: 'Fiction Books', slug: 'fiction-books', description: 'Fiction and literature' },
      { name: 'Educational Books', slug: 'educational-books', description: 'Educational and academic books' },
      { name: 'Stationery', slug: 'stationery', description: 'Office and school supplies' }
    ]
  },
  {
    name: 'Beauty & Health',
    slug: 'beauty-health',
    description: 'Beauty products and health supplements',
    subcategories: [
      { name: 'Skincare', slug: 'skincare', description: 'Skincare products and cosmetics' },
      { name: 'Health Supplements', slug: 'health-supplements', description: 'Vitamins and health supplements' }
    ]
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car accessories and automotive parts',
    subcategories: [
      { name: 'Car Accessories', slug: 'car-accessories', description: 'Car interior and exterior accessories' },
      { name: 'Car Parts', slug: 'car-parts', description: 'Automotive spare parts' }
    ]
  },
  {
    name: 'Food & Beverages',
    slug: 'food-beverages',
    description: 'Food products and beverages',
    subcategories: [
      { name: 'Snacks', slug: 'snacks', description: 'Snacks and confectionery' },
      { name: 'Beverages', slug: 'beverages', description: 'Drinks and beverages' }
    ]
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    description: 'Toys, games, and entertainment',
    subcategories: [
      { name: 'Educational Toys', slug: 'educational-toys', description: 'Learning and educational toys' },
      { name: 'Board Games', slug: 'board-games', description: 'Board games and puzzles' }
    ]
  },
  {
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    description: 'Pet food, toys, and accessories',
    subcategories: [
      { name: 'Pet Food', slug: 'pet-food', description: 'Food and treats for pets' },
      { name: 'Pet Accessories', slug: 'pet-accessories', description: 'Pet toys and accessories' }
    ]
  }
];

const sampleVendors = [
  {
    email: 'vendor1@ecommerce.com',
    password: 'vendor123',
    firstName: 'John',
    lastName: 'Electronics',
    businessName: 'TechHub Electronics',
    businessDescription: 'Premium electronics and gadgets store with latest technology products',
    businessAddress: '123 Tech Street, Silicon Valley, CA 90210',
    businessPhone: '+1-555-0101',
    taxId: 'TAX123456789',
    // status removed
    isVerified: true,
    commissionRate: 8.50
  },
  {
    email: 'vendor2@ecommerce.com',
    password: 'vendor123',
    firstName: 'Sarah',
    lastName: 'Fashion',
    businessName: 'StyleCraft Fashion',
    businessDescription: 'Trendy clothing and fashion accessories for all ages',
    businessAddress: '456 Fashion Ave, New York, NY 10001',
    businessPhone: '+1-555-0102',
    taxId: 'TAX987654321',
    // status removed
    isVerified: true,
    commissionRate: 12.00
  },
  {
    email: 'vendor3@ecommerce.com',
    password: 'vendor123',
    firstName: 'Mike',
    lastName: 'Home',
    businessName: 'HomeComfort Supplies',
    businessDescription: 'Quality home and garden products for comfortable living',
    businessAddress: '789 Home Street, Chicago, IL 60601',
    businessPhone: '+1-555-0103',
    taxId: 'TAX456789123',
    // status removed, not in schema
    isVerified: false,
    commissionRate: 10.00
  },
  {
    email: 'vendor4@ecommerce.com',
    password: 'vendor123',
    firstName: 'Lisa',
    lastName: 'Sports',
    businessName: 'FitZone Sports',
    businessDescription: 'Professional sports equipment and fitness gear',
    businessAddress: '321 Sports Blvd, Miami, FL 33101',
    businessPhone: '+1-555-0104',
    taxId: 'TAX789123456',
    status: "pending",
    isVerified: false,
    commissionRate: 9.50
  },
  {
    email: 'vendor5@ecommerce.com',
    password: 'vendor123',
    firstName: 'David',
    lastName: 'Books',
    businessName: 'Knowledge Corner Books',
    businessDescription: 'Educational books and learning materials for students and professionals',
    businessAddress: '654 Knowledge Lane, Boston, MA 02101',
    businessPhone: '+1-555-0105',
    taxId: 'TAX321654987',
    status: "approved",
    isVerified: true,
    commissionRate: 15.00
  }
];

async function createUsers() {
  logProgress('Creating admin user...', 1, 8);
  
  // Create admin user
  const adminPasswordHash = await hashPassword('admin123');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ecommerce.com',
      passwordHash: adminPasswordHash,
      role: "admin",
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-555-0000',
      isActive: true,
      emailVerified: true
    }
  });

  logProgress('Creating vendor users and accounts...', 2, 8);
  
  // Create vendor users and their vendor profiles
  const vendors = [];
  for (const vendorData of sampleVendors) {
    const passwordHash = await hashPassword(vendorData.password);
    
    const user = await prisma.user.create({
      data: {
        email: vendorData.email,
        passwordHash,
        role: "vendor",
        firstName: vendorData.firstName,
        lastName: vendorData.lastName,
        isActive: true,
        emailVerified: true
      }
    });

    const vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        businessName: vendorData.businessName,
        businessDescription: vendorData.businessDescription,
        businessAddress: vendorData.businessAddress,
        businessPhone: vendorData.businessPhone,
        taxId: vendorData.taxId,
        isVerified: vendorData.isVerified,
        commissionRate: vendorData.commissionRate,
        bankAccountDetails: JSON.stringify({
          accountHolderName: `${vendorData.firstName} ${vendorData.lastName}`,
          accountNumber: `ACC${Math.floor(Math.random() * 1000000000)}`,
          routingNumber: `RTG${Math.floor(Math.random() * 100000000)}`,
          bankName: 'Sample Bank'
        })
      }
    });

    vendors.push(vendor);
  }

  // Create sample customer users
  const sampleCustomerData = [
    { email: 'customer1@example.com', firstName: 'Alice', lastName: 'Johnson', phone: '+1-555-1001' },
    { email: 'customer2@example.com', firstName: 'Bob', lastName: 'Smith', phone: '+1-555-1002' },
    { email: 'customer3@example.com', firstName: 'Carol', lastName: 'Davis', phone: '+1-555-1003' }
  ];

  for (const customerData of sampleCustomerData) {
    const passwordHash = await hashPassword('customer123');
    await prisma.user.create({
      data: {
        email: customerData.email,
        passwordHash,
        role: "customer",
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        isActive: true,
        emailVerified: true
      }
    });
  }

  return { adminUser, vendors };
}

async function createCategories() {
  logProgress('Creating categories and subcategories...', 3, 8);

  const categories = [];

  for (const categoryData of sampleCategories) {
    // Create parent category
    const parentCategory: any = await prisma.category.create({
      data: {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        sortOrder: categories.length
      }
    });

    // Update materialized path for parent category
    await updateCategoryPath(parentCategory.id);
    categories.push(parentCategory);

    // Create subcategories
    for (const subcategoryData of categoryData.subcategories) {
      const subcategory = await prisma.category.create({
        data: {
          name: subcategoryData.name,
          slug: subcategoryData.slug,
          description: subcategoryData.description,
          parentId: parentCategory.id,
          isActive: true,
          sortOrder: 0
        }
      });

      // Update materialized path for subcategory
      await updateCategoryPath(subcategory.id);
      categories.push(subcategory);
    }
  }

  return categories;
}

async function createProducts(vendors: any[], categories: any[]) {
  logProgress('Creating sample products...', 4, 8);
  
  const products = [];
  const subcategories = categories.filter(cat => cat.parentId !== null);
  
  const sampleProducts = [
    { name: 'iPhone 15 Pro Max', description: 'Latest iPhone with advanced features and premium build quality', shortDescription: 'Premium smartphone with cutting-edge technology', price: 1299.99, compareAtPrice: 1399.99, costPrice: 1000.00, stockQuantity: 50, category: 'smartphones', vendor: 'TechHub Electronics', tags: ['smartphone', 'apple', 'premium'], weight: 0.5, requiresShipping: true },
    { name: 'MacBook Pro 16"', description: 'High-performance laptop for professionals and creatives', shortDescription: 'Professional laptop with M3 Pro chip', price: 2499.99, compareAtPrice: 2699.99, costPrice: 2000.00, stockQuantity: 25, category: 'laptops', vendor: 'TechHub Electronics', tags: ['laptop', 'apple', 'professional'], weight: 2.1, requiresShipping: true },
    { name: 'Samsung Galaxy Tab S9', description: 'Versatile tablet for work and entertainment', shortDescription: 'Premium Android tablet with S Pen', price: 799.99, compareAtPrice: 899.99, costPrice: 650.00, stockQuantity: 30, category: 'tablets', vendor: 'TechHub Electronics', tags: ['tablet', 'samsung', 'android'], weight: 0.7, requiresShipping: true },
    { name: 'Classic Denim Jacket', slug: 'classic-denim-jacket', description: 'Timeless denim jacket perfect for casual wear', shortDescription: 'Premium quality denim jacket', price: 89.99, compareAtPrice: 119.99, costPrice: 45.00, stockQuantity: 100, category: 'mens-clothing', vendor: 'StyleCraft Fashion', tags: ['jacket', 'denim', 'casual'], weight: 0.8, requiresShipping: true },
    { name: 'Elegant Evening Dress', slug: 'elegant-evening-dress', description: 'Beautiful evening dress for special occasions', shortDescription: 'Sophisticated dress for formal events', price: 159.99, compareAtPrice: 199.99, costPrice: 80.00, stockQuantity: 75, category: 'womens-clothing', vendor: 'StyleCraft Fashion', tags: ['dress', 'formal', 'elegant'], weight: 0.3, requiresShipping: true },
    { name: 'Luxury Watch Set', slug: 'luxury-watch-set', description: 'Premium watch collection with interchangeable straps', shortDescription: 'Elegant timepiece with multiple straps', price: 299.99, compareAtPrice: 399.99, costPrice: 150.00, stockQuantity: 40, category: 'fashion-accessories', vendor: 'StyleCraft Fashion', tags: ['watch', 'luxury', 'accessories'], weight: 0.2, requiresShipping: true },
    { name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair', description: 'Comfortable office chair with lumbar support', shortDescription: 'Professional ergonomic seating solution', price: 399.99, compareAtPrice: 499.99, costPrice: 200.00, stockQuantity: 60, category: 'furniture', vendor: 'HomeComfort Supplies', tags: ['chair', 'office', 'ergonomic'], weight: 15.0, requiresShipping: true },
    { name: 'Smart Coffee Maker', slug: 'smart-coffee-maker', description: 'WiFi-enabled coffee maker with app control', shortDescription: 'Smart brewing system for perfect coffee', price: 249.99, compareAtPrice: 299.99, costPrice: 125.00, stockQuantity: 80, category: 'kitchen', vendor: 'HomeComfort Supplies', tags: ['coffee', 'smart', 'appliance'], weight: 5.5, requiresShipping: true },
    { name: 'Garden Tool Set', slug: 'garden-tool-set', description: 'Complete set of essential gardening tools', shortDescription: 'Professional gardening toolkit', price: 129.99, compareAtPrice: 159.99, costPrice: 65.00, stockQuantity: 90, category: 'garden', vendor: 'HomeComfort Supplies', tags: ['gardening', 'tools', 'outdoor'], weight: 3.2, requiresShipping: true },
    { name: 'Professional Treadmill', slug: 'professional-treadmill', description: 'High-end treadmill with advanced features', shortDescription: 'Commercial-grade fitness equipment', price: 1999.99, compareAtPrice: 2299.99, costPrice: 1200.00, stockQuantity: 15, category: 'gym-equipment', vendor: 'FitZone Sports', tags: ['treadmill', 'fitness', 'cardio'], weight: 120.0, requiresShipping: true },
    { name: 'Basketball Set', slug: 'basketball-set', description: 'Complete basketball set with hoop and ball', shortDescription: 'Portable basketball system', price: 299.99, compareAtPrice: 349.99, costPrice: 150.00, stockQuantity: 45, category: 'sports-gear', vendor: 'FitZone Sports', tags: ['basketball', 'sports', 'outdoor'], weight: 25.0, requiresShipping: true },
    { name: 'Programming Fundamentals', slug: 'programming-fundamentals', description: 'Comprehensive guide to programming concepts', shortDescription: 'Essential programming textbook', price: 79.99, compareAtPrice: 99.99, costPrice: 40.00, stockQuantity: 120, category: 'educational-books', vendor: 'Knowledge Corner Books', tags: ['programming', 'education', 'technology'], weight: 1.2, requiresShipping: true },
    { name: 'Mystery Novel Collection', slug: 'mystery-novel-collection', description: 'Collection of bestselling mystery novels', shortDescription: 'Thrilling mystery book series', price: 49.99, compareAtPrice: 69.99, costPrice: 25.00, stockQuantity: 85, category: 'fiction-books', vendor: 'Knowledge Corner Books', tags: ['fiction', 'mystery', 'novels'], weight: 2.0, requiresShipping: true },
    { name: 'Premium Notebook Set', slug: 'premium-notebook-set', description: 'High-quality notebooks for students and professionals', shortDescription: 'Professional writing materials', price: 29.99, compareAtPrice: 39.99, costPrice: 15.00, stockQuantity: 200, category: 'stationery', vendor: 'Knowledge Corner Books', tags: ['notebook', 'stationery', 'writing'], weight: 0.8, requiresShipping: true }
  ];

  for (const productData of sampleProducts) {
    const category = subcategories.find(cat => cat.name.toLowerCase() === productData.category);
    const vendor = vendors.find(v => v.businessName === productData.vendor);
    
    if (category && vendor) {
      const product = await prisma.product.create({
        data: {
          vendorId: vendor.id,
          categoryId: category.id,
          name: productData.name,
          description: productData.description,
          shortDescription: productData.shortDescription,
          sku: `SKU${Math.floor(Math.random() * 1000000)}`,
          price: productData.price,
          compareAtPrice: productData.compareAtPrice,
          costPrice: productData.costPrice,
          stockQuantity: productData.stockQuantity,
          minStockLevel: 5,
          weight: productData.weight,
          dimensions: JSON.stringify({
            length: 10 + Math.random() * 20,
            width: 10 + Math.random() * 20,
            height: 5 + Math.random() * 15
          }),
          images: JSON.stringify([
            `https://via.placeholder.com/600x600?text=${encodeURIComponent(productData.name)}`,
            `https://via.placeholder.com/600x600?text=${encodeURIComponent(productData.name)}-2`
          ]),
          tags: JSON.stringify(productData.tags),
          isActive: true,
          isFeatured: Math.random() > 0.7,
          requiresShipping: productData.requiresShipping,
          seoTitle: `${productData.name} - Best Quality`,
          seoDescription: productData.shortDescription
        }
      });

      products.push(product);

      // Add product variants for selected products
      if (product.name === 'iPhone 15 Pro Max') {
        await prisma.productVariant.createMany({
          data: [
            { productId: product.id, name: 'Storage', value: '256GB', priceModifier: 0, stockQuantity: 25, sortOrder: 1 },
            { productId: product.id, name: 'Storage', value: '512GB', priceModifier: 200, stockQuantity: 20, sortOrder: 2 },
            { productId: product.id, name: 'Color', value: 'Natural Titanium', priceModifier: 0, stockQuantity: 30, sortOrder: 3 },
            { productId: product.id, name: 'Color', value: 'Blue Titanium', priceModifier: 0, stockQuantity: 20, sortOrder: 4 }
          ]
        });
      }

      if (product.name === 'Classic Denim Jacket') {
        await prisma.productVariant.createMany({
          data: [
            { productId: product.id, name: 'Size', value: 'S', priceModifier: 0, stockQuantity: 25, sortOrder: 1 },
            { productId: product.id, name: 'Size', value: 'M', priceModifier: 0, stockQuantity: 35, sortOrder: 2 },
            { productId: product.id, name: 'Size', value: 'L', priceModifier: 0, stockQuantity: 30, sortOrder: 3 },
            { productId: product.id, name: 'Size', value: 'XL', priceModifier: 10, stockQuantity: 10, sortOrder: 4 }
          ]
        });
      }
    }
  }

  return products;
}

async function createShippingZones() {
  logProgress('Creating shipping zones and rates...', 5, 8);
  
  // Domestic shipping zone
  const domesticZone = await prisma.shippingZone.create({
    data: {
      name: 'Domestic India',
      countries: JSON.stringify(['IN']),
      states: JSON.stringify(['*']), // All states
      zipCodes: JSON.stringify(['*']), // All zip codes
      isActive: true
    }
  });

  // Domestic shipping rates
  await prisma.shippingRate.createMany({
    data: [
      { shippingZoneId: domesticZone.id, name: 'Standard Domestic Shipping', conditionType: 'price', minValue: 0, maxValue: 500, rate: 50, isActive: true },
      { shippingZoneId: domesticZone.id, name: 'Free Domestic Shipping', conditionType: 'price', minValue: 500, maxValue: null, rate: 0, isActive: true },
      { shippingZoneId: domesticZone.id, name: 'Heavy Item Shipping', conditionType: 'weight', minValue: 10, maxValue: null, rate: 150, isActive: true }
    ]
  });

  // International shipping zone
  const internationalZone = await prisma.shippingZone.create({
    data: {
      name: 'International',
      countries: JSON.stringify(['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'SG']),
      states: JSON.stringify(['*']),
      zipCodes: JSON.stringify(['*']),
      isActive: true
    }
  });

  // International shipping rates
  await prisma.shippingRate.createMany({
    data: [
      { shippingZoneId: internationalZone.id, name: 'Standard International Shipping', conditionType: 'price', minValue: 0, maxValue: 1000, rate: 300, isActive: true },
      { shippingZoneId: internationalZone.id, name: 'Express International Shipping', conditionType: 'price', minValue: 1000, maxValue: null, rate: 500, isActive: true }
    ]
  });

  return [domesticZone, internationalZone];
}

async function createCoupons(vendors: any[]) {
  logProgress('Creating sample coupons...', 6, 8);

  // Global coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10', name: 'Welcome Discount', description: '10% off for new customers',
        discountType: 'percentage', discountValue: 10, minOrderAmount: 100, maxDiscountAmount: 500,
        usageLimit: 1000, usageCount: 0, startsAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true, categoryIds: JSON.stringify([]), productIds: JSON.stringify([])
      },
      {
        code: 'FREESHIP', name: 'Free Shipping', description: 'Free shipping on orders above ₹500',
        discountType: 'fixed', discountValue: 0, minOrderAmount: 500, maxDiscountAmount: null,
        usageLimit: null, usageCount: 0, startsAt: new Date(), expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true, categoryIds: JSON.stringify([]), productIds: JSON.stringify([])
      },
      {
        code: 'SAVE50', name: 'Save 50', description: 'Flat ₹50 discount on orders above ₹300',
        discountType: 'fixed', discountValue: 50, minOrderAmount: 300, maxDiscountAmount: null,
        usageLimit: 500, usageCount: 0, startsAt: new Date(), expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true, categoryIds: JSON.stringify([]), productIds: JSON.stringify([])
      }
    ]
  });

  // Vendor-specific coupon
  const approvedVendor = vendors.find(v => v.isVerified === true);
  if (approvedVendor) {
    await prisma.coupon.create({
      data: {
        code: 'VENDOR15', name: 'Vendor Special', description: '15% off on selected vendor products',
        discountType: 'percentage', discountValue: 15, minOrderAmount: 200, maxDiscountAmount: 300,
        usageLimit: 100, usageCount: 0, startsAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    });
  }
}

async function createSampleShipments(orders: any[]) {
  logProgress('Creating sample shipments...', 7, 9);

  const carriers = ['shiprocket', 'fedex', 'dhl', 'delhivery'];
  const statuses = ['pending', 'shipped', 'in_transit', 'delivered'];

  for (const order of orders.slice(0, 5)) { // Create shipments for first 5 orders
    const randomCarrier = carriers[Math.floor(Math.random() * carriers.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        trackingNumber: `TRK${Math.floor(Math.random() * 1000000000)}`,
        carrier: randomCarrier,
        serviceType: randomStatus === 'delivered' ? 'express' : 'standard',
        status: randomStatus,
        shippedAt: randomStatus !== 'pending' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        deliveredAt: randomStatus === 'delivered' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : null,
        estimatedDelivery: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        weight: Math.random() * 5 + 0.5,
        dimensions: JSON.stringify({
          length: 20 + Math.random() * 30,
          width: 15 + Math.random() * 20,
          height: 10 + Math.random() * 15
        }),
        cost: Math.random() * 100 + 50,
        notes: `Shipment via ${randomCarrier}`
      }
    });
  }
}

async function createSamplePayouts(vendors: any[]) {
  logProgress('Creating sample payouts...', 8, 9);

  const payoutMethods = ['bank_transfer', 'paypal', 'stripe'];
  const statuses = ['pending', 'processing', 'completed', 'failed'];

  for (const vendor of vendors) {
    // Create 2-3 payouts per vendor
    const payoutCount = Math.floor(Math.random() * 2) + 2;

    for (let i = 0; i < payoutCount; i++) {
      const randomMethod = payoutMethods[Math.floor(Math.random() * payoutMethods.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 5000) + 500;

      const payout = await prisma.payout.create({
        data: {
          vendorId: vendor.id,
          amount: amount,
          currency: 'USD',
          status: randomStatus,
          payoutMethod: randomMethod,
          referenceId: randomStatus !== 'pending' ? `REF${Math.floor(Math.random() * 1000000)}` : null,
          description: `Payout for vendor earnings - ${new Date().toLocaleDateString()}`,
          processedAt: randomStatus !== 'pending' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          completedAt: randomStatus === 'completed' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
          failureReason: randomStatus === 'failed' ? 'Insufficient funds in vendor account' : null,
          metadata: JSON.stringify({
            period: 'monthly',
            transactionCount: Math.floor(Math.random() * 50) + 10
          })
        }
      });
    }
  }
}

async function createSampleOrders(vendors: any[], products: any[]) {
  logProgress('Creating sample orders...', 7, 11);

  const orders = [];
  const customers = await prisma.user.findMany({ where: { role: 'customer' } });
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  for (let i = 0; i < 10; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const orderProducts = products.slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 products per order

    let subtotal = 0;
    const orderItems = [];

    for (const product of orderProducts) {
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = product.price;
      const totalPrice = unitPrice * quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: product.id,
        vendorId: product.vendorId,
        quantity,
        unitPrice,
        totalPrice,
        productSnapshot: JSON.stringify({
          name: product.name,
          sku: product.sku,
          price: product.price
        })
      });
    }

    const taxAmount = subtotal * 0.1; // 10% tax
    const shippingAmount = subtotal > 500 ? 0 : 50; // Free shipping over $500
    const discountAmount = Math.random() > 0.7 ? subtotal * 0.1 : 0; // 10% discount sometimes
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        orderNumber: `ORD${Date.now()}${i}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        currency: 'USD',
        shippingAddress: JSON.stringify({
          firstName: customer.firstName,
          lastName: customer.lastName,
          address1: '123 Sample Street',
          city: 'Sample City',
          state: 'Sample State',
          zipCode: '12345',
          country: 'US'
        }),
        billingAddress: JSON.stringify({
          firstName: customer.firstName,
          lastName: customer.lastName,
          address1: '123 Sample Street',
          city: 'Sample City',
          state: 'Sample State',
          zipCode: '12345',
          country: 'US'
        }),
        paymentMethod: 'stripe',
        paymentStatus: Math.random() > 0.2 ? 'completed' : 'pending',
        notes: Math.random() > 0.8 ? 'Please handle with care' : null
      }
    });

    // Create order items
    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          ...item
        }
      });
    }

    orders.push(order);
  }

  return orders;
}

async function createSampleLogs(users: any[], orders: any[], products: any[], vendors: any[]) {
  logProgress('Creating sample logs...', 10, 11);

  const logEntries = [
    // User authentication logs
    { level: 'info', category: 'auth', message: 'User login successful', userId: users[0]?.id },
    { level: 'warn', category: 'auth', message: 'Failed login attempt', userId: users[1]?.id, metadata: JSON.stringify({ attempts: 3 }) },
    { level: 'error', category: 'auth', message: 'Account locked due to multiple failed attempts', userId: users[2]?.id },

    // Order logs
    { level: 'info', category: 'order', message: 'Order created successfully', userId: users[0]?.id, orderId: orders[0]?.id },
    { level: 'info', category: 'order', message: 'Order status updated to processing', orderId: orders[1]?.id },
    { level: 'error', category: 'order', message: 'Payment failed for order', orderId: orders[2]?.id, metadata: JSON.stringify({ error: 'Card declined' }) },

    // Product logs
    { level: 'info', category: 'product', message: 'Product created', userId: users[3]?.id, productId: products[0]?.id },
    { level: 'warn', category: 'product', message: 'Low stock alert', productId: products[1]?.id, metadata: JSON.stringify({ currentStock: 5, minStock: 10 }) },
    { level: 'info', category: 'product', message: 'Product updated', productId: products[2]?.id },

    // Vendor logs
    { level: 'info', category: 'vendor', message: 'Vendor application submitted', userId: users[4]?.id, vendorId: vendors[0]?.id },
    { level: 'info', category: 'vendor', message: 'Vendor approved', vendorId: vendors[1]?.id },
    { level: 'warn', category: 'vendor', message: 'Vendor payout failed', vendorId: vendors[2]?.id, metadata: JSON.stringify({ amount: 1500, reason: 'Invalid bank details' }) },

    // System logs
    { level: 'info', category: 'system', message: 'Database backup completed successfully' },
    { level: 'error', category: 'system', message: 'API rate limit exceeded', metadata: JSON.stringify({ ip: '192.168.1.100', endpoint: '/api/products' }) },
    { level: 'warn', category: 'system', message: 'High memory usage detected', metadata: JSON.stringify({ usage: '85%', threshold: '80%' }) }
  ];

  for (const logData of logEntries) {
    await prisma.log.create({
      data: {
        level: logData.level,
        category: logData.category,
        message: logData.message,
        userId: logData.userId,
        orderId: logData.orderId,
        productId: logData.productId,
        vendorId: logData.vendorId,
        ipAddress: logData.metadata ? JSON.parse(logData.metadata).ip : `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        metadata: logData.metadata,
        stackTrace: logData.level === 'error' ? 'Error: Something went wrong\n    at functionName (file.js:10:5)' : null
      }
    });
  }
}

async function cleanupExistingData() {
  logProgress('Cleaning up existing data...');
  
  // Delete in correct order to respect foreign key constraints
  await prisma.productVariant.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.vendorEarning.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.shippingRate.deleteMany({});
  await prisma.shippingZone.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});
  
  logProgress('✅ Existing data cleaned up');
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...\n');

    // Step 1: Cleanup existing data
    await cleanupExistingData();

    // Step 2: Create users (admin, vendors, customers)
    const { adminUser, vendors } = await createUsers();

    // Step 3: Create categories and subcategories
    const categories = await createCategories();

    // Step 4: Create products with variants
    const products = await createProducts(vendors, categories);

    // Step 5: Create shipping zones and rates
    await createShippingZones();

    // Step 6: Create coupons
    await createCoupons(vendors);

    // Step 7: Create sample orders (needed for shipments and logs)
    const orders = await createSampleOrders(vendors, products);

    // Step 8: Create sample shipments
    await createSampleShipments(orders);

    // Step 9: Create sample payouts
    await createSamplePayouts(vendors);

    // Step 10: Create sample logs
    await createSampleLogs([adminUser, ...vendors], orders, products, vendors);

    // Step 11: Final summary
    logProgress('Database seeding completed successfully! ✅', 11, 11);

    console.log('\n📊 Seeding Summary:');
    console.log(`👤 Admin User: admin@ecommerce.com (password: admin123)`);
    console.log(`🏪 Vendors: ${vendors.length} vendors created`);
    console.log(`🛍️ Categories: ${categories.length} categories/subcategories created`);
    console.log(`📦 Products: ${products.length} products with variants created`);
    console.log(`🛒 Orders: ${orders.length} sample orders created`);
    console.log(`🚚 Shipping: Domestic and International zones configured`);
    console.log(`📦 Shipments: Sample shipments created for orders`);
    console.log(`💰 Payouts: Sample payouts created for vendors`);
    console.log(`📋 Logs: Sample audit logs created`);
    console.log(`🎟️ Coupons: WELCOME10, FREESHIP, SAVE50, VENDOR15`);
    console.log(`👥 Sample Customers: 3 customer accounts created`);

    console.log('\n🔐 Sample Login Credentials:');
    console.log('Admin: admin@ecommerce.com / admin123');
    console.log('Vendors: vendor1@ecommerce.com / vendor123 (and vendor2-5)');
    console.log('Customers: customer1@example.com / customer123 (and customer2-3)');

    console.log('\n🎯 Next Steps:');
    console.log('1. Run: npm run db:migrate');
    console.log('2. Run: npm run db:seed');
    console.log('3. Start the server: npm run dev');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });