/**
 * Base class for all UI components
 * Provides lifecycle management and event handling
 * @abstract
 */
class BaseComponent {
    constructor() {
        if (new.target === BaseComponent) {
            throw new Error('BaseComponent is abstract');
        }

        this.element = null;
        this.eventListeners = [];
        this.children = [];
    }

    /**
     * Create and return the component's DOM element
     * @returns {HTMLElement}
     * @abstract
     */
    render() {
        throw new Error('render() must be implemented');
    }

    /**
     * Mount component to parent element
     * @param {HTMLElement} parent
     */
    mount(parent) {
        if (!this.element) {
            this.element = this.render();
        }
        parent.appendChild(this.element);
    }

    /**
     * Unmount component from DOM
     */
    unmount() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    /**
     * Add event listener and track for cleanup
     * @param {HTMLElement} element
     * @param {string} event
     * @param {Function} handler
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * Add child component
     * @param {BaseComponent} child
     */
    addChild(child) {
        this.children.push(child);
    }

    /**
     * Show component
     */
    show() {
        if (this.element) {
            this.element.style.display = '';
        }
    }

    /**
     * Hide component
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        // Destroy children first
        this.children.forEach(child => child.destroy());
        this.children = [];

        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        // Remove from DOM
        this.unmount();
        this.element = null;
    }
}
