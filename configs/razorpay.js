import Razorpay from 'razorpay';

// Enhanced environment variable validation
const requiredEnvVars = {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value || value.trim() === '')
    .map(([key]) => key);

if (missingVars.length > 0) {
    throw new Error(`Missing required Razorpay environment variables: ${missingVars.join(', ')}`);
}

// Validate format of key_id (should be rzp_test_ or rzp_live_ followed by alphanumeric)
const keyIdPattern = /^rzp_(test|live)_[a-zA-Z0-9]+$/;
if (!keyIdPattern.test(process.env.RAZORPAY_KEY_ID)) {
    throw new Error('Invalid RAZORPAY_KEY_ID format. Expected format: rzp_test_xxx or rzp_live_xxx');
}

// Validate webhook secret (should be a non-empty string, typically alphanumeric)
if (!process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET.length < 10) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is missing or appears to be too short/invalid');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;