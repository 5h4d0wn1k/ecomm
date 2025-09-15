'use client'

import { useState, useEffect } from 'react'

export default function ShippingDelivery() {
    const [policy, setPolicy] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = await fetch('/api/shipping-policy')
                if (!response.ok) {
                    throw new Error('Failed to fetch shipping policy')
                }
                const data = await response.json()
                setPolicy(data.policy)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchPolicy()
    }, [])

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-lg">Loading shipping policy...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-lg text-red-600">Error: {error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">{policy.title}</h1>
            <p className="text-sm text-gray-600 mb-6">Last updated: {new Date(policy.updatedAt).toLocaleDateString()}</p>

            <section className="mb-8">
                <p className="text-gray-700 leading-relaxed mb-8">
                    This Shipping and Delivery Policy (&quot;Policy&quot;) forms an integral part of the Terms and Conditions of DAV Creations (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;). By placing an order on www.davcreations.in (&quot;Platform&quot;), you acknowledge and agree to the terms of this Policy.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Shipping Partners</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    The Company has engaged third-party logistics providers, including but not limited to Shiprocket, to ensure safe and reliable delivery of products.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    The selection of courier partners shall be at the sole discretion of the Company, based on serviceability, cost, and efficiency.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Shipping Charges</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Shipping charges are calculated on the basis of product weight, dimensions, delivery location, and rates prescribed by logistics partners.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                    The applicable shipping charge, if any, will be displayed at checkout before completion of the order.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    Shipping charges, once paid, are non-refundable unless otherwise required under law.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Order Processing and Dispatch</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Orders are processed once payment confirmation is received.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Resellers are required to hand over products to the designated logistics partner within 1–3 business days of order confirmation, unless otherwise specified.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    Dispatch timelines may vary depending on product type, availability, and reseller location.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Delivery Timelines</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Standard delivery timelines range between 5–10 business days from the date of dispatch.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Remote or non-serviceable locations may experience extended delivery timelines.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    Delivery timelines are estimates only and not guaranteed, as they depend on courier operations, unforeseen delays, or force majeure events.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Order Tracking</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Once an order is shipped, tracking details shall be shared with the customer via email, SMS, or through their account on the Platform.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    Customers are responsible for monitoring the tracking link and coordinating with the logistics provider, where required, for successful delivery.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Delivery Attempts</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    The logistics partner will make up to two (2) delivery attempts at the shipping address provided at checkout.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                    In the event of non-delivery due to:
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 ml-4">
                    <li>Incorrect or incomplete address,</li>
                    <li>Customer unavailability, or</li>
                    <li>Failure to accept the shipment,</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                    the product may be returned to the reseller. In such cases, re-shipping charges shall apply and must be borne by the customer.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. International Shipping</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Currently, DAV Creations ships products only within India.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    International orders and deliveries are not supported unless otherwise specified in writing by the Company.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Risk of Loss and Title</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    All products purchased from the Platform are made pursuant to a shipment contract with third-party logistics providers.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    Risk of loss and title for such products shall pass to the customer upon delivery by the logistics provider at the shipping address.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Delays and Force Majeure</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    The Company shall not be held liable for delays or failures in delivery caused by events beyond its reasonable control, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 ml-4">
                    <li>Natural disasters, strikes, lockouts, government actions, or courier disruptions.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                    In such cases, delivery timelines may be extended without liability on the Company.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Customer Obligations</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Customers must ensure that the shipping address and contact details provided at checkout are complete and accurate.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Customers must be available to accept delivery during standard courier delivery hours.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    Any additional costs incurred due to incorrect information or repeated failed delivery attempts shall be borne by the customer.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Return Shipping Responsibility</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    In the event of a return, replacement, or refund, the cost of return shipping shall be determined as follows:
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 ml-4">
                    <li>If the return is due to defective, damaged, or incorrect product delivered, the reseller or Company shall bear the return shipping cost.</li>
                    <li>If the return is due to customer reasons (such as refusal to accept, change of mind, incorrect address, or unavailability), the customer shall bear the return shipping cost.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                    Return shipping charges, if applicable, shall either be deducted from the refund amount or charged separately to the customer.
                </p>
            </section>
        </div>
    );
}