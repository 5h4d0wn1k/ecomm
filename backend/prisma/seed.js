"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt_1.default.hash(password, saltRounds);
}
function logProgress(message, step, total) {
    const stepInfo = step && total ? `[${step}/${total}] ` : '';
    console.log(`🌱 ${stepInfo}${message}`);
}
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
        status: client_1.VendorStatus.approved,
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
        status: client_1.VendorStatus.approved,
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
        status: client_1.VendorStatus.approved,
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
        status: client_1.VendorStatus.pending,
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
        status: client_1.VendorStatus.approved,
        isVerified: true,
        commissionRate: 15.00
    }
];
async function createUsers() {
    logProgress('Creating admin user...', 1, 8);
    const adminPasswordHash = await hashPassword('admin123');
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@ecommerce.com',
            passwordHash: adminPasswordHash,
            role: client_1.UserRole.admin,
            firstName: 'Admin',
            lastName: 'User',
            phone: '+1-555-0000',
            isActive: true,
            emailVerified: true
        }
    });
    logProgress('Creating vendor users and accounts...', 2, 8);
    const vendors = [];
    for (const vendorData of sampleVendors) {
        const passwordHash = await hashPassword(vendorData.password);
        const user = await prisma.user.create({
            data: {
                email: vendorData.email,
                passwordHash,
                role: client_1.UserRole.vendor,
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
                status: vendorData.status,
                isVerified: vendorData.isVerified,
                commissionRate: vendorData.commissionRate,
                bankAccountDetails: {
                    accountHolderName: `${vendorData.firstName} ${vendorData.lastName}`,
                    accountNumber: `ACC${Math.floor(Math.random() * 1000000000)}`,
                    routingNumber: `RTG${Math.floor(Math.random() * 100000000)}`,
                    bankName: 'Sample Bank'
                }
            }
        });
        vendors.push(vendor);
    }
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
                role: client_1.UserRole.customer,
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
        const parentCategory = await prisma.category.create({
            data: {
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description,
                isActive: true,
                sortOrder: categories.length
            }
        });
        categories.push(parentCategory);
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
            categories.push(subcategory);
        }
    }
    return categories;
}
async function createProducts(vendors, categories) {
    logProgress('Creating sample products...', 4, 8);
    const products = [];
    const subcategories = categories.filter(cat => cat.parentId !== null);
    const sampleProducts = [
        { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', description: 'Latest iPhone with advanced features and premium build quality', shortDescription: 'Premium smartphone with cutting-edge technology', price: 1299.99, compareAtPrice: 1399.99, costPrice: 1000.00, stockQuantity: 50, category: 'smartphones', vendor: 'TechHub Electronics', tags: ['smartphone', 'apple', 'premium'], weight: 0.5, requiresShipping: true },
        { name: 'MacBook Pro 16"', slug: 'macbook-pro-16', description: 'High-performance laptop for professionals and creatives', shortDescription: 'Professional laptop with M3 Pro chip', price: 2499.99, compareAtPrice: 2699.99, costPrice: 2000.00, stockQuantity: 25, category: 'laptops', vendor: 'TechHub Electronics', tags: ['laptop', 'apple', 'professional'], weight: 2.1, requiresShipping: true },
        { name: 'Samsung Galaxy Tab S9', slug: 'samsung-galaxy-tab-s9', description: 'Versatile tablet for work and entertainment', shortDescription: 'Premium Android tablet with S Pen', price: 799.99, compareAtPrice: 899.99, costPrice: 650.00, stockQuantity: 30, category: 'tablets', vendor: 'TechHub Electronics', tags: ['tablet', 'samsung', 'android'], weight: 0.7, requiresShipping: true },
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
        const category = subcategories.find(cat => cat.slug === productData.category);
        const vendor = vendors.find(v => v.businessName === productData.vendor);
        if (category && vendor) {
            const product = await prisma.product.create({
                data: {
                    vendorId: vendor.id,
                    categoryId: category.id,
                    name: productData.name,
                    slug: productData.slug,
                    description: productData.description,
                    shortDescription: productData.shortDescription,
                    sku: `SKU${Math.floor(Math.random() * 1000000)}`,
                    price: productData.price,
                    compareAtPrice: productData.compareAtPrice,
                    costPrice: productData.costPrice,
                    stockQuantity: productData.stockQuantity,
                    minStockLevel: 5,
                    weight: productData.weight,
                    dimensions: {
                        length: 10 + Math.random() * 20,
                        width: 10 + Math.random() * 20,
                        height: 5 + Math.random() * 15
                    },
                    images: [
                        `https://via.placeholder.com/600x600?text=${encodeURIComponent(productData.name)}`,
                        `https://via.placeholder.com/600x600?text=${encodeURIComponent(productData.name)}-2`
                    ],
                    tags: productData.tags,
                    status: client_1.ProductStatus.active,
                    isActive: true,
                    isFeatured: Math.random() > 0.7,
                    requiresShipping: productData.requiresShipping,
                    seoTitle: `${productData.name} - Best Quality`,
                    seoDescription: productData.shortDescription
                }
            });
            products.push(product);
            if (product.slug === 'iphone-15-pro-max') {
                await prisma.productVariant.createMany({
                    data: [
                        { productId: product.id, name: 'Storage', value: '256GB', priceModifier: 0, stockQuantity: 25, sortOrder: 1 },
                        { productId: product.id, name: 'Storage', value: '512GB', priceModifier: 200, stockQuantity: 20, sortOrder: 2 },
                        { productId: product.id, name: 'Color', value: 'Natural Titanium', priceModifier: 0, stockQuantity: 30, sortOrder: 3 },
                        { productId: product.id, name: 'Color', value: 'Blue Titanium', priceModifier: 0, stockQuantity: 20, sortOrder: 4 }
                    ]
                });
            }
            if (product.slug === 'classic-denim-jacket') {
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
    const domesticZone = await prisma.shippingZone.create({
        data: {
            name: 'Domestic India',
            countries: ['IN'],
            states: ['*'],
            zipCodes: ['*'],
            isActive: true
        }
    });
    await prisma.shippingRate.createMany({
        data: [
            { shippingZoneId: domesticZone.id, name: 'Standard Domestic Shipping', conditionType: client_1.ShippingConditionType.price, minValue: 0, maxValue: 500, rate: 50, isActive: true },
            { shippingZoneId: domesticZone.id, name: 'Free Domestic Shipping', conditionType: client_1.ShippingConditionType.price, minValue: 500, maxValue: null, rate: 0, isActive: true },
            { shippingZoneId: domesticZone.id, name: 'Heavy Item Shipping', conditionType: client_1.ShippingConditionType.weight, minValue: 10, maxValue: null, rate: 150, isActive: true }
        ]
    });
    const internationalZone = await prisma.shippingZone.create({
        data: {
            name: 'International',
            countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'SG'],
            states: ['*'],
            zipCodes: ['*'],
            isActive: true
        }
    });
    await prisma.shippingRate.createMany({
        data: [
            { shippingZoneId: internationalZone.id, name: 'Standard International Shipping', conditionType: client_1.ShippingConditionType.price, minValue: 0, maxValue: 1000, rate: 300, isActive: true },
            { shippingZoneId: internationalZone.id, name: 'Express International Shipping', conditionType: client_1.ShippingConditionType.price, minValue: 1000, maxValue: null, rate: 500, isActive: true }
        ]
    });
    return [domesticZone, internationalZone];
}
async function createCoupons(vendors) {
    logProgress('Creating sample coupons...', 6, 8);
    await prisma.coupon.createMany({
        data: [
            {
                code: 'WELCOME10', name: 'Welcome Discount', description: '10% off for new customers',
                discountType: client_1.DiscountType.percentage, discountValue: 10, minimumOrderAmount: 100, maximumDiscountAmount: 500,
                usageLimit: 1000, usageCount: 0, validFrom: new Date(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true, applicableTo: client_1.ApplicableTo.all, categoryIds: [], productIds: []
            },
            {
                code: 'FREESHIP', name: 'Free Shipping', description: 'Free shipping on orders above ₹500',
                discountType: client_1.DiscountType.free_shipping, discountValue: 0, minimumOrderAmount: 500, maximumDiscountAmount: null,
                usageLimit: null, usageCount: 0, validFrom: new Date(), validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true, applicableTo: client_1.ApplicableTo.all, categoryIds: [], productIds: []
            },
            {
                code: 'SAVE50', name: 'Flat ₹50 Off', description: 'Flat ₹50 discount on orders above ₹300',
                discountType: client_1.DiscountType.fixed_amount, discountValue: 50, minimumOrderAmount: 300, maximumDiscountAmount: null,
                usageLimit: 500, usageCount: 0, validFrom: new Date(), validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true, applicableTo: client_1.ApplicableTo.all, categoryIds: [], productIds: []
            }
        ]
    });
    const approvedVendor = vendors.find(v => v.status === 'approved');
    if (approvedVendor) {
        await prisma.coupon.create({
            data: {
                code: 'VENDOR15', name: 'Vendor Special', description: '15% off on selected vendor products',
                discountType: client_1.DiscountType.percentage, discountValue: 15, minimumOrderAmount: 200, maximumDiscountAmount: 300,
                usageLimit: 100, usageCount: 0, validFrom: new Date(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true, applicableTo: client_1.ApplicableTo.specific_vendors, vendorId: approvedVendor.id, categoryIds: [], productIds: []
            }
        });
    }
}
async function cleanupExistingData() {
    logProgress('Cleaning up existing data...');
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
    await prisma.passwordHistory.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.user.deleteMany({});
    logProgress('✅ Existing data cleaned up');
}
async function main() {
    try {
        console.log('🚀 Starting database seeding...\n');
        await cleanupExistingData();
        const { adminUser, vendors } = await createUsers();
        const categories = await createCategories();
        const products = await createProducts(vendors, categories);
        await createShippingZones();
        await createCoupons(vendors);
        logProgress('Database seeding completed successfully! ✅', 7, 7);
        console.log('\n📊 Seeding Summary:');
        console.log(`👤 Admin User: admin@ecommerce.com (password: admin123)`);
        console.log(`🏪 Vendors: ${vendors.length} vendors created`);
        console.log(`🛍️ Categories: ${categories.length} categories/subcategories created`);
        console.log(`📦 Products: ${products.length} products with variants created`);
        console.log(`🚚 Shipping: Domestic and International zones configured`);
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
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map