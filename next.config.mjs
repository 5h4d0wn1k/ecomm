/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Content Security Policy to prevent XSS
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://js.stripe.com; frame-src https://checkout.razorpay.com; object-src 'none'; base-uri 'self'; form-action 'self';"
                    },
                    // HTTP Strict Transport Security for HTTPS enforcement
                    {
                        key: 'Strict-Transport-Security',
                        value: process.env.NODE_ENV === 'production' ? 'max-age=31536000; includeSubDomains; preload' : 'max-age=0'
                    },
                    // Cross-Origin Resource Sharing policies
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*'
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE, OPTIONS'
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization'
                    },
                    // Additional security headers
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    }
                ]
            }
        ];
    }
};

export default nextConfig;
