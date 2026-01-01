/**
 * Translate Icon Button Component
 */
class TranslateIcon extends BaseComponent {
    /**
     * @param {Function} onClick
     */
    constructor(onClick) {
        super();
        this.onClick = onClick;
    }

    render() {
        this.element = DOMUtils.createElement('button', 'translate-icon-btn');
        this.element.title = 'Translate';

        this.element.textContent = '🔍';
        this.element.style.fontSize = '14px';

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
