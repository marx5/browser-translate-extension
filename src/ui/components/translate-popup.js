/**
 * Main translation popup component
 */
class TranslatePopup extends BaseComponent {
    /**
     * @param {Object} options
     * @param {string} options.selectedText
     * @param {Object} options.settings
     * @param {Function} options.onTranslate
     * @param {Function} options.onClose
     * @param {Function} options.onSettingsChange
     * @param {Function} options.onSpeak
     */
    constructor(options) {
        super();
        this.selectedText = options.selectedText;
        this.settings = options.settings;
        this.onTranslateCallback = options.onTranslate;
        this.onCloseCallback = options.onClose;
        this.onSettingsChange = options.onSettingsChange;
        this.onSpeak = options.onSpeak;

        // Child components
        this.serviceSelector = new ServiceSelector(
            this.settings.translationService,
            (newService) => this.handleServiceChange(newService)
        );

        this.languageSelector = new LanguageSelector(
            this.settings.sourceLang,
            this.settings.targetLang,
            (lang) => this.handleSourceChange(lang),
            (lang) => this.handleTargetChange(lang),
            () => this.handleSwap()
        );

        this.translationResult = new TranslationResult({
            onSpeak: (text) => this.handleSpeakResult(text),
            uiLanguage: this.settings.uiLanguage || 'en'
        });
    }

    render() {
        this.element = DOMUtils.createElement('div', 'inline-translate-popup');

        const strings = LOCALES[this.settings.uiLanguage || 'en'] || LOCALES.en;

        const content = DOMUtils.createElement('div', 'inline-popup-content');

        // Header Row (Service + Language + Close)
        const header = DOMUtils.createElement('div', 'inline-header-row');

        // 1. Service Selector
        // Pass uiLanguage to ServiceSelector
        this.serviceSelector.setUiLanguage(this.settings.uiLanguage || 'en');
        header.appendChild(this.serviceSelector.render());

        // 2. Language Selector
        header.appendChild(this.languageSelector.render());

        // 3. Close Button
        const closeBtn = DOMUtils.createElement('button', 'inline-header-close', '×');
        closeBtn.title = strings.close;
        this.addEventListener(closeBtn, 'click', () => this.handleClose());
        header.appendChild(closeBtn);

        content.appendChild(header);

        // Original Text Section
        const textSection = DOMUtils.createElement('div', 'inline-text-section');
        const label = DOMUtils.createElement('div', 'inline-section-label', strings.originalLabel);

        const textContent = DOMUtils.createElement('div', 'inline-text-content');
        const textMain = DOMUtils.createElement('div', 'inline-text-main');
        textMain.innerHTML = DOMUtils.escapeHtml(this.selectedText);

        const actions = DOMUtils.createElement('div', 'inline-text-actions');
        const speakBtn = DOMUtils.createElement('button', 'inline-icon-btn', '🔊');
        speakBtn.title = strings.speak;
        this.addEventListener(speakBtn, 'click', () => this.handleSpeakSource());

        actions.appendChild(speakBtn);
        textContent.appendChild(textMain);
        textContent.appendChild(actions);

        textSection.appendChild(label);
        textSection.appendChild(textContent);

        // Source Phonetic Placeholder
        const sourcePhonetic = DOMUtils.createElement('div', 'inline-phonetic');
        sourcePhonetic.id = 'sourcePhonetic';
        sourcePhonetic.style.display = 'none';
        textSection.appendChild(sourcePhonetic);

        content.appendChild(textSection);

        // Translation Result
        content.appendChild(this.translationResult.render());

        this.element.appendChild(content);

        // Register child components
        this.addChild(this.serviceSelector);
        this.addChild(this.languageSelector);
        this.addChild(this.translationResult);

        // Stop propagation of events to prevent document listeners from triggering
        // This fixes the issue where closing the popup triggers the selection icon again
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            this.element.addEventListener(eventType, (e) => e.stopPropagation());
        });

        return this.element;
    }

    handleClose() {
        if (this.onCloseCallback) this.onCloseCallback();
        this.destroy();
    }

    handleServiceChange(newService) {
        this.settings.translationService = newService;
        if (this.onSettingsChange) {
            this.onSettingsChange({ translationService: newService });
        }
        if (this.onTranslateCallback) this.onTranslateCallback();
    }

    handleSourceChange(lang) {
        this.settings.sourceLang = lang;
        if (this.onSettingsChange) {
            this.onSettingsChange({ sourceLang: lang });
        }
        if (this.onTranslateCallback) this.onTranslateCallback();
    }

    handleTargetChange(lang) {
        this.settings.targetLang = lang;
        if (this.onSettingsChange) {
            this.onSettingsChange({ targetLang: lang });
        }
        if (this.onTranslateCallback) this.onTranslateCallback();
    }

    handleSwap() {
        if (this.settings.sourceLang === 'auto') return;

        const temp = this.settings.sourceLang;
        this.settings.sourceLang = this.settings.targetLang;
        this.settings.targetLang = temp;

        // Update UI
        this.languageSelector.updateValues(this.settings.sourceLang, this.settings.targetLang);

        // Notify
        if (this.onSettingsChange) {
            this.onSettingsChange({
                sourceLang: this.settings.sourceLang,
                targetLang: this.settings.targetLang
            });
        }
        if (this.onTranslateCallback) this.onTranslateCallback();
    }

    handleSpeakSource() {
        if (this.onSpeak) {
            this.onSpeak(this.selectedText, this.settings.sourceLang === 'auto' ? 'en' : this.settings.sourceLang);
        }
    }

    handleSpeakResult(text) {
        if (this.onSpeak) {
            this.onSpeak(text, this.settings.targetLang);
        }
    }

    showLoading() {
        this.translationResult.showLoading();
    }

    displayResult(result) {
        this.translationResult.displayResult(result);

        // Update source phonetic if available
        const sourcePhonetic = this.element.querySelector('#sourcePhonetic');
        if (sourcePhonetic) {
            if (result.srcPhonetic) {
                sourcePhonetic.style.display = 'flex';
                sourcePhonetic.innerHTML = `<span class="inline-phonetic-text">/${DOMUtils.escapeHtml(result.srcPhonetic)}/</span>`;
            } else {
                sourcePhonetic.style.display = 'none';
                sourcePhonetic.innerHTML = '';
            }
        }
    }

    displayError(error) {
        this.translationResult.displayError(error);
    }

    setPosition(x, y, maxHeight, transform) {
        if (this.element) {
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
            if (maxHeight) {
                this.element.style.maxHeight = `${maxHeight}px`;
            }
            if (transform) {
                this.element.style.transform = transform;
            }
        }
    }
}
