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
            chrome.storage.sync.get(['sourceLang', 'targetLang', 'translationService', 'openaiApiKey', 'geminiProxyUrl'], (result) => {
                resolve({
                    sourceLang: result.sourceLang || 'auto',
                    targetLang: result.targetLang || 'vi',
                    translationService: result.translationService || 'google',
                    openaiApiKey: result.openaiApiKey || '',
                    geminiProxyUrl: result.geminiProxyUrl || 'http://localhost:8045/v1/chat/completions'
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

    // Translation History Methods (using chrome.storage.local for larger storage)
    static MAX_HISTORY_ITEMS = 50;

    /**
     * Get translation history
     * @returns {Promise<Array>}
     */
    static async getHistory() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['translationHistory'], (result) => {
                resolve(result.translationHistory || []);
            });
        });
    }

    /**
     * Add translation to history
     * @param {Object} item - {source, translation, sourceLang, targetLang, service, timestamp}
     * @returns {Promise<void>}
     */
    static async addToHistory(item) {
        const history = await this.getHistory();
        
        // Add timestamp if not present
        item.timestamp = item.timestamp || Date.now();
        item.id = item.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Add to beginning of array
        history.unshift(item);
        
        // Limit to max items
        if (history.length > this.MAX_HISTORY_ITEMS) {
            history.splice(this.MAX_HISTORY_ITEMS);
        }
        
        return new Promise((resolve) => {
            chrome.storage.local.set({ translationHistory: history }, () => {
                resolve();
            });
        });
    }

    /**
     * Delete a history item by ID
     * @param {string} id
     * @returns {Promise<void>}
     */
    static async deleteHistoryItem(id) {
        const history = await this.getHistory();
        const filtered = history.filter(item => item.id !== id);
        
        return new Promise((resolve) => {
            chrome.storage.local.set({ translationHistory: filtered }, () => {
                resolve();
            });
        });
    }

    /**
     * Clear all history
     * @returns {Promise<void>}
     */
    static async clearHistory() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ translationHistory: [] }, () => {
                resolve();
            });
        });
    }
}
