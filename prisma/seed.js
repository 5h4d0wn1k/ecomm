const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    await prisma.shippingPolicy.create({
        data: {
            title: "Shipping and Delivery Policy",
            content: `Introduction
At DavCreations, we are committed to delivering your orders efficiently and safely. This policy outlines our shipping and delivery procedures to ensure a smooth experience.

Shipping Methods
- Standard Shipping: 5-7 business days
- Express Shipping: 2-3 business days
- Overnight Shipping: Next business day

Delivery Times
Delivery times may vary based on your location and the shipping method selected. We aim to process orders within 1-2 business days.

International Shipping
We offer international shipping to select countries. Additional customs fees and duties may apply.

Tracking Your Order
Once your order ships, you will receive a tracking number via email to monitor your package's progress.

Contact Us
For any shipping-related inquiries, please contact us at support@davcreations.in.`
        }
    });
    console.log('Shipping policy seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });