"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.test' });
beforeAll(async () => {
});
afterAll(async () => {
});
jest.mock('../src/services/email.service', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
}));
jest.mock('../src/services/file-upload.service', () => ({
    uploadFile: jest.fn().mockResolvedValue('mock-url'),
}));
jest.setTimeout(30000);
//# sourceMappingURL=setup.js.map