import validationUtils from '@/lib/validationUtils';
import { NextResponse } from 'next/server';

/**
 * Centralized validation middleware for API routes
 * Validates and sanitizes request data based on provided schema
 */
export const validateRequest = (schema) => {
    return async (request) => {
        try {
            // Parse request body
            let body;
            try {
                body = await request.json();
            } catch (error) {
                return NextResponse.json({
                    error: 'Invalid JSON payload',
                    message: 'Request body must be valid JSON'
                }, { status: 400 });
            }

            // Validate against schema
            const validation = validationUtils.validateObject(body, schema);

            if (!validation.isValid) {
                // Format errors for clear response
                const formattedErrors = {};
                for (const [field, errors] of Object.entries(validation.errors)) {
                    formattedErrors[field] = errors.join(', ');
                }

                return NextResponse.json({
                    error: 'Validation failed',
                    details: formattedErrors,
                    message: 'Please check your input data and try again'
                }, { status: 400 });
            }

            // Return sanitized data
            return {
                success: true,
                data: validation.sanitized,
                originalRequest: request
            };

        } catch (error) {
            console.error('Validation middleware error:', error);
            return NextResponse.json({
                error: 'Validation processing failed',
                message: 'An error occurred while validating your request'
            }, { status: 500 });
        }
    };
};

/**
 * Middleware for form data validation
 */
export const validateFormData = (schema) => {
    return async (request) => {
        try {
            const formData = await request.formData();
            const body = {};

            // Convert FormData to object
            for (const [key, value] of formData.entries()) {
                body[key] = value;
            }

            // Validate against schema
            const validation = validationUtils.validateObject(body, schema);

            if (!validation.isValid) {
                const formattedErrors = {};
                for (const [field, errors] of Object.entries(validation.errors)) {
                    formattedErrors[field] = errors.join(', ');
                }

                return NextResponse.json({
                    error: 'Validation failed',
                    details: formattedErrors,
                    message: 'Please check your form data and try again'
                }, { status: 400 });
            }

            // Return sanitized data
            return {
                success: true,
                data: validation.sanitized,
                originalRequest: request
            };

        } catch (error) {
            console.error('Form validation middleware error:', error);
            return NextResponse.json({
                error: 'Form validation processing failed',
                message: 'An error occurred while validating your form'
            }, { status: 500 });
        }
    };
};

/**
 * Combined middleware that handles both JSON and FormData
 */
export const validateInput = (schema, isFormData = false) => {
    if (isFormData) {
        return validateFormData(schema);
    }
    return validateRequest(schema);
};

export default {
    validateRequest,
    validateFormData,
    validateInput,
};