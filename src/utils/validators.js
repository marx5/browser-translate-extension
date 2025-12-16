/**
 * Validation utilities
 */
class Validators {
    /**
     * Validate text for translation
     * @param {string} text
     * @returns {boolean}
     */
    static isValidText(text) {
        return typeof text === 'string' && text.trim().length > 0;
    }

    /**
     * Validate language code
     * @param {string} code
     * @returns {boolean}
     */
    static isValidLanguageCode(code) {
        if (!code) return false;
        // Check against known languages
        return getSourceLanguages().some(l => l.code === code) ||
            getTargetLanguages().some(l => l.code === code);
    }

    /**
     * Validate API key format (basic check)
     * @param {string} key
     * @returns {boolean}
     */
    static isValidApiKey(key) {
        return typeof key === 'string' && key.length > 10;
    }
}
