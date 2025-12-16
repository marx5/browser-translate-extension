/**
 * Translation Result Component
 * Displays translation text, phonetics, and action buttons
 */
class TranslationResult extends BaseComponent {
    /**
     * @param {Object} options
     * @param {Function} onSpeak
     */
    constructor(options = {}) {
        super();
        this.onSpeak = options.onSpeak;
        this.uiLanguage = options.uiLanguage || 'en';
    }

    render() {
        this.element = DOMUtils.createElement('div', 'inline-translation-result');
        return this.element;
    }

    /**
     * Display translation result
     * @param {TranslationResult} result
     */
    displayResult(result) {
        if (!this.element) return;

        const strings = LOCALES[this.uiLanguage] || LOCALES.en;

        this.element.innerHTML = '';

        const section = DOMUtils.createElement('div', 'inline-text-section');

        const label = DOMUtils.createElement('div', 'inline-section-label', strings.translationLabel);
        section.appendChild(label);

        const content = DOMUtils.createElement('div', 'inline-text-content');

        const textMain = DOMUtils.createElement('div', 'inline-text-main');
        textMain.innerHTML = DOMUtils.escapeHtml(result.translation);
        content.appendChild(textMain);

        const actions = DOMUtils.createElement('div', 'inline-text-actions');
        const speakBtn = DOMUtils.createElement('button', 'inline-icon-btn', '🔊');
        speakBtn.title = strings.speak;
        this.addEventListener(speakBtn, 'click', () => {
            if (this.onSpeak) this.onSpeak(result.translation);
        });
        actions.appendChild(speakBtn);
        content.appendChild(actions);

        section.appendChild(content);

        // Phonetics
        if (result.targetPhonetic) {
            const phonetic = DOMUtils.createElement('div', 'inline-phonetic');
            phonetic.style.display = 'flex';
            phonetic.innerHTML = `<span class="inline-phonetic-text">/${DOMUtils.escapeHtml(result.targetPhonetic)}/</span>`;
            section.appendChild(phonetic);
        }

        // Fallback notice
        if (result.fallbackNotice) {
            const notice = DOMUtils.createElement('div', 'inline-fallback-notice');
            notice.textContent = result.fallbackNotice; // This might need localization if generated at service level
            section.appendChild(notice);
        }

        this.element.appendChild(section);
    }

    /**
     * Display error message
     * @param {Error} error
     */
    displayError(error) {
        if (!this.element) return;
        this.element.innerHTML = '';

        // Use localized error prefix/message logic if desired, 
        // but often error comes with specific message
        const errorDiv = DOMUtils.createElement('div', 'inline-popup-error');
        errorDiv.textContent = ErrorHandler.formatErrorMessage(error);
        this.element.appendChild(errorDiv);
    }

    /**
     * Perform loading state
     */
    showLoading() {
        if (!this.element) return;

        const strings = LOCALES[this.uiLanguage] || LOCALES.en;

        this.element.innerHTML = `
      <div class="inline-popup-loading" style="display: flex;">
        <div class="inline-loading-spinner"></div>
        <span>${strings.translating}</span>
      </div>
    `;
    }
}
