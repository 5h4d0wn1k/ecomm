import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 },   // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 },   // Ramp up to 200 users over 2 minutes
    { duration: '5m', target: 200 },   // Stay at 200 users for 5 minutes
    { duration: '2m', target: 0 },     // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
    errors: ['rate<0.1'],             // Custom error rate
  },
  ext: {
    loadimpact: {
      projectID: __ENV.K6_PROJECT_ID || 123456,
      name: 'E-commerce Performance Test'
    }
  }
};

// Base URL from environment or default
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'test3@example.com', password: 'password123' },
];

export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];

  // Test homepage
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  responseTime.add(response.timings.duration);

  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds

  // Test API health check
  response = http.get(`${BASE_URL}/api/health`);
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);
  responseTime.add(response.timings.duration);

  sleep(Math.random() * 2 + 1);

  // Test products API
  response = http.get(`${BASE_URL}/api/products?limit=20`);
  check(response, {
    'products API status is 200': (r) => r.status === 200,
    'products API response time < 1000ms': (r) => r.timings.duration < 1000,
    'products response has data': (r) => r.json().length > 0,
  }) || errorRate.add(1);
  responseTime.add(response.timings.duration);

  sleep(Math.random() * 3 + 2); // Random sleep between 2-5 seconds

  // Test categories API
  response = http.get(`${BASE_URL}/api/categories`);
  check(response, {
    'categories API status is 200': (r) => r.status === 200,
    'categories API response time < 800ms': (r) => r.timings.duration < 800,
  }) || errorRate.add(1);
  responseTime.add(response.timings.duration);

  sleep(Math.random() * 2 + 1);

  // Test search functionality (if available)
  const searchTerm = 'test';
  response = http.get(`${BASE_URL}/api/products/search?q=${searchTerm}`);
  check(response, {
    'search API status is 200': (r) => r.status === 200,
    'search API response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);
  responseTime.add(response.timings.duration);

  sleep(Math.random() * 3 + 1);
}

// Setup function - runs before the test starts
export function setup() {
  console.log('Starting performance test setup...');

  // Warm up the application
  const response = http.get(`${BASE_URL}/api/health`);
  if (response.status !== 200) {
    console.error('Application is not healthy. Aborting test.');
    return;
  }

  console.log('Application is healthy. Starting performance test...');
  return { timestamp: new Date().toISOString() };
}

// Teardown function - runs after the test completes
export function teardown(data) {
  console.log(`Performance test completed at ${data.timestamp}`);
  console.log('Test teardown completed.');
}

// Handle summary - custom summary output
export function handleSummary(data) {
  const summary = {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'performance-summary.json': JSON.stringify(data, null, 2),
  };

  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>K6 Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>K6 Performance Test Report</h1>
    <p><strong>Test Duration:</strong> ${data.metrics.iteration_duration.values.avg}ms average</p>
    <p><strong>Total Requests:</strong> ${data.metrics.http_reqs.values.count}</p>
    <p><strong>Failed Requests:</strong> ${data.metrics.http_req_failed.values.rate * 100}%</p>

    <h2>Response Times</h2>
    <div class="metric">
        <p><strong>Average:</strong> ${Math.round(data.metrics.http_req_duration.values.avg)}ms</p>
        <p><strong>95th Percentile:</strong> ${Math.round(data.metrics.http_req_duration.values['p(95)']}ms</p>
        <p><strong>99th Percentile:</strong> ${Math.round(data.metrics.http_req_duration.values['p(99)']}ms</p>
    </div>

    <h2>Custom Metrics</h2>
    <div class="metric">
        <p><strong>Error Rate:</strong> ${Math.round(data.metrics.errors.values.rate * 100)}%</p>
        <p><strong>Average Response Time:</strong> ${Math.round(data.metrics.response_time.values.avg)}ms</p>
    </div>
</body>
</html>`;

  summary['performance-report.html'] = htmlReport;

  return summary;
}

function textSummary(data, options) {
  return `
📊 Performance Test Summary
==========================

Test Duration: ${Math.round(data.metrics.iteration_duration.values.avg / 1000)}s
Total Requests: ${data.metrics.http_reqs.values.count}
Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%

Response Times:
  Average: ${Math.round(data.metrics.http_req_duration.values.avg)}ms
  95th percentile: ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms
  99th percentile: ${Math.round(data.metrics.http_req_duration.values['p(99)'])}ms

Custom Metrics:
  Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%
  Avg Response Time: ${Math.round(data.metrics.response_time.values.avg)}ms

Thresholds:
  ${data.metrics.http_req_duration.thresholds['p(95)<500'].ok ? '✅' : '❌'} 95% of requests < 500ms
  ${data.metrics.http_req_failed.thresholds['rate<0.1'].ok ? '✅' : '❌'} Error rate < 10%
  ${data.metrics.errors.thresholds['rate<0.1'].ok ? '✅' : '❌'} Custom error rate < 10%
`;
}