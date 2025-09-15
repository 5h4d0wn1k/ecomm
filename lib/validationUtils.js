/**
 * Validation and sanitization utilities for input data
 * Provides comprehensive security measures against XSS, injection attacks, and data integrity issues
 */

// HTML escape for XSS prevention
const escapeHtml = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Remove potential script tags and dangerous content
const sanitizeHtml = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '');
};

// Trim and sanitize string
const sanitizeString = (str, options = {}) => {
    if (typeof str !== 'string') return str;

    let sanitized = str.trim();

    if (options.escapeHtml) {
        sanitized = escapeHtml(sanitized);
    }

    if (options.sanitizeHtml) {
        sanitized = sanitizeHtml(sanitized);
    }

    if (options.maxLength && sanitized.length > options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
};

// Validation patterns
const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    USERNAME: /^[a-zA-Z0-9_-]+$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    ALPHA: /^[a-zA-Z\s]+$/,
    NUMERIC: /^\d+$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

// Validation functions
const validators = {
    required: (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    },

    email: (value) => typeof value === 'string' && PATTERNS.EMAIL.test(value),

    phone: (value) => typeof value === 'string' && PATTERNS.PHONE.test(value.replace(/[\s\-\(\)]/g, '')),

    username: (value) => typeof value === 'string' && PATTERNS.USERNAME.test(value) && value.length >= 3 && value.length <= 50,

    alphanumeric: (value) => typeof value === 'string' && PATTERNS.ALPHANUMERIC.test(value),

    alpha: (value) => typeof value === 'string' && PATTERNS.ALPHA.test(value),

    numeric: (value) => typeof value === 'string' && PATTERNS.NUMERIC.test(value),

    url: (value) => typeof value === 'string' && PATTERNS.URL.test(value),

    uuid: (value) => typeof value === 'string' && PATTERNS.UUID.test(value),

    minLength: (value, min) => typeof value === 'string' && value.length >= min,

    maxLength: (value, max) => typeof value === 'string' && value.length <= max,

    length: (value, exact) => typeof value === 'string' && value.length === exact,

    min: (value, min) => typeof value === 'number' && value >= min,

    max: (value, max) => typeof value === 'number' && value <= max,

    range: (value, min, max) => typeof value === 'number' && value >= min && value <= max,

    array: (value) => Array.isArray(value),

    arrayMinLength: (value, min) => Array.isArray(value) && value.length >= min,

    arrayMaxLength: (value, max) => Array.isArray(value) && value.length <= max,

    object: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),

    boolean: (value) => typeof value === 'boolean',

    string: (value) => typeof value === 'string',

    number: (value) => typeof value === 'number' && !isNaN(value),
};

// Validate a single field
const validateField = (value, rules) => {
    const errors = [];

    for (const [rule, params] of Object.entries(rules)) {
        if (!validators[rule]) {
            errors.push(`Unknown validation rule: ${rule}`);
            continue;
        }

        let isValid;
        if (Array.isArray(params)) {
            isValid = validators[rule](value, ...params);
        } else {
            isValid = validators[rule](value, params);
        }

        if (!isValid) {
            errors.push(`Validation failed for rule: ${rule}`);
        }
    }

    return errors;
};

// Validate an object against a schema
const validateObject = (data, schema) => {
    const errors = {};
    const sanitized = {};

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];
        const fieldErrors = validateField(value, rules);

        if (fieldErrors.length > 0) {
            errors[field] = fieldErrors;
        }

        // Sanitize if specified
        if (rules.sanitize) {
            sanitized[field] = sanitizeString(value, rules.sanitize);
        } else {
            sanitized[field] = value;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitized,
    };
};

// Sanitize entire object
const sanitizeObject = (data, schema) => {
    const sanitized = {};

    for (const [field, rules] of Object.entries(schema)) {
        if (rules.sanitize) {
            sanitized[field] = sanitizeString(data[field], rules.sanitize);
        } else {
            sanitized[field] = data[field];
        }
    }

    return sanitized;
};

const validationUtils = {
    sanitizeString,
    sanitizeObject,
    validateField,
    validateObject,
    PATTERNS,
    validators,
};

export default validationUtils;