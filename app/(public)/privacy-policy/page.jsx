'use client'

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>
            <p className="text-sm text-gray-600 mb-6">Last updated: September 15, 2024</p>

            <section className="mb-8">
                <p className="text-gray-700 leading-relaxed">
                    This Privacy Policy (&quot;Policy&quot;) governs the manner in which DAV Creations (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;) collects, uses, maintains, and discloses information from users (&quot;User(s)&quot;, &quot;you&quot;, &quot;your&quot;) of the website www.davcreations.in (&quot;Platform&quot;). By accessing or using the Platform, you consent to the terms of this Policy.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                <h3 className="text-xl font-medium mb-2">Personally Identifiable Information:</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Name, email address, contact number, billing and shipping address, bank/payment details (processed securely via third-party gateways).
                </p>
                <h3 className="text-xl font-medium mb-2">Business Information:</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Reseller registration details, tax identification, product-related data.
                </p>
                <h3 className="text-xl font-medium mb-2">Transactional Information:</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Purchase and sales records, commission details, and order history.
                </p>
                <h3 className="text-xl font-medium mb-2">Technical Information:</h3>
                <p className="text-gray-700 leading-relaxed">
                    Device details, IP address, cookies, browser type, and usage data.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Use of Information</h2>
                <p className="text-gray-700 leading-relaxed">
                    We may use collected information for:
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2">
                    <li>Processing orders, shipments, returns, and payments.</li>
                    <li>Facilitating reseller transactions and commission disbursement.</li>
                    <li>Providing customer service and resolving disputes.</li>
                    <li>Ensuring legal and regulatory compliance.</li>
                    <li>Marketing, promotions, and improvements to the Platform (with User consent where applicable).</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Disclosure of Information</h2>
                <p className="text-gray-700 leading-relaxed">
                    We may disclose information to:
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2">
                    <li>Shipping providers (including but not limited to Shiprocket) for order delivery.</li>
                    <li>Payment gateway providers for transaction processing.</li>
                    <li>Government authorities or law enforcement when legally required.</li>
                    <li>Other Users where disclosure is necessary to complete a transaction.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                    We do not sell or trade User data to third parties.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Data Protection</h2>
                <p className="text-gray-700 leading-relaxed">
                    Reasonable administrative, technical, and security measures are in place to protect your information. However, absolute security of data transmitted over the internet cannot be guaranteed.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Rights of Users</h2>
                <p className="text-gray-700 leading-relaxed">
                    You may request access, correction, or deletion of your personal data by contacting support@davcreations.in
                </p>
            </section>
        </div>
    );
}