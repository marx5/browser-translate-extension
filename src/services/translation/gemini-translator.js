/**
 * Gemini AI translation implementation
 * Requires API key from Google AI Studio
 */
class GeminiTranslator extends BaseTranslator {
    /**
     * @param {PhoneticService} phoneticService
     * @param {string} apiKey
     */
    constructor(phoneticService, apiKey) {
        super(phoneticService);
        this.apiKey = apiKey;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
    }

    /**
     * Translate using Gemini AI
     * @param {string} text
     * @param {string} sourceLang
     * @param {string} targetLang
     * @param {string} [uiLanguage]
     * @returns {Promise<TranslationResult>}
     */
    async translate(text, sourceLang, targetLang, uiLanguage = 'en') {
        this.validateParams(text, sourceLang, targetLang);

        const sourceLangName = this.getLanguageName(sourceLang);
        const targetLangName = this.getLanguageName(targetLang);
        const prompt = this.buildPrompt(text, sourceLangName, targetLangName);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                throw await this.handleApiError(response, uiLanguage);
            }

            const data = await response.json();
            const result = this.parseResponse(data, sourceLang);

            return this.enrichWithPhonetics(result, text, sourceLang, targetLang);
        } catch (error) {
            // Re-throw API key errors
            if (this.isApiKeyError(error)) {
                throw error;
            }
            // For other errors, throw with context
            const strings = LOCALES[uiLanguage] || LOCALES.en;
            if (error.message.startsWith('❌') || error.message.startsWith('⏱️') || error.message.startsWith('📊') || error.message.startsWith('🔒') || error.message.startsWith('🔧') || error.message.startsWith('🔑') || error.message.startsWith('🌐')) {
                throw error; // Already localized
            }
            throw new Error(`${strings.service.gemini} error: ${error.message}`);
        }
    }

    // ... (buildPrompt and parseResponse remain unchanged)

    /**
     * Handle API errors
     * @private
     */
    async handleApiError(response, uiLanguage) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || '';
        const strings = LOCALES[uiLanguage || 'en']?.errors || LOCALES.en.errors;

        if (response.status === 400) {
            if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
                return new Error(strings.apiKeyInvalid);
            }
            return new Error(`${strings.unknown}: ${errorMessage || 'Bad Request'}`);
        } else if (response.status === 429) {
            return new Error(strings.rateLimit);
        } else if (response.status === 403) {
            if (errorMessage.includes('quota') || errorMessage.includes('QUOTA_EXCEEDED')) {
                return new Error(strings.quotaExceeded);
            }
            return new Error(strings.forbidden);
        } else if (response.status === 401) {
            return new Error(strings.apiKeyInvalid);
        } else if (response.status >= 500) {
            return new Error(strings.serverError);
        }

        return new Error(`${strings.unknown} (${response.status}): ${errorMessage || response.statusText}`);
    }

    /**
     * Check if error is API key related
     * @private
     */
    isApiKeyError(error) {
        const message = error.message.toLowerCase();
        return message.includes('api key') ||
            message.includes('quota') ||
            message.includes('không hợp lệ') ||
            message.includes('không được xác thực');
    }

    /**
     * Get language name from code
     * @private
     */
    getLanguageName(code) {
        const langNames = {
            'auto': 'the source language',
            'en': 'English',
            'vi': 'Vietnamese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh-CN': 'Chinese',
            'fr': 'French',
            'es': 'Spanish',
            'de': 'German',
            'ru': 'Russian'
        };
        return langNames[code] || code;
    }
}
