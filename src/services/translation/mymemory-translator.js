/**
 * MyMemory translation implementation
 * Free translation service
 */
class MyMemoryTranslator extends BaseTranslator {
    /**
     * @param {PhoneticService} phoneticService
     */
    constructor(phoneticService) {
        super(phoneticService);
        this.apiUrl = 'https://api.mymemory.translated.net/get';
    }

    /**
     * Translate using MyMemory API
     * @param {string} text
     * @param {string} sourceLang
     * @param {string} targetLang
     * @returns {Promise<TranslationResult>}
     */
    async translate(text, sourceLang, targetLang, uiLanguage = 'en') {
        this.validateParams(text, sourceLang, targetLang);

        const actualSourceLang = sourceLang === 'auto' ? 'en' : sourceLang;
        const langPair = `${actualSourceLang}|${targetLang}`;
        const url = `${this.apiUrl}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`MyMemory API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.responseStatus !== 200) {
                // MyMemory puts error in responseDetails sometimes
                throw new Error(data.responseDetails || 'Translation failed');
            }

            const translation = data.responseData.translatedText;
            const detectedLang = actualSourceLang;

            const result = { translation, srcPhonetic: '', targetPhonetic: '', detectedLang };
            return this.enrichWithPhonetics(result, text, actualSourceLang, targetLang);
        } catch (error) {
            const strings = LOCALES[uiLanguage] || LOCALES.en;
            // Map MyMemory errors if specific patterns found, or use general
            if (error.message.startsWith('❌') || error.message.startsWith('⏱️') || error.message.startsWith('📊') || error.message.startsWith('🔒') || error.message.startsWith('🔧') || error.message.startsWith('🔑') || error.message.startsWith('🌐')) {
                throw error; // Already localized
            }
            // Basic mapping
            if (error.message.includes('Quota') || error.message.includes('limit')) {
                throw new Error(strings.errors.quotaExceeded);
            }
            if (error.message.includes('Invalid')) {
                throw new Error(`${strings.service.mymemory} error: ${strings.errors.unknown}`);
            }

            throw new Error(`${strings.service.mymemory} error: ${error.message}`);
        }
    }
}
