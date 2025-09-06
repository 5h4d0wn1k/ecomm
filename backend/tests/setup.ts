import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Setup test database
  // This would typically involve:
  // 1. Connecting to test database
  // 2. Running migrations
  // 3. Seeding test data
});

afterAll(async () => {
  // Cleanup after tests
  // This would typically involve:
  // 1. Clearing test data
  // 2. Closing database connections
});

// Mock external services for testing
jest.mock('../src/services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/services/file-upload.service', () => ({
  uploadFile: jest.fn().mockResolvedValue('mock-url'),
}));

// Set test timeout
jest.setTimeout(30000);