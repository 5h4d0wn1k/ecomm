/**
 * Validation schemas for API endpoints
 * Defines validation rules and sanitization for different data types
 */

const orderSchema = {
    addressId: {
        required: true,
        string: true,
        sanitize: { escapeHtml: true, sanitizeHtml: true, maxLength: 100 }
    },
    items: {
        required: true,
        array: true,
        arrayMinLength: 1,
        // Custom validation for items array
        validateItems: true // We'll handle this in the route
    },
    couponCode: {
        string: true,
        minLength: 1,
        maxLength: 50,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    paymentMethod: {
        required: true,
        string: true,
        sanitize: { escapeHtml: true }
    }
};

const storeCreateSchema = {
    name: {
        required: true,
        string: true,
        minLength: 2,
        maxLength: 100,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    username: {
        required: true,
        username: true,
        minLength: 3,
        maxLength: 20,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    description: {
        required: true,
        string: true,
        minLength: 10,
        maxLength: 500,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    email: {
        required: true,
        email: true,
        sanitize: { escapeHtml: true }
    },
    contact: {
        required: true,
        phone: true,
        sanitize: { escapeHtml: true }
    },
    address: {
        required: true,
        string: true,
        minLength: 10,
        maxLength: 300,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    }
};

const productCreateSchema = {
    name: {
        required: true,
        string: true,
        minLength: 2,
        maxLength: 100,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    description: {
        required: true,
        string: true,
        minLength: 10,
        maxLength: 1000,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    price: {
        required: true,
        number: true,
        min: 0.01,
        max: 999999.99
    },
    category: {
        required: true,
        string: true,
        minLength: 2,
        maxLength: 50,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    inStock: {
        boolean: true
    }
};

const couponSchema = {
    code: {
        required: true,
        string: true,
        minLength: 3,
        maxLength: 20,
        alphanumeric: true,
        sanitize: { escapeHtml: true }
    },
    discount: {
        required: true,
        number: true,
        min: 1,
        max: 100
    },
    forNewUser: {
        boolean: true
    },
    forMember: {
        boolean: true
    },
    expiryDate: {
        string: true,
        // Could add date validation
        sanitize: { escapeHtml: true }
    }
};

const addressSchema = {
    name: {
        required: true,
        string: true,
        minLength: 2,
        maxLength: 50,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    phone: {
        required: true,
        phone: true,
        sanitize: { escapeHtml: true }
    },
    street: {
        required: true,
        string: true,
        minLength: 5,
        maxLength: 200,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    city: {
        required: true,
        string: true,
        minLength: 2,
        maxLength: 50,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    state: {
        required: true,
        string: true,
        minLength: 2,
        maxLength: 50,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    zipCode: {
        required: true,
        string: true,
        minLength: 3,
        maxLength: 10,
        sanitize: { escapeHtml: true }
    },
    country: {
        required: true,
        string: true,
        minLength: 2,
        maxLength: 50,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    }
};

const ratingSchema = {
    orderId: {
        required: true,
        string: true,
        uuid: true,
        sanitize: { escapeHtml: true }
    },
    productId: {
        required: true,
        string: true,
        uuid: true,
        sanitize: { escapeHtml: true }
    },
    rating: {
        required: true,
        number: true,
        min: 1,
        max: 5
    },
    review: {
        string: true,
        maxLength: 500,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    }
};

const returnRequestSchema = {
    orderId: {
        required: true,
        string: true,
        uuid: true,
        sanitize: { escapeHtml: true }
    },
    reason: {
        required: true,
        string: true,
        minLength: 10,
        maxLength: 300,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    description: {
        string: true,
        maxLength: 500,
        sanitize: { escapeHtml: true, sanitizeHtml: true }
    },
    images: {
        array: true,
        sanitize: { escapeHtml: true } // Assuming array of strings
    }
};

const schemas = {
    order: orderSchema,
    storeCreate: storeCreateSchema,
    productCreate: productCreateSchema,
    coupon: couponSchema,
    address: addressSchema,
    rating: ratingSchema,
    returnRequest: returnRequestSchema,
};

export default schemas;