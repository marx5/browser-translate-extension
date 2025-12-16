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
     * @returns {Promise<TranslationResult>}
     */
    async translate(text, sourceLang, targetLang) {
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
                throw await this.handleApiError(response);
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
            throw new Error(`Gemini AI error: ${error.message}`);
        }
    }

    /**
     * Build translation prompt
     * @private
     */
    buildPrompt(text, sourceLangName, targetLangName) {
        return `You are a professional translator. Translate the following text from ${sourceLangName} to ${targetLangName}.

Text to translate:
"""
${text}
"""

Instructions:
1. Translate ALL text content found within the triple quotes.
2. Preserve existing line breaks and structure.
3. Provide your response in this exact JSON format:
{
  "translation": "the translated text here, preserving line breaks",
  "sourcePhonetic": "phonetic transcription of source text",
  "targetPhonetic": "phonetic transcription of translated text"
}

Only respond with the JSON.`;
    }

    /**
     * Parse Gemini response
     * @private
     */
    parseResponse(data, sourceLang) {
        let responseText = data.candidates[0]?.content?.parts[0]?.text || '';
        responseText = responseText.trim();

        let translation = '';
        let srcPhonetic = '';
        let targetPhonetic = '';

        try {
            // Remove markdown code blocks if present
            responseText = responseText.replace(/```json\s*|\s*```/g, '');
            const parsed = JSON.parse(responseText);
            translation = parsed.translation || '';
            srcPhonetic = parsed.sourcePhonetic || '';
            targetPhonetic = parsed.targetPhonetic || '';
        } catch (e) {
            // If JSON parsing fails, use the whole response as translation
            translation = responseText;
        }

        const detectedLang = sourceLang === 'auto' ? 'en' : sourceLang;
        return { translation, srcPhonetic, targetPhonetic, detectedLang };
    }

    /**
     * Handle API errors
     * @private
     */
    async handleApiError(response) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || '';

        if (response.status === 400) {
            if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
                return new Error('❌ Gemini API key không hợp lệ. Vui lòng kiểm tra lại key trong Tab Settings');
            }
            return new Error(`❌ Gemini API lỗi: ${errorMessage || 'Yêu cầu không hợp lệ'}`);
        } else if (response.status === 429) {
            return new Error('⏱️ Gemini API: Đã vượt quá giới hạn số lượt gọi. Vui lòng thử lại sau hoặc chọn dịch vụ khác.');
        } else if (response.status === 403) {
            if (errorMessage.includes('quota') || errorMessage.includes('QUOTA_EXCEEDED')) {
                return new Error('📊 Gemini API: Đã hết quota miễn phí. Vui lòng chọn dịch vụ khác hoặc nâng cấp tài khoản.');
            }
            return new Error('🔒 Gemini API: Không có quyền truy cập. Vui lòng kiểm tra API key trong Settings.');
        } else if (response.status === 401) {
            return new Error('🔑 Gemini API: API key không được xác thực. Vui lòng kiểm tra lại trong Settings.');
        } else if (response.status >= 500) {
            return new Error('🔧 Gemini API: Lỗi máy chủ. Vui lòng thử lại sau.');
        }

        return new Error(`❌ Gemini API lỗi (${response.status}): ${errorMessage || response.statusText}`);
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
