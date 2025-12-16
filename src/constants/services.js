/**
 * @typedef {Object} TranslationService
 * @property {string} id - Service identifier
 * @property {string} name - Display name
 * @property {boolean} requiresApiKey - Whether API key is required
 * @property {string} [apiKeyName] - Config key name for API key
 */

/**
 * Available translation services
 * @type {Object.<string, TranslationService>}
 */
const TRANSLATION_SERVICES = {
    GOOGLE: {
        id: 'google',
        name: 'Google Translate',
        requiresApiKey: false
    },
    GEMINI: {
        id: 'gemini',
        name: 'Gemini AI',
        requiresApiKey: true,
        apiKeyName: 'GEMINI_API_KEY'
    },
    OPENAI: {
        id: 'openai',
        name: 'OpenAI',
        requiresApiKey: true,
        apiKeyName: 'OPENAI_API_KEY'
    },
    MYMEMORY: {
        id: 'mymemory',
        name: 'MyMemory',
        requiresApiKey: false
    }
};

/**
 * Get service configuration by ID
 * @param {string} serviceId
 * @returns {TranslationService|null}
 */
function getServiceById(serviceId) {
    return Object.values(TRANSLATION_SERVICES).find(s => s.id === serviceId) || null;
}

/**
 * Get all available services
 * @returns {TranslationService[]}
 */
function getAllServices() {
    return Object.values(TRANSLATION_SERVICES);
}
