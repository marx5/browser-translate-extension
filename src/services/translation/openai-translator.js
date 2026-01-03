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
     * @returns {Promise<TranslationResult>}
     */
    async translate(text, sourceLang, targetLang) {
        this.validateParams(text, sourceLang, targetLang);

        if (!this.apiKey || this.apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
            throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
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
                throw await this.handleApiError(response);
            }

            const data = await response.json();
            const result = this.parseResponse(data, sourceLang);

            return this.enrichWithPhonetics(result, text, sourceLang, targetLang);
        } catch (error) {
            // Re-throw API key/quota errors
            if (this.isApiKeyError(error)) {
                throw error;
            }
            throw new Error(`OpenAI error: ${error.message}`);
        }
    }

    /**
     * Build translation prompt
     * @private
     */
    buildPrompt(text, sourceLangName, targetLangName) {
        return `You are an expert translator with deep understanding of languages, cultures, and context. Your task is to translate from ${sourceLangName} to ${targetLangName}.

Text to translate:
"""
${text}
"""

SMART TRANSLATION RULES:
1. AUTO-DETECT the type of content and translate accordingly:
   - Single word/phrase: Provide the most common translation + brief meaning if helpful
   - Sentence: Natural, fluent translation preserving tone and intent
   - Paragraph/long text: Maintain flow, coherence, and original style
   - Slang/informal: Use equivalent casual expressions in target language
   - Technical terms: Keep accuracy, add brief explanation if ambiguous
   - Idioms/proverbs: Translate meaning, not literal words

2. PRESERVE the original:
   - Tone (formal/informal/humorous/serious)
   - Emotion and nuance
   - Line breaks and formatting
   - Names, brands, technical terms when appropriate

3. PRIORITIZE:
   - Natural-sounding translation over literal accuracy
   - Cultural adaptation when needed
   - Clarity and readability

RESPONSE FORMAT (JSON only):
{
  "translation": "your translation here",
  "sourcePhonetic": "IPA or romanization of source",
  "targetPhonetic": "IPA or romanization of translation"
}

Only respond with the JSON, no explanation.`;
    }

    /**
     * Parse OpenAI response
     * @private
     */
    parseResponse(data, sourceLang) {
        let responseText = data.choices[0]?.message?.content || '';
        responseText = responseText.trim();

        let translation = '';
        let srcPhonetic = '';
        let targetPhonetic = '';

        try {
            // Remove markdown code blocks if present
            responseText = responseText.replace(/```json\s*|\s*```/g, '');
            const parsed = JSON.parse(responseText);
            translation = parsed.translation || '';
            // Normalize Unicode to fix combining diacritics (pinyin tones)
            srcPhonetic = (parsed.sourcePhonetic || '').normalize('NFC');
            targetPhonetic = (parsed.targetPhonetic || '').normalize('NFC');
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
        const errorType = errorData.error?.type || '';
        const errorCode = errorData.error?.code || '';

        if (response.status === 401) {
            if (errorMessage.includes('Incorrect API key') || errorCode === 'invalid_api_key') {
                return new Error('❌ OpenAI API key không hợp lệ. Vui lòng kiểm tra lại key trong Tab Settings');
            }
            return new Error('🔑 OpenAI API: API key không được xác thực. Vui lòng kiểm tra lại trong Settings.');
        } else if (response.status === 429) {
            if (errorMessage.includes('quota') || errorType === 'insufficient_quota') {
                return new Error('📊 OpenAI API: Đã hết quota/credits. Vui lòng nạp thêm credits hoặc chọn dịch vụ khác.');
            }
            if (errorMessage.includes('Rate limit')) {
                return new Error('⏱️ OpenAI API: Đã vượt quá giới hạn số lượt gọi. Vui lòng thử lại sau vài giây.');
            }
            return new Error('⏱️ OpenAI API: Quá nhiều yêu cầu. Vui lòng thử lại sau.');
        } else if (response.status === 403) {
            return new Error('🔒 OpenAI API: Không có quyền truy cập. Vui lòng kiểm tra API key và quyền hạn.');
        } else if (response.status === 400) {
            return new Error(`❌ OpenAI API lỗi: ${errorMessage || 'Yêu cầu không hợp lệ'}`);
        } else if (response.status >= 500) {
            return new Error('🔧 OpenAI API: Lỗi máy chủ. Vui lòng thử lại sau.');
        }

        return new Error(`❌ OpenAI API lỗi (${response.status}): ${errorMessage || response.statusText}`);
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
