/**
 * Razorpay Integration Test Script
 * This script tests the Razorpay payment flow without making real payments
 */

const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000'; // Update with your actual URL
const TEST_USER_TOKEN = 'your_test_token_here'; // Get from browser dev tools
const TEST_ADDRESS_ID = 'your_test_address_id_here'; // Get from database
const TEST_PRODUCT_ID = 'your_test_product_id_here'; // Get from database

async function testRazorpayIntegration() {
    console.log('🧪 Starting Razorpay Integration Tests...\n');

    try {
        // Test 1: Create order with Razorpay
        console.log('1️⃣ Testing Order Creation with Razorpay...');
        const orderResponse = await axios.post(`${BASE_URL}/api/orders`, {
            addressId: TEST_ADDRESS_ID,
            items: [{
                id: TEST_PRODUCT_ID,
                quantity: 1
            }],
            paymentMethod: 'RAZORPAY'
        }, {
            headers: {
                Authorization: `Bearer ${TEST_USER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Order created successfully');
        console.log('Order ID:', orderResponse.data.order.id);
        console.log('Razorpay Key:', orderResponse.data.key ? 'Present' : 'Missing');

        // Test 2: Simulate payment verification (mock data)
        console.log('\n2️⃣ Testing Payment Verification...');
        const mockPaymentData = {
            razorpay_order_id: orderResponse.data.order.id,
            razorpay_payment_id: 'pay_mock_payment_id',
            razorpay_signature: 'mock_signature'
        };

        try {
            const verifyResponse = await axios.post(`${BASE_URL}/api/razorpay/verify`, mockPaymentData, {
                headers: {
                    Authorization: `Bearer ${TEST_USER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Payment verification successful');
        } catch (error) {
            console.log('⚠️ Payment verification failed (expected with mock data):', error.response?.data?.error);
        }

        // Test 3: Check order status
        console.log('\n3️⃣ Testing Order Retrieval...');
        const ordersResponse = await axios.get(`${BASE_URL}/api/orders`, {
            headers: {
                Authorization: `Bearer ${TEST_USER_TOKEN}`
            }
        });

        const razorpayOrders = ordersResponse.data.orders.filter(order =>
            order.paymentMethod === 'RAZORPAY'
        );

        console.log('✅ Found', razorpayOrders.length, 'Razorpay orders');
        if (razorpayOrders.length > 0) {
            console.log('Latest Razorpay order status:', razorpayOrders[0].status);
            console.log('Razorpay Order ID:', razorpayOrders[0].razorpayOrderId);
        }

        // Test 4: Test error handling
        console.log('\n4️⃣ Testing Error Handling...');

        // Invalid payment method
        try {
            await axios.post(`${BASE_URL}/api/orders`, {
                addressId: TEST_ADDRESS_ID,
                items: [{ id: TEST_PRODUCT_ID, quantity: 1 }],
                paymentMethod: 'INVALID'
            }, {
                headers: {
                    Authorization: `Bearer ${TEST_USER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.log('✅ Invalid payment method handled:', error.response?.data?.error);
        }

        // Missing address
        try {
            await axios.post(`${BASE_URL}/api/orders`, {
                items: [{ id: TEST_PRODUCT_ID, quantity: 1 }],
                paymentMethod: 'RAZORPAY'
            }, {
                headers: {
                    Authorization: `Bearer ${TEST_USER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.log('✅ Missing address handled:', error.response?.data?.error);
        }

        console.log('\n🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Manual testing instructions
function printManualTestingInstructions() {
    console.log('\n📋 Manual Testing Instructions:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Login to your account');
    console.log('3. Add items to cart');
    console.log('4. Go to cart page');
    console.log('5. Select Razorpay as payment method');
    console.log('6. Click "Place Order"');
    console.log('7. Verify Razorpay checkout opens');
    console.log('8. Check browser console for any errors');
    console.log('9. Check database for order creation');
    console.log('10. Test with invalid data to verify error handling');
}

// Run tests
if (require.main === module) {
    testRazorpayIntegration().then(() => {
        printManualTestingInstructions();
    });
}

module.exports = { testRazorpayIntegration };