// Content script for inline translation popup
// Connects UI components with Translation Controller

(function () {
    'use strict';

    let contentUI = null;
    let translationController = null;

    // Load settings and initialize
    async function init() {
        try {
            // Load settings first (including API keys)
            const settings = await StorageService.getSettings();

            // Construct config from settings
            const config = {
                OPENAI_API_KEY: settings.openaiApiKey || ''
            };

            // Initialize services and controller
            translationController = new TranslationController(config);

            // Initialize UI
            contentUI = new ContentUI(
                translationController,
                settings,
                (newSettings) => StorageService.saveSettings(newSettings)
            );

            // Listen for text selection
            document.addEventListener('mouseup', (e) => handleTextSelection(e));
            document.addEventListener('touchend', (e) => handleTextSelection(e));

            // Listen for settings changes from storage (e.g. from popup)
            chrome.storage.onChanged.addListener((changes, area) => {
                if (area === 'sync') {
                    // Update UI settings
                    const newSettings = {};
                    if (changes.sourceLang) newSettings.sourceLang = changes.sourceLang.newValue;
                    if (changes.targetLang) newSettings.targetLang = changes.targetLang.newValue;
                    if (changes.translationService) newSettings.translationService = changes.translationService.newValue;

                    if (Object.keys(newSettings).length > 0) {
                        contentUI.updateSettings(newSettings);
                    }

                    // Update Controller config (API Keys)
                    const newConfig = {};
                    if (changes.openaiApiKey) newConfig.OPENAI_API_KEY = changes.openaiApiKey.newValue;

                    if (Object.keys(newConfig).length > 0) {
                        translationController.updateConfig(newConfig);
                    }
                }
            });

        } catch (error) {
            console.error('Translation Extension Init Error:', error);
        }
    }

    function handleTextSelection(e) {
        // Capture coordinates immediately
        const x = e.pageX || (e.clientX + window.scrollX);
        const y = e.pageY || (e.clientY + window.scrollY);

        // Debounce slightly to ensure selection is complete
        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();
            contentUI.handleSelection(x, y, text);
        }, 10);
    }

    // Initialize
    init();

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (contentUI) {
            contentUI.destroy();
        }
    });
})();
