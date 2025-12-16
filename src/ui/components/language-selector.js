/**
 * Language Selector Component
 */
class LanguageSelector extends BaseComponent {
    /**
     * @param {string} sourceLang
     * @param {string} targetLang
     * @param {Function} onSourceChange
     * @param {Function} onTargetChange
     * @param {Function} onSwap
     */
    constructor(sourceLang, targetLang, onSourceChange, onTargetChange, onSwap) {
        super();
        this.sourceLang = sourceLang;
        this.targetLang = targetLang;
        this.onSourceChange = onSourceChange;
        this.onTargetChange = onTargetChange;
        this.onSwap = onSwap;
    }

    render() {
        this.element = DOMUtils.createElement('div', 'inline-language-selector');

        // Source Language Select
        this.sourceSelect = this.createSelect(getSourceLanguages(), this.sourceLang, 'inlineSourceLang');
        this.addEventListener(this.sourceSelect, 'change', (e) => {
            this.sourceLang = e.target.value;
            if (this.onSourceChange) this.onSourceChange(this.sourceLang);
        });

        // Swap Button
        this.swapBtn = DOMUtils.createElement('button', 'inline-swap-btn', '⇄');
        this.swapBtn.id = 'inlineSwapLangs';
        this.swapBtn.title = 'Swap languages';
        this.addEventListener(this.swapBtn, 'click', () => {
            if (this.onSwap) this.onSwap();
        });

        // Target Language Select
        this.targetSelect = this.createSelect(getTargetLanguages(), this.targetLang, 'inlineTargetLang');
        this.addEventListener(this.targetSelect, 'change', (e) => {
            this.targetLang = e.target.value;
            if (this.onTargetChange) this.onTargetChange(this.targetLang);
        });

        this.element.appendChild(this.sourceSelect);
        this.element.appendChild(this.swapBtn);
        this.element.appendChild(this.targetSelect);

        return this.element;
    }

    createSelect(languages, selectedValue, id) {
        const select = DOMUtils.createElement('select', 'inline-lang-select');
        select.id = id;

        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            if (lang.code === selectedValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        return select;
    }

    updateValues(sourceLang, targetLang) {
        this.sourceLang = sourceLang;
        this.targetLang = targetLang;

        if (this.sourceSelect) this.sourceSelect.value = sourceLang;
        if (this.targetSelect) this.targetSelect.value = targetLang;
    }
}
