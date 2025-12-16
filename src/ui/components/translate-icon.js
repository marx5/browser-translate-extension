/**
 * Translate Icon Button Component
 */
class TranslateIcon extends BaseComponent {
    /**
     * @param {Function} onClick
     * @param {string} uiLanguage
     */
    constructor(onClick, uiLanguage = 'en') {
        super();
        this.onClick = onClick;
        this.uiLanguage = uiLanguage;
    }

    render() {
        this.element = DOMUtils.createElement('button', 'translate-icon-btn');
        const strings = LOCALES[this.uiLanguage] || LOCALES.en;
        this.element.title = strings.translateTitle || 'Translate';

        const iconImg = document.createElement('img');
        iconImg.src = chrome.runtime.getURL('images/icon16.png');
        iconImg.alt = 'Translate';
        iconImg.style.width = '16px';
        iconImg.style.height = '16px';
        iconImg.style.pointerEvents = 'none'; // Ensure clicks pass to button

        this.element.appendChild(iconImg);

        this.addEventListener(this.element, 'click', (e) => {
            e.stopPropagation();
            if (this.onClick) this.onClick(e);
        });

        this.addEventListener(this.element, 'mousedown', (e) => e.stopPropagation());
        this.addEventListener(this.element, 'mouseup', (e) => e.stopPropagation());

        return this.element;
    }

    /**
     * Set icon position (absolute)
     * @param {number} x
     * @param {number} y
     */
    setPosition(x, y) {
        if (this.element) {
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
        }
    }
}
