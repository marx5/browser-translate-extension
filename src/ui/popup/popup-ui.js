/**
 * Popup UI Controller
 * Orchestrates the UI in the browser action popup
 */
class PopupUI {
    /**
     * @param {TranslationController} translationController
     * @param {Object} settings
     */
    constructor(translationController, settings) {
        this.controller = translationController;
        this.settings = settings;

        // Initialize UI elements
        this.inputText = document.getElementById('inputText');
        this.translateBtn = document.getElementById('translateBtn');
        this.resultArea = document.getElementById('resultArea');
        this.translatedText = document.getElementById('translatedText');
        this.phoneticText = document.getElementById('phoneticText');
        this.sourcePhonetic = document.getElementById('sourcePhonetic');
        this.errorMessage = document.getElementById('errorMessage');

        // Copy buttons
        this.copyTarget = document.getElementById('copyTarget');
        this.copyPhonetic = document.getElementById('copyPhonetic');
        this.copySourcePhonetic = document.getElementById('copySourcePhonetic');

        // Speak buttons
        this.speakSource = document.getElementById('speakSource');
        this.speakTarget = document.getElementById('speakTarget');

        // Clear button
        this.clearBtn = document.getElementById('clearBtn');

        // Phonetic toggle buttons and containers
        this.toggleSourcePhonetic = document.getElementById('toggleSourcePhonetic');
        this.toggleTargetPhonetic = document.getElementById('toggleTargetPhonetic');
        this.sourcePhoneticContainer = document.getElementById('sourcePhoneticContainer');
        this.targetPhoneticContainer = document.getElementById('targetPhoneticContainer');

        // Selectors
        this.sourceLang = document.getElementById('sourceLang');
        this.targetLang = document.getElementById('targetLang');
        this.translationService = document.getElementById('translationService');
        this.swapLangs = document.getElementById('swapLangs');

        // Views
        this.translateView = document.getElementById('translate-view');
        this.settingsView = document.getElementById('settings-view');

        // Navigation
        this.openSettingsBtn = document.getElementById('openSettingsBtn');
        this.backToTranslateBtn = document.getElementById('backToTranslateBtn');

        // Settings elements
        this.openaiApiKey = document.getElementById('openaiApiKey');
        this.geminiProxyUrl = document.getElementById('geminiProxyUrl');
        this.geminiApiKey = document.getElementById('geminiApiKey');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.saveStatus = document.getElementById('saveStatus');

        // History elements
        this.historyView = document.getElementById('history-view');
        this.openHistoryBtn = document.getElementById('openHistoryBtn');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettingsToUI();
        this.getSelectedTextFromPage();
    }

    /**
     * Get selected text from the active tab and auto-translate
     */
    async getSelectedTextFromPage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.id) {
                await this.restoreLastTranslation();
                return;
            }

            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const selection = window.getSelection();
                    if (!selection.rangeCount) return '';
                    
                    const range = selection.getRangeAt(0);
                    const fragment = range.cloneContents();
                    const temp = document.createElement('div');
                    temp.appendChild(fragment);
                    
                    // Replace img with alt text (emoji support)
                    temp.querySelectorAll('img[alt]').forEach(img => {
                        img.replaceWith(img.alt);
                    });
                    
                    return temp.textContent.trim();
                }
            });

            if (results && results[0] && results[0].result) {
                const selectedText = results[0].result;
                this.inputText.value = selectedText;
                this.doTranslate();
            } else {
                // No selected text, restore last translation
                await this.restoreLastTranslation();
            }
        } catch (error) {
            // Ignore errors (e.g., chrome:// pages, permissions)
            console.log('Could not get selected text:', error.message);
            await this.restoreLastTranslation();
        }
    }

    /**
     * Restore last translation from storage
     */
    async restoreLastTranslation() {
        try {
            const data = await chrome.storage.local.get(['lastInput', 'lastResult']);
            if (data.lastInput) {
                this.inputText.value = data.lastInput;
            }
            if (data.lastResult) {
                this.displayResult(data.lastResult);
            }
        } catch (error) {
            console.log('Could not restore last translation:', error.message);
        }
    }

    /**
     * Save last translation to storage
     */
    async saveLastTranslation(inputText, result) {
        try {
            await chrome.storage.local.set({
                lastInput: inputText,
                lastResult: result
            });
        } catch (error) {
            console.log('Could not save translation:', error.message);
        }
    }

    bindEvents() {
        // View switching
        this.openSettingsBtn.addEventListener('click', () => {
            const isSettingsActive = this.settingsView.classList.contains('active');

            if (isSettingsActive) {
                // Close settings (back to translate)
                this.settingsView.classList.add('hidden');
                this.settingsView.classList.remove('active');

                this.translateView.classList.remove('hidden');
                this.translateView.classList.add('active');
                document.body.classList.remove('settings-mode');

                // Revert button to Settings
                this.openSettingsBtn.textContent = '⚙️';
                this.openSettingsBtn.title = 'Settings';
            } else {
                // Open settings
                this.translateView.classList.add('hidden');
                this.translateView.classList.remove('active');

                this.settingsView.classList.remove('hidden');
                this.settingsView.classList.add('active');
                document.body.classList.add('settings-mode');

                // Change button to Home
                this.openSettingsBtn.textContent = '🏠';
                this.openSettingsBtn.title = 'Home';

                // Re-load settings just in case
                this.loadSettingsToUI();
            }
        });

        this.backToTranslateBtn.addEventListener('click', () => {
            this.settingsView.classList.add('hidden');
            this.settingsView.classList.remove('active');
            this.historyView.classList.add('hidden');

            this.translateView.classList.remove('hidden');
            this.translateView.classList.add('active');
            document.body.classList.remove('settings-mode');

            // Revert button to Settings
            this.openSettingsBtn.textContent = '⚙️';
            this.openSettingsBtn.title = 'Settings';
        });

        // History toggle
        this.openHistoryBtn.addEventListener('click', () => {
            const isHistoryActive = !this.historyView.classList.contains('hidden');

            if (isHistoryActive) {
                // Close history (back to translate)
                this.historyView.classList.add('hidden');
                this.translateView.classList.remove('hidden');
                document.body.classList.remove('settings-mode');
            } else {
                // Open history
                this.translateView.classList.add('hidden');
                this.settingsView.classList.add('hidden');
                this.historyView.classList.remove('hidden');
                document.body.classList.add('settings-mode');
                this.loadHistory();
            }
        });

        // Clear history
        this.clearHistoryBtn.addEventListener('click', async () => {
            if (confirm('Clear all translation history?')) {
                await StorageService.clearHistory();
                this.loadHistory();
            }
        });

        // Save Settings
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // Translation trigger
        this.translateBtn.addEventListener('click', () => this.doTranslate());

        this.inputText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.ctrlKey) {
                e.preventDefault();
                if (this.inputText.value.trim()) this.doTranslate();
            }
        });

        // Settings changes
        this.sourceLang.addEventListener('change', () => this.handleSettingChange('sourceLang', this.sourceLang.value));
        this.targetLang.addEventListener('change', () => {
            this.handleSettingChange('targetLang', this.targetLang.value);
            if (this.inputText.value) this.doTranslate();
        });
        this.translationService.addEventListener('change', () => {
            this.handleSettingChange('translationService', this.translationService.value);
            if (this.inputText.value) this.doTranslate();
        });

        // Swap languages
        this.swapLangs.addEventListener('click', () => this.swapLanguages());

        // Speak buttons
        this.speakSource.addEventListener('click', () => {
            const text = this.inputText.value.trim();
            const lang = this.sourceLang.value === 'auto' ? this.detectedLang : this.sourceLang.value;
            if (text) this.controller.speak(text, lang || 'en');
        });

        this.speakTarget.addEventListener('click', () => {
            const text = this.translatedText.textContent.trim();
            if (text) this.controller.speak(text, this.targetLang.value);
        });

        // Copy buttons
        this.copyTarget.addEventListener('click', () => this.handleCopy(this.translatedText.textContent, this.copyTarget));
        this.copyPhonetic.addEventListener('click', () => this.handleCopy(this.phoneticText.textContent, this.copyPhonetic));
        this.copySourcePhonetic.addEventListener('click', () => this.handleCopy(this.sourcePhonetic.textContent, this.copySourcePhonetic));

        // Clear button
        this.clearBtn.addEventListener('click', () => this.clearTranslation());

        // Phonetic toggle buttons
        this.toggleSourcePhonetic.addEventListener('click', () => this.togglePhonetic('source'));
        this.toggleTargetPhonetic.addEventListener('click', () => this.togglePhonetic('target'));
    }

    /**
     * Toggle phonetic section collapse/expand
     * @param {string} type - 'source' or 'target'
     */
    togglePhonetic(type) {
        const container = type === 'source' ? this.sourcePhoneticContainer : this.targetPhoneticContainer;
        const btn = type === 'source' ? this.toggleSourcePhonetic : this.toggleTargetPhonetic;

        if (container.classList.contains('collapsed')) {
            container.classList.remove('collapsed');
            btn.textContent = '▲';
            btn.title = 'Collapse phonetic';
        } else {
            container.classList.add('collapsed');
            btn.textContent = '▼';
            btn.title = 'Expand phonetic';
        }
    }

    /**
     * Clear current translation and storage
     */
    async clearTranslation() {
        this.inputText.value = '';
        this.translatedText.textContent = '';
        this.phoneticText.textContent = '';
        this.sourcePhonetic.textContent = '';
        this.resultArea.classList.add('hidden');
        this.errorMessage.classList.add('hidden');

        // Hide phonetic buttons
        this.toggleVisibility(this.copyPhonetic, false);
        this.toggleVisibility(this.copySourcePhonetic, false);
        this.toggleVisibility(this.toggleTargetPhonetic, false);
        this.toggleVisibility(this.toggleSourcePhonetic, false);

        // Clear from storage
        try {
            await chrome.storage.local.remove(['lastInput', 'lastResult']);
        } catch (error) {
            console.log('Could not clear storage:', error.message);
        }

        this.inputText.focus();
    }

    loadSettingsToUI() {
        if (this.sourceLang) this.sourceLang.value = this.settings.sourceLang;
        if (this.targetLang) this.targetLang.value = this.settings.targetLang;
        if (this.translationService) this.translationService.value = this.settings.translationService;

        // Load API Keys and Proxy URL
        if (this.openaiApiKey) this.openaiApiKey.value = this.settings.openaiApiKey || '';
        if (this.geminiProxyUrl) this.geminiProxyUrl.value = this.settings.geminiProxyUrl || '';
        if (this.geminiApiKey) this.geminiApiKey.value = this.settings.geminiApiKey || '';

        // Update controller with loaded config
        this.controller.updateConfig({
            OPENAI_API_KEY: this.settings.openaiApiKey,
            GEMINI_PROXY_URL: this.settings.geminiProxyUrl,
            GEMINI_API_KEY: this.settings.geminiApiKey
        });
    }

    async saveSettings() {
        const newSettings = {
            openaiApiKey: this.openaiApiKey.value.trim(),
            geminiProxyUrl: this.geminiProxyUrl.value.trim() || 'http://localhost:8045/v1/chat/completions',
            geminiApiKey: this.geminiApiKey ? this.geminiApiKey.value.trim() : ''
        };

        // Update local settings object
        this.settings.openaiApiKey = newSettings.openaiApiKey;
        this.settings.geminiProxyUrl = newSettings.geminiProxyUrl;
        this.settings.geminiApiKey = newSettings.geminiApiKey;

        // Save to storage
        await StorageService.saveSettings(this.settings);

        // Update Controller
        this.controller.updateConfig({
            OPENAI_API_KEY: newSettings.openaiApiKey,
            GEMINI_PROXY_URL: newSettings.geminiProxyUrl,
            GEMINI_API_KEY: newSettings.geminiApiKey
        });

        // Show feedback
        this.saveStatus.classList.remove('hidden');
        setTimeout(() => {
            this.saveStatus.classList.add('hidden');
        }, 2000);
    }



    async doTranslate() {
        const text = this.inputText.value.trim();
        if (!text) return;

        this.translateBtn.textContent = 'Translating...';
        this.translateBtn.disabled = true;
        this.errorMessage.classList.add('hidden');
        this.resultArea.classList.add('hidden');

        try {
            const result = await this.controller.translate(
                text,
                this.sourceLang.value,
                this.targetLang.value,
                this.translationService.value
            );

            this.displayResult(result);
            this.saveLastTranslation(text, result);
            
            // Save to history
            await StorageService.addToHistory({
                source: text,
                translation: result.translation,
                sourceLang: this.sourceLang.value,
                targetLang: this.targetLang.value,
                service: this.translationService.value
            });
        } catch (error) {
            this.displayError(error);
        } finally {
            this.translateBtn.textContent = 'Translate';
            this.translateBtn.disabled = false;
        }
    }

    displayResult(result) {
        this.translatedText.textContent = result.translation;
        this.phoneticText.textContent = result.targetPhonetic ? `/${result.targetPhonetic}/` : '';
        this.sourcePhonetic.textContent = result.srcPhonetic ? `/${result.srcPhonetic}/` : '';
        this.detectedLang = result.detectedLang;

        // Toggle copy buttons
        this.toggleVisibility(this.copyPhonetic, !!result.targetPhonetic);
        this.toggleVisibility(this.copySourcePhonetic, !!result.srcPhonetic);

        // Toggle toggle buttons
        this.toggleVisibility(this.toggleTargetPhonetic, !!result.targetPhonetic);
        this.toggleVisibility(this.toggleSourcePhonetic, !!result.srcPhonetic);

        // Reset to collapsed state by default
        this.sourcePhoneticContainer.classList.add('collapsed');
        this.targetPhoneticContainer.classList.add('collapsed');
        this.toggleSourcePhonetic.textContent = '▼';
        this.toggleSourcePhonetic.title = 'Expand phonetic';
        this.toggleTargetPhonetic.textContent = '▼';
        this.toggleTargetPhonetic.title = 'Expand phonetic';

        // Fallback notice
        if (result.fallbackNotice) {
            // You might want to add a UI element for notice if desired, 
            // or append it to error area temporarily
            console.warn(result.fallbackNotice);
        }

        this.resultArea.classList.remove('hidden');
    }

    displayError(error) {
        const msg = ErrorHandler.formatErrorMessage(error);
        this.translatedText.textContent = msg;
        this.phoneticText.textContent = '';
        this.sourcePhonetic.textContent = '';
        this.resultArea.classList.remove('hidden');
        // Alternatively show in error message box
        // this.errorMessage.textContent = msg;
        // this.errorMessage.classList.remove('hidden');
    }

    swapLanguages() {
        if (this.sourceLang.value === 'auto') return;

        const temp = this.sourceLang.value;
        this.sourceLang.value = this.targetLang.value;
        this.targetLang.value = temp;

        this.handleSettingChange('sourceLang', this.sourceLang.value);
        this.handleSettingChange('targetLang', this.targetLang.value);

        if (this.inputText.value) this.doTranslate();
    }

    handleSettingChange(key, value) {
        this.settings[key] = value;
        StorageService.saveSetting(key, value);
    }

    async handleCopy(text, btn) {
        if (!text) return;
        await ClipboardService.copy(text);
        ClipboardService.showFeedback(btn);
    }

    toggleVisibility(element, isVisible) {
        if (isVisible) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    }

    /**
     * Load and display translation history
     */
    async loadHistory() {
        const history = await StorageService.getHistory();
        
        if (history.length === 0) {
            this.historyList.innerHTML = '<div class="history-empty">No history yet</div>';
            return;
        }
        
        this.historyList.innerHTML = history.map(item => this.renderHistoryItem(item)).join('');
        
        // Bind click events
        this.historyList.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (!e.target.classList.contains('history-delete')) {
                    this.handleHistoryClick(el.dataset.id, history);
                }
            });
        });
        
        // Bind delete events
        this.historyList.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await StorageService.deleteHistoryItem(btn.dataset.id);
                this.loadHistory();
            });
        });
    }

    /**
     * Render a single history item
     */
    renderHistoryItem(item) {
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });
        
        return `
            <div class="history-item" data-id="${item.id}">
                <button class="history-delete" data-id="${item.id}" title="Delete">×</button>
                <div class="history-source">${this.escapeHtml(item.source)}</div>
                <div class="history-translation">${this.escapeHtml(item.translation)}</div>
                <div class="history-meta">
                    <span>${item.sourceLang} → ${item.targetLang}</span>
                    <span>${timeStr}</span>
                </div>
            </div>
        `;
    }

    /**
     * Handle click on history item (load and translate)
     */
    handleHistoryClick(id, history) {
        const item = history.find(h => h.id === id);
        if (!item) return;
        
        // Switch to translate view
        this.historyView.classList.add('hidden');
        this.translateView.classList.remove('hidden');
        document.body.classList.remove('settings-mode');
        
        // Load text and translate
        this.inputText.value = item.source;
        this.sourceLang.value = item.sourceLang;
        this.targetLang.value = item.targetLang;
        this.doTranslate();
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
