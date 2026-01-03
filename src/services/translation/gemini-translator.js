/**
 * Gemini AI translation implementation (via API Proxy)
 * Uses Antigravity Tools API Proxy at localhost:8045 (no auth required)
 */
class GeminiTranslator extends BaseTranslator {
    /**
     * @param {PhoneticService} phoneticService
     */
    constructor(phoneticService) {
        super(phoneticService);
        this.apiUrl = 'http://localhost:8045/v1/chat/completions';
        this.model = 'gemini-2.5-flash-lite';
    }

    /**
     * Translate using Gemini AI via API Proxy
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
            // Use background script to bypass CORS for localhost
            const proxyResponse = await this.proxyFetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (proxyResponse.error) {
                throw await this.handleProxyError(proxyResponse);
            }

            const result = this.parseResponse(proxyResponse.data, sourceLang);

            return this.enrichWithPhonetics(result, text, sourceLang, targetLang);
        } catch (error) {
            if (this.isApiKeyError(error)) {
                throw error;
            }
            throw new Error(`Gemini AI error: ${error.message}`);
        }
    }

    /**
     * Proxy fetch through background script to bypass CORS
     * @private
     */
    proxyFetch(url, options) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(
                { action: 'proxyFetch', url, options },
                (response) => {
                    if (chrome.runtime.lastError) {
                        resolve({ error: true, message: chrome.runtime.lastError.message });
                    } else {
                        resolve(response);
                    }
                }
            );
        });
    }

    /**
     * Handle proxy error response
     * @private
     */
    handleProxyError(proxyResponse) {
        if (proxyResponse.message) {
            return new Error(proxyResponse.message);
        }
        
        const status = proxyResponse.status;
        const errorData = proxyResponse.data || {};
        const errorMessage = errorData.error?.message || '';

        if (status === 400) {
            if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
                return new Error('Gemini API key không hợp lệ. Vui lòng kiểm tra lại key trong Tab Settings');
            }
            return new Error(`Gemini API lỗi: ${errorMessage || 'Yêu cầu không hợp lệ'}`);
        } else if (status === 429) {
            return new Error('Gemini API: Đã vượt quá giới hạn số lượt gọi. Vui lòng thử lại sau.');
        } else if (status === 403) {
            return new Error('Gemini API: Không có quyền truy cập. Vui lòng kiểm tra API key.');
        } else if (status === 401) {
            return new Error('Gemini API: API key không được xác thực. Vui lòng kiểm tra lại.');
        } else if (status >= 500) {
            return new Error('Gemini API: Lỗi máy chủ. Vui lòng thử lại sau.');
        }

        return new Error(`Gemini API lỗi (${status}): ${errorMessage}`);
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
     * Parse API Proxy response (Gemini format wrapped in response object)
     * @private
     */
    parseResponse(data, sourceLang) {
        let responseText = data.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        responseText = responseText.trim();

        let translation = '';
        let srcPhonetic = '';
        let targetPhonetic = '';

        try {
            responseText = responseText.replace(/```json\s*|\s*```/g, '');
            const parsed = JSON.parse(responseText);
            translation = parsed.translation || '';
            srcPhonetic = parsed.sourcePhonetic || '';
            targetPhonetic = parsed.targetPhonetic || '';
        } catch (e) {
            translation = responseText;
        }

        const detectedLang = sourceLang === 'auto' ? 'en' : sourceLang;
        return { translation, srcPhonetic, targetPhonetic, detectedLang };
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
