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
        this.geminiApiKey = document.getElementById('geminiApiKey');
        this.openaiApiKey = document.getElementById('openaiApiKey');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.saveStatus = document.getElementById('saveStatus');
        this.uiLanguage = document.getElementById('uiLanguage');

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettingsToUI();
        this.localize(); // Initial localization
    }

    bindEvents() {
        // ... existing event bindings ...

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

                // Revert button to Settings (icon only, title handled by localize)
                // this.openSettingsBtn.textContent = '⚙️'; 
            } else {
                // Open settings
                this.translateView.classList.add('hidden');
                this.translateView.classList.remove('active');

                this.settingsView.classList.remove('hidden');
                this.settingsView.classList.add('active');
                document.body.classList.add('settings-mode');

                // Change button to Home (icon only)
                // this.openSettingsBtn.textContent = '🏠';

                // Re-load settings just in case
                this.loadSettingsToUI();
            }
            this.updateNavButtons();
        });

        this.backToTranslateBtn.addEventListener('click', () => {
            this.settingsView.classList.add('hidden');
            this.settingsView.classList.remove('active');

            this.translateView.classList.remove('hidden');
            this.translateView.classList.add('active');
            document.body.classList.remove('settings-mode');
            this.updateNavButtons();
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

        // UI Language change
        this.uiLanguage.addEventListener('change', () => {
            this.settings.uiLanguage = this.uiLanguage.value;
            StorageService.saveSetting('uiLanguage', this.settings.uiLanguage);
            this.localize();
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
    }

    updateNavButtons() {
        const isSettingsActive = this.settingsView.classList.contains('active');
        if (isSettingsActive) {
            this.openSettingsBtn.textContent = '🏠'; // Home icon
            // Title will be updated by localize if needed, or static
            // But title attribute is better handled directly here if dynamic
            // this.openSettingsBtn.title = ...
        } else {
            this.openSettingsBtn.textContent = '⚙️'; // Settings icon
        }
        // Force re-localize to update titles if they depend on state, 
        // but here titles are fixed 'Settings' / 'Back' mostly.
        // Actually 'openSettingsBtn' title changes concept from Settings to Home.
        // Let's handle titles in localize() and basic icons here.
    }

    loadSettingsToUI() {
        if (this.sourceLang) this.sourceLang.value = this.settings.sourceLang;
        if (this.targetLang) this.targetLang.value = this.settings.targetLang;
        if (this.translationService) this.translationService.value = this.settings.translationService;
        if (this.uiLanguage) this.uiLanguage.value = this.settings.uiLanguage || 'en';

        // Load API Keys
        if (this.geminiApiKey) this.geminiApiKey.value = this.settings.geminiApiKey || '';
        if (this.openaiApiKey) this.openaiApiKey.value = this.settings.openaiApiKey || '';

        // Update controller with loaded keys
        this.controller.updateConfig({
            GEMINI_API_KEY: this.settings.geminiApiKey,
            OPENAI_API_KEY: this.settings.openaiApiKey
        });
    }

    localize() {
        const lang = this.settings.uiLanguage || 'en';
        const strings = LOCALES[lang] || LOCALES.en;

        // Update text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (strings[key]) {
                el.textContent = strings[key];
            }
        });

        // Update titles
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (strings[key]) {
                el.title = strings[key];
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (strings[key]) {
                el.placeholder = strings[key];
            }
        });

        // Update service selector options
        if (this.translationService) {
            Array.from(this.translationService.options).forEach(option => {
                const key = option.value;
                if (strings.service && strings.service[key]) {
                    option.textContent = strings.service[key];
                }
            });
        }
    }

    async saveSettings() {
        const newSettings = {
            geminiApiKey: this.geminiApiKey.value.trim(),
            openaiApiKey: this.openaiApiKey.value.trim(),
            uiLanguage: this.uiLanguage.value
        };

        // Update local settings object
        this.settings.geminiApiKey = newSettings.geminiApiKey;
        this.settings.openaiApiKey = newSettings.openaiApiKey;
        this.settings.uiLanguage = newSettings.uiLanguage;

        // Save to storage
        await StorageService.saveSettings(this.settings);

        // Update Controller
        this.controller.updateConfig({
            GEMINI_API_KEY: newSettings.geminiApiKey,
            OPENAI_API_KEY: newSettings.openaiApiKey
        });

        // Re-localize immediately
        this.localize();

        // Show feedback
        this.saveStatus.classList.remove('hidden');
        setTimeout(() => {
            this.saveStatus.classList.add('hidden');
        }, 2000);
    }



    async doTranslate() {
        const text = this.inputText.value.trim();
        if (!text) return;

        const lang = this.settings.uiLanguage || 'en';
        const strings = LOCALES[lang] || LOCALES.en;

        this.translateBtn.textContent = strings.translating; // Localized translating state
        this.translateBtn.disabled = true;
        this.errorMessage.classList.add('hidden');
        // this.resultArea.classList.add('hidden'); // Keep result visible or hide?

        try {
            const result = await this.controller.translate(
                text,
                this.sourceLang.value,
                this.targetLang.value,
                this.translationService.value,
                this.settings.uiLanguage || 'en'
            );

            this.displayResult(result);
        } catch (error) {
            this.displayError(error);
        } finally {
            this.translateBtn.textContent = strings.translateBtn;
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

        // Fallback notice
        if (result.fallbackNotice) {
            // Display localized fallback notice if possible
            // We might need to handle parsing the notice if it comes from service
            // For now, allow mixed content or improving service to return code/args
            console.warn(result.fallbackNotice);
        }

        this.resultArea.classList.remove('hidden');
    }

    displayError(error) {
        // Use localized error message
        const lang = this.settings.uiLanguage || 'en';
        const strings = LOCALES[lang] || LOCALES.en;

        let msg = strings.errorMessage; // Default localized error

        if (error && error.message) {
            msg = error.message;
            // If it's a "Translation failed" generic from somewhere, we might prefer our localized default
            if (msg === 'Translation failed') msg = strings.errorMessage;
        }

        this.translatedText.textContent = msg;
        this.phoneticText.textContent = '';
        this.sourcePhonetic.textContent = '';
        this.resultArea.classList.remove('hidden');
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
}
