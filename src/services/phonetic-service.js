/**
 * Service for fetching phonetic transcriptions
 * Uses Dictionary API for English words
 */
class PhoneticService {
    constructor() {
        this.apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
        this.cache = new Map();
    }

    /**
     * Get phonetic transcription for text
     * @param {string} text
     * @param {string} lang
     * @returns {Promise<string>}
     */
    async getPhonetic(text, lang = 'en') {
        if (lang === 'vi') return '';
        try {
            const words = text.trim().split(/\s+/);

            // Handle multi-word phrases (up to 10 words)
            if (words.length > 1 && words.length <= 10) {
                const phonetics = await Promise.all(
                    words.map(word => this.getWordPhonetic(word))
                );
                return phonetics.filter(p => p).join(' ');
            } else if (words.length === 1) {
                return await this.getWordPhonetic(words[0]);
            }
        } catch (error) {
            console.warn('Phonetic fetch failed:', error);
        }
        return '';
    }

    /**
     * Get phonetic for a single word
     * @param {string} word
     * @returns {Promise<string>}
     * @private
     */
    async getWordPhonetic(word) {
        const cleanWord = this.cleanWord(word);
        if (!cleanWord) return '';

        // Check cache
        if (this.cache.has(cleanWord)) {
            return this.cache.get(cleanWord);
        }

        try {
            const url = `${this.apiUrl}/${encodeURIComponent(cleanWord)}`;
            const response = await fetch(url);

            if (!response.ok) return '';

            const data = await response.json();
            const phonetic = this.extractPhonetic(data);

            // Cache result
            this.cache.set(cleanWord, phonetic);

            return phonetic;
        } catch (error) {
            return '';
        }
    }

    /**
     * Clean word from punctuation
     * @private
     */
    cleanWord(word) {
        return word.replace(/[.,!?;:'"()]/g, '').toLowerCase();
    }

    /**
     * Extract phonetic from API response
     * @private
     */
    extractPhonetic(data) {
        if (data[0] && data[0].phonetics) {
            for (let phonetic of data[0].phonetics) {
                if (phonetic.text) {
                    return phonetic.text.replace(/[/\[\]]/g, '');
                }
            }
        }
        return '';
    }

    /**
     * Clear phonetic cache
     */
    clearCache() {
        this.cache.clear();
    }
}
