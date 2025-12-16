/**
 * @typedef {Object} Language
 * @property {string} code - Language code (e.g., 'en', 'vi')
 * @property {string} name - Display name (e.g., 'English')
 */

/**
 * Supported languages configuration
 * @type {Object.<string, Language>}
 */
const LANGUAGES = {
    AUTO: { code: 'auto', name: 'Auto Detect' },
    EN: { code: 'en', name: 'English' },
    VI: { code: 'vi', name: 'Vietnamese' },
    JA: { code: 'ja', name: 'Japanese' },
    KO: { code: 'ko', name: 'Korean' },
    ZH_CN: { code: 'zh-CN', name: 'Chinese' },
    FR: { code: 'fr', name: 'French' },
    ES: { code: 'es', name: 'Spanish' },
    DE: { code: 'de', name: 'German' },
    RU: { code: 'ru', name: 'Russian' }
};

/**
 * Map of language codes to names
 * @type {Object.<string, string>}
 */
const LANGUAGE_MAP = Object.values(LANGUAGES).reduce((acc, lang) => {
    acc[lang.code] = lang.name;
    return acc;
}, {});

/**
 * Get language name by code
 * @param {string} code
 * @returns {string}
 */
function getLanguageName(code) {
    return LANGUAGE_MAP[code] || code;
}

/**
 * Get all source languages (including auto-detect)
 * @returns {Language[]}
 */
function getSourceLanguages() {
    return Object.values(LANGUAGES);
}

/**
 * Get all target languages (excluding auto-detect)
 * @returns {Language[]}
 */
function getTargetLanguages() {
    return Object.values(LANGUAGES).filter(lang => lang.code !== 'auto');
}
