/**
 * DOM utility functions
 */
class DOMUtils {
    /**
     * Escape HTML to prevent XSS
     * @param {string} text
     * @returns {string}
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Create element with class and content
     * @param {string} tag
     * @param {string} className
     * @param {string} content
     * @returns {HTMLElement}
     */
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    /**
     * Remove element from DOM
     * @param {HTMLElement} element
     */
    static removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
}
