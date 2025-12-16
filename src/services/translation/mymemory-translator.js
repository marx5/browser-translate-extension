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
    async translate(text, sourceLang, targetLang) {
        this.validateParams(text, sourceLang, targetLang);

        const actualSourceLang = sourceLang === 'auto' ? 'en' : sourceLang;
        const langPair = `${actualSourceLang}|${targetLang}`;
        const url = `${this.apiUrl}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('MyMemory API error');
        }

        const data = await response.json();
        const translation = data.responseData.translatedText;
        const detectedLang = actualSourceLang;

        const result = { translation, srcPhonetic: '', targetPhonetic: '', detectedLang };
        return this.enrichWithPhonetics(result, text, actualSourceLang, targetLang);
    }
}
