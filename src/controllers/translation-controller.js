/**
 * Translation controller
 * Orchestrates translation operations between services and UI
 */
class TranslationController {
    /**
     * @param {Object} config - API configuration
     */
    constructor(config) {
        this.config = config;
        this.phoneticService = new PhoneticService();
        this.translationFactory = new TranslationFactory(this.phoneticService, config);
        this.speechService = new SpeechService();
    }

    /**
     * Update configuration
     * @param {Object} config
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.translationFactory.updateConfig(this.config);
    }

    /**
     * Translate text
     * @param {string} text
     * @param {string} sourceLang
     * @param {string} targetLang
     * @param {string} serviceId
     * @param {string} [uiLanguage]
     * @returns {Promise<TranslationResult>}
     */
    async translate(text, sourceLang, targetLang, serviceId, uiLanguage = 'en') {
        try {
            const translator = this.translationFactory.getTranslator(serviceId);
            const result = await translator.translate(text, sourceLang, targetLang, uiLanguage);
            return result;
        } catch (error) {
            return this.handleError(error, text, sourceLang, targetLang, serviceId, uiLanguage);
        }
    }

    /**
     * Handle translation errors with fallback
     * @private
     */
    async handleError(error, text, sourceLang, targetLang, serviceId, uiLanguage = 'en') {
        console.error('Translation error:', error);

        const errorInfo = ErrorHandler.handleTranslationError(error, serviceId);

        // Don't fallback for API key errors
        if (!errorInfo.shouldFallback) {
            throw error;
        }

        // Fallback to Google Translate
        try {
            const googleTranslator = this.translationFactory.getTranslator('google');
            const result = await googleTranslator.translate(text, sourceLang, targetLang, uiLanguage);

            // Localize fallback notice
            const strings = LOCALES[uiLanguage] || LOCALES.en;
            result.fallbackNotice = strings.fallbackNotice.replace('{error}', error.message);

            return result;
        } catch (fallbackError) {
            throw new Error('All translation services failed');
        }
    }

    /**
     * Speak text
     * @param {string} text
     * @param {string} lang
     */
    speak(text, lang) {
        this.speechService.speak(text, lang);
    }

    /**
     * Stop speech
     */
    stopSpeech() {
        this.speechService.stop();
    }
}
