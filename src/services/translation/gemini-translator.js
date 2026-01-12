/**
 * Gemini AI translation implementation (via API Proxy)
 * Uses configurable API Proxy URL (default: localhost:8045)
 */
class GeminiTranslator extends BaseTranslator {
    /**
     * @param {PhoneticService} phoneticService
     * @param {string} apiUrl - API Proxy URL
     * @param {string} apiKey - API Key for authentication
     */
    constructor(phoneticService, apiUrl, apiKey) {
        super(phoneticService);
        this.apiUrl = apiUrl || 'http://localhost:8045/v1/chat/completions';
        this.apiKey = apiKey || '';
        this.model = 'gemini-2.5-flash';  // Changed from gemini-2.5-flash-lite
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
            // Build headers
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Add Authorization header if API key is provided
            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            // Use background script to bypass CORS for localhost
            const proxyResponse = await this.proxyFetch(this.apiUrl, {
                method: 'POST',
                headers,
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

        // Check for auth errors in nested message (proxy may wrap real errors)
        if (errorMessage.includes('401') || 
            errorMessage.includes('UNAUTHENTICATED') || 
            errorMessage.includes('Unauthorized') ||
            errorMessage.includes('authentication credentials')) {
            return new Error('Gemini API: API key không hợp lệ hoặc chưa được cấu hình. Vui lòng kiểm tra API key trong Tab Settings.');
        }

        if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
            return new Error('Gemini API key không hợp lệ. Vui lòng kiểm tra lại key trong Tab Settings.');
        }

        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
            return new Error('Gemini API: Đã vượt quá giới hạn số lượt gọi. Vui lòng thử lại sau.');
        }

        if (status === 400) {
            return new Error(`Gemini API lỗi: ${errorMessage || 'Yêu cầu không hợp lệ'}`);
        } else if (status === 429) {
            return new Error('Gemini API: Đã vượt quá giới hạn số lượt gọi. Vui lòng thử lại sau.');
        } else if (status === 403) {
            return new Error('Gemini API: Không có quyền truy cập. Vui lòng kiểm tra API key.');
        } else if (status === 401) {
            return new Error('Gemini API: API key không được xác thực. Vui lòng kiểm tra lại.');
        } else if (status >= 500) {
            // For 500 errors, show the actual error message if available
            if (errorMessage) {
                return new Error(`Gemini API lỗi: ${errorMessage}`);
            }
            return new Error('Gemini API: Lỗi máy chủ. Vui lòng thử lại sau.');
        }

        return new Error(`Gemini API lỗi (${status}): ${errorMessage}`);
    }

    /**
     * Build translation prompt
     * @private
     */
    buildPrompt(text, sourceLangName, targetLangName) {
        return `You are a professional translator. Translate from ${sourceLangName} to ${targetLangName}.

INPUT:
"""
${text}
"""

RULES:
1. CONTENT-AWARE TRANSLATION:
   • Word/phrase → Most natural translation
   • Sentence → Fluent, preserve tone
   • Paragraph → Maintain flow and style
   • Idioms/slang → Equivalent expression, NOT literal
   • Technical terms → Keep accurate, transliterate if needed

2. PRESERVE: Tone, emotion, formatting, proper nouns

3. PRIORITIZE: Natural over literal, clarity over complexity

PHONETICS:
• For Japanese: Use romaji (e.g., "arigatou")
• For Chinese: Use pinyin with tones (e.g., "nǐ hǎo")
• For Korean: Use romanization (e.g., "annyeonghaseyo")
• For English/European: Use IPA only for difficult words, otherwise leave empty
• For Vietnamese: Leave empty (already uses Latin script)

OUTPUT FORMAT (strict JSON, no markdown):
{"translation":"translated text","sourcePhonetic":"phonetic of source or empty","targetPhonetic":"phonetic of translation or empty"}

EXAMPLE for "ありがとう" (Japanese → Vietnamese):
{"translation":"Cảm ơn","sourcePhonetic":"arigatou","targetPhonetic":""}

Respond ONLY with the JSON object.`;
    }

    /**
     * Parse API Proxy response (Gemini format wrapped in response object)
     * @private
     */
    parseResponse(data, sourceLang) {
        // Support both OpenAI-compatible format (via proxy) and Gemini native format
        let responseText = data.choices?.[0]?.message?.content  // OpenAI format
            || data.response?.candidates?.[0]?.content?.parts?.[0]?.text  // Gemini native
            || '';
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
