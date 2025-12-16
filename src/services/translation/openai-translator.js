/**
 * OpenAI translation implementation
 * Uses GPT-4o-mini model
 */
class OpenAITranslator extends BaseTranslator {
    /**
     * @param {PhoneticService} phoneticService
     * @param {string} apiKey
     */
    constructor(phoneticService, apiKey) {
        super(phoneticService);
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-4o-mini';
    }

    /**
     * Translate using OpenAI
     * @param {string} text
     * @param {string} sourceLang
     * @param {string} targetLang
     * @param {string} [uiLanguage]
     * @returns {Promise<TranslationResult>}
     */
    async translate(text, sourceLang, targetLang, uiLanguage = 'en') {
        this.validateParams(text, sourceLang, targetLang);

        const strings = LOCALES[uiLanguage || 'en'] || LOCALES.en;

        if (!this.apiKey || this.apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
            throw new Error(strings.errors.apiKeyMissing);
        }

        const sourceLangName = this.getLanguageName(sourceLang);
        const targetLangName = this.getLanguageName(targetLang);
        const prompt = this.buildPrompt(text, sourceLangName, targetLangName);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw await this.handleApiError(response, uiLanguage);
            }

            const data = await response.json();
            const result = this.parseResponse(data, sourceLang);

            return this.enrichWithPhonetics(result, text, sourceLang, targetLang);
        } catch (error) {
            // Re-throw API key/quota errors
            if (this.isApiKeyError(error)) {
                throw error;
            }
            if (error.message.startsWith('❌') || error.message.startsWith('⏱️') || error.message.startsWith('📊') || error.message.startsWith('🔒') || error.message.startsWith('🔧') || error.message.startsWith('🔑') || error.message.startsWith('🌐')) {
                throw error; // Already localized
            }
            throw new Error(`${strings.service.openai} error: ${error.message}`);
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
        const errorType = errorData.error?.type || '';
        const errorCode = errorData.error?.code || '';

        const strings = LOCALES[uiLanguage || 'en']?.errors || LOCALES.en.errors;

        if (response.status === 401) {
            if (errorMessage.includes('Incorrect API key') || errorCode === 'invalid_api_key') {
                return new Error(strings.apiKeyInvalid);
            }
            return new Error(strings.apiKeyInvalid);
        } else if (response.status === 429) {
            if (errorMessage.includes('quota') || errorType === 'insufficient_quota') {
                return new Error(strings.quotaExceeded);
            }
            if (errorMessage.includes('Rate limit')) {
                return new Error(strings.rateLimit);
            }
            return new Error(strings.rateLimit);
        } else if (response.status === 403) {
            return new Error(strings.forbidden);
        } else if (response.status === 400) {
            return new Error(`${strings.unknown}: ${errorMessage || 'Bad Request'}`);
        } else if (response.status >= 500) {
            return new Error(strings.serverError);
        }

        return new Error(`${strings.unknown} (${response.status}): ${errorMessage || response.statusText}`);
    }

    /**
     * Check if error is API key/quota related
     * @private
     */
    isApiKeyError(error) {
        const message = error.message.toLowerCase();
        return message.includes('api key') ||
            message.includes('quota') ||
            message.includes('credits') ||
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
