/**
 * @typedef {Object} TranslationResult
 * @property {string} translation - Translated text
 * @property {string} [srcPhonetic] - Source text phonetic
 * @property {string} [targetPhonetic] - Translation phonetic
 * @property {string} [detectedLang] - Detected source language
 * @property {string} [fallbackNotice] - Fallback notice message
 */

/**
 * Base class for all translation services
 * Provides common functionality and enforces interface
 * @abstract
 */
class BaseTranslator {
    /**
     * @param {PhoneticService} phoneticService
     */
    constructor(phoneticService) {
        if (new.target === BaseTranslator) {
            throw new Error('BaseTranslator is abstract and cannot be instantiated');
        }
        this.phoneticService = phoneticService;
    }

    /**
     * Translate text from source to target language
     * @param {string} text - Text to translate
     * @param {string} sourceLang - Source language code
     * @param {string} targetLang - Target language code
     * @returns {Promise<TranslationResult>}
     * @abstract
     */
    async translate(text, sourceLang, targetLang) {
        throw new Error('translate() must be implemented by subclass');
    }

    /**
     * Enrich translation result with phonetics if not provided
     * @param {TranslationResult} result
     * @param {string} sourceText
     * @param {string} sourceLang
     * @param {string} targetLang
     * @returns {Promise<TranslationResult>}
     * @protected
     */
    async enrichWithPhonetics(result, sourceText, sourceLang, targetLang) {
        const actualSourceLang = result.detectedLang || sourceLang;

        // Strip phonetics for Vietnamese (per user request)
        if (actualSourceLang === 'vi') {
            result.srcPhonetic = null;
        }
        if (targetLang === 'vi') {
            result.targetPhonetic = null;
        }

        // Get source phonetic if not provided and language is English
        if (!result.srcPhonetic && actualSourceLang === 'en') {
            result.srcPhonetic = await this.phoneticService.getPhonetic(sourceText, 'en');
        }

        // Get target phonetic if not provided and language is English
        if (!result.targetPhonetic && targetLang === 'en') {
            result.targetPhonetic = await this.phoneticService.getPhonetic(result.translation, 'en');
        }

        return result;
    }

    /**
     * Validate translation parameters
     * @param {string} text
     * @param {string} sourceLang
     * @param {string} targetLang
     * @throws {Error} If parameters are invalid
     * @protected
     */
    validateParams(text, sourceLang, targetLang) {
        if (!text || typeof text !== 'string') {
            throw new Error('Text must be a non-empty string');
        }
        if (!sourceLang || !targetLang) {
            throw new Error('Source and target languages are required');
        }
    }
}
