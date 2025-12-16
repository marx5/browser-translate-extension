/**
 * Google Translate implementation
 * Uses unofficial Google Translate API
 */
class GoogleTranslator extends BaseTranslator {
    /**
     * @param {PhoneticService} phoneticService
     */
    constructor(phoneticService) {
        super(phoneticService);
        this.baseUrl = 'https://translate.googleapis.com/translate_a/single';
    }

    /**
     * Translate using Google Translate API
     * @param {string} text
     * @param {string} sourceLang
     * @param {string} targetLang
     * @returns {Promise<TranslationResult>}
     */
    async translate(text, sourceLang, targetLang) {
        this.validateParams(text, sourceLang, targetLang);

        const url = this.buildUrl(text, sourceLang, targetLang);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Google Translate API error: ${response.status}`);
        }

        const data = await response.json();
        const result = this.parseResponse(data, sourceLang);

        return this.enrichWithPhonetics(result, text, sourceLang, targetLang);
    }

    /**
     * Build API URL
     * @private
     */
    buildUrl(text, sourceLang, targetLang) {
        const params = new URLSearchParams({
            client: 'gtx',
            sl: sourceLang,
            tl: targetLang,
            dt: 't',
            q: text
        });
        // Add dt=rm for phonetics
        return `${this.baseUrl}?${params}&dt=rm`;
    }

    /**
     * Parse Google Translate response
     * @private
     */
    parseResponse(data, sourceLang) {
        let translation = '';
        let targetPhonetic = '';
        let srcPhonetic = '';
        let detectedLang = sourceLang;

        // Extract detected language
        if (sourceLang === 'auto' && data[2]) {
            detectedLang = data[2];
        }

        // Extract translation and phonetics
        if (data[0]) {
            // Build translation from segments
            data[0].forEach(segment => {
                if (segment && segment[0]) {
                    translation += segment[0];
                }
            });

            // Extract phonetics from segments
            for (let segment of data[0]) {
                if (segment && Array.isArray(segment)) {
                    if (segment[3] && typeof segment[3] === 'string' && !srcPhonetic) {
                        srcPhonetic = segment[3];
                    }
                    if (segment[2] && typeof segment[2] === 'string' && !targetPhonetic) {
                        targetPhonetic = segment[2];
                    }
                }
            }
        }

        return { translation, srcPhonetic, targetPhonetic, detectedLang };
    }
}
