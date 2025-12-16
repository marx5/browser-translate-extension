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

        this.element.innerHTML = '';

        const section = DOMUtils.createElement('div', 'inline-text-section');

        const label = DOMUtils.createElement('div', 'inline-section-label', 'TRANSLATION');
        section.appendChild(label);

        const content = DOMUtils.createElement('div', 'inline-text-content');

        const textMain = DOMUtils.createElement('div', 'inline-text-main');
        textMain.innerHTML = DOMUtils.escapeHtml(result.translation);
        content.appendChild(textMain);

        const actions = DOMUtils.createElement('div', 'inline-text-actions');
        const speakBtn = DOMUtils.createElement('button', 'inline-icon-btn');
        speakBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
        speakBtn.title = 'Speak';
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
            notice.textContent = result.fallbackNotice;
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

        const errorDiv = DOMUtils.createElement('div', 'inline-popup-error');
        errorDiv.textContent = ErrorHandler.formatErrorMessage(error);
        this.element.appendChild(errorDiv);
    }

    /**
     * Perform loading state
     */
    showLoading() {
        if (!this.element) return;
        this.element.innerHTML = `
      <div class="inline-popup-loading" style="display: flex;">
        <div class="inline-loading-spinner"></div>
        <span>Translating...</span>
      </div>
    `;
    }
}
