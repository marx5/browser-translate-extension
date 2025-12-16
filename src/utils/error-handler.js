/**
 * Error handling utilities
 */
class ErrorHandler {
    /**
     * Handle translation errors with fallback logic
     * @param {Error} error
     * @param {string} serviceId
     * @returns {Object}
     */
    static handleTranslationError(error, serviceId) {
        const message = error.message || 'Translation failed';

        // Check if it's an API key error (should not fallback)
        if (this.isApiKeyError(error)) {
            return {
                shouldFallback: false,
                errorMessage: message
            };
        }

        // For other errors, suggest fallback
        return {
            shouldFallback: true,
            errorMessage: message,
            fallbackService: 'google'
        };
    }

    /**
     * Check if error is API key related
     * @param {Error} error
     * @returns {boolean}
     */
    static isApiKeyError(error) {
        const message = error.message.toLowerCase();
        return message.includes('api key') ||
            message.includes('quota') ||
            message.includes('credits') ||
            message.includes('không hợp lệ') ||
            message.includes('không được xác thực');
    }

    /**
     * Format error message for display
     * @param {Error} error
     * @returns {string}
     */
    static formatErrorMessage(error) {
        return error.message || 'Translation failed. Please try again.';
    }
}
