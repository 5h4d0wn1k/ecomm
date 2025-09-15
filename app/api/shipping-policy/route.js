import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const policy = await prisma.shippingPolicy.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (!policy) {
            // Return default shipping policy if none exists
            const defaultPolicy = {
                id: 'default',
                title: 'Shipping and Delivery Policy',
                content: `
                    <p>This Shipping and Delivery Policy ("Policy") forms an integral part of the Terms and Conditions of DAV Creations ("Company", "we", "our", "us"). By placing an order on www.davcreations.in ("Platform"), you acknowledge and agree to the terms of this Policy.</p>

                    <h2>1. Shipping Partners</h2>
                    <p>The Company has engaged third-party logistics providers, including but not limited to Shiprocket, to ensure safe and reliable delivery of products.</p>
                    <p>The selection of courier partners shall be at the sole discretion of the Company, based on serviceability, cost, and efficiency.</p>

                    <h2>2. Shipping Charges</h2>
                    <p>Shipping charges are calculated on the basis of product weight, dimensions, delivery location, and rates prescribed by logistics partners.</p>
                    <p>The applicable shipping charge, if any, will be displayed at checkout before completion of the order.</p>
                    <p>Shipping charges, once paid, are non-refundable unless otherwise required under law.</p>

                    <h2>3. Order Processing and Dispatch</h2>
                    <p>Orders are processed once payment confirmation is received.</p>
                    <p>Resellers are required to hand over products to the designated logistics partner within 1–3 business days of order confirmation, unless otherwise specified.</p>
                    <p>Dispatch timelines may vary depending on product type, availability, and reseller location.</p>

                    <h2>4. Delivery Timelines</h2>
                    <p>Standard delivery timelines range between 5–10 business days from the date of dispatch.</p>
                    <p>Remote or non-serviceable locations may experience extended delivery timelines.</p>
                    <p>Delivery timelines are estimates only and not guaranteed, as they depend on courier operations, unforeseen delays, or force majeure events.</p>

                    <h2>5. Order Tracking</h2>
                    <p>Once an order is shipped, tracking details shall be shared with the customer via email, SMS, or through their account on the Platform.</p>
                    <p>Customers are responsible for monitoring the tracking link and coordinating with the logistics provider, where required, for successful delivery.</p>

                    <h2>6. Delivery Attempts</h2>
                    <p>The logistics partner will make up to two (2) delivery attempts at the shipping address provided at checkout.</p>
                    <p>In the event of non-delivery due to:</p>
                    <ul>
                        <li>Incorrect or incomplete address,</li>
                        <li>Customer unavailability, or</li>
                        <li>Failure to accept the shipment,</li>
                    </ul>
                    <p>the product may be returned to the reseller. In such cases, re-shipping charges shall apply and must be borne by the customer.</p>

                    <h2>7. International Shipping</h2>
                    <p>Currently, DAV Creations ships products only within India.</p>
                    <p>International orders and deliveries are not supported unless otherwise specified in writing by the Company.</p>

                    <h2>8. Risk of Loss and Title</h2>
                    <p>All products purchased from the Platform are made pursuant to a shipment contract with third-party logistics providers.</p>
                    <p>Risk of loss and title for such products shall pass to the customer upon delivery by the logistics provider at the shipping address.</p>

                    <h2>9. Delays and Force Majeure</h2>
                    <p>The Company shall not be held liable for delays or failures in delivery caused by events beyond its reasonable control, including but not limited to:</p>
                    <ul>
                        <li>Natural disasters, strikes, lockouts, government actions, or courier disruptions.</li>
                    </ul>
                    <p>In such cases, delivery timelines may be extended without liability on the Company.</p>

                    <h2>10. Customer Obligations</h2>
                    <p>Customers must ensure that the shipping address and contact details provided at checkout are complete and accurate.</p>
                    <p>Customers must be available to accept delivery during standard courier delivery hours.</p>
                    <p>Any additional costs incurred due to incorrect information or repeated failed delivery attempts shall be borne by the customer.</p>

                    <h2>11. Return Shipping Responsibility</h2>
                    <p>In the event of a return, replacement, or refund, the cost of return shipping shall be determined as follows:</p>
                    <ul>
                        <li>If the return is due to defective, damaged, or incorrect product delivered, the reseller or Company shall bear the return shipping cost.</li>
                        <li>If the return is due to customer reasons (such as refusal to accept, change of mind, incorrect address, or unavailability), the customer shall bear the return shipping cost.</li>
                    </ul>
                    <p>Return shipping charges, if applicable, shall either be deducted from the refund amount or charged separately to the customer.</p>
                `,
                updatedAt: new Date().toISOString()
            };
            return NextResponse.json({ policy: defaultPolicy });
        }

        return NextResponse.json({ policy });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}