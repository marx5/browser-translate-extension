/**
 * Factory for creating translator instances
 * Implements Singleton pattern for translator instances
 */
class TranslationFactory {
    /**
     * @param {PhoneticService} phoneticService
     * @param {Object} config - API configuration
     */
    constructor(phoneticService, config) {
        this.phoneticService = phoneticService;
        this.config = config;
        this.translators = new Map();
    }

    /**
     * Get translator instance for specified service
     * @param {string} serviceId
     * @returns {BaseTranslator}
     */
    getTranslator(serviceId) {
        // Return cached instance if exists
        if (this.translators.has(serviceId)) {
            return this.translators.get(serviceId);
        }

        // Create new instance
        const translator = this.createTranslator(serviceId);

        // Cache and return
        this.translators.set(serviceId, translator);
        return translator;
    }

    /**
     * Create translator instance
     * @private
     */
    createTranslator(serviceId) {
        switch (serviceId) {
            case 'google':
                return new GoogleTranslator(this.phoneticService);

            case 'gemini':
                return new GeminiTranslator(
                    this.phoneticService,
                    this.config.GEMINI_PROXY_URL,
                    this.config.GEMINI_API_KEY
                );

            case 'openai':
                return new OpenAITranslator(
                    this.phoneticService,
                    this.config.OPENAI_API_KEY
                );

            default:
                console.warn(`Unknown service: ${serviceId}, falling back to Google`);
                return new GoogleTranslator(this.phoneticService);
        }
    }

    /**
     * Clear cached translators
     */
    clearCache() {
        this.translators.clear();
    }

    /**
     * Update configuration and clear cache
     * @param {Object} config
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.clearCache();
    }
}
