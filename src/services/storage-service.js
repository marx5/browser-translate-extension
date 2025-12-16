/**
 * Service for Chrome storage operations
 * Wraps chrome.storage.sync API
 */
class StorageService {
    /**
     * Get all settings
     * @returns {Promise<Object>}
     */
    static async getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['sourceLang', 'targetLang', 'translationService', 'geminiApiKey', 'openaiApiKey'], (result) => {
                resolve({
                    sourceLang: result.sourceLang || 'auto',
                    targetLang: result.targetLang || 'vi',
                    translationService: result.translationService || 'google',
                    geminiApiKey: result.geminiApiKey || '',
                    openaiApiKey: result.openaiApiKey || ''
                });
            });
        });
    }

    /**
     * Save all settings
     * @param {Object} settings
     * @returns {Promise<void>}
     */
    static async saveSettings(settings) {
        return new Promise((resolve) => {
            chrome.storage.sync.set(settings, () => {
                resolve();
            });
        });
    }

    /**
     * Get a single setting
     * @param {string} key
     * @returns {Promise<any>}
     */
    static async getSetting(key) {
        return new Promise((resolve) => {
            chrome.storage.sync.get([key], (result) => {
                resolve(result[key]);
            });
        });
    }

    /**
     * Save a single setting
     * @param {string} key
     * @param {any} value
     * @returns {Promise<void>}
     */
    static async saveSetting(key, value) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ [key]: value }, () => {
                resolve();
            });
        });
    }
}
