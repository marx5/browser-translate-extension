/**
 * Content UI Controller
 * Orchestrates the UI in the content script
 */
class ContentUI {
    /**
     * @param {TranslationController} translationController
     * @param {Object} settings
     * @param {Function} onSettingsChange
     */
    constructor(translationController, settings, onSettingsChange) {
        this.controller = translationController;
        this.settings = settings;
        this.onSettingsChange = onSettingsChange;
        this.currentPopup = null;
        this.currentIcon = null;
    }

    /**
     * Handle text selection
     * @param {MouseEvent} event
     * @param {string} text
     */
    handleSelection(x, y, text) {
        // Check if clicking on existing icon
        // We use document.elementFromPoint or checking if the coordinate is within the icon rect
        if (this.currentIcon && this.currentIcon.element) {
            const rect = this.currentIcon.element.getBoundingClientRect();
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            // Check if x,y (which are document coordinates) are within the icon
            if (x >= rect.left + scrollX && x <= rect.right + scrollX &&
                y >= rect.top + scrollY && y <= rect.bottom + scrollY) {
                return;
            }
        }

        this.removeIcon();

        // Don't show if popup is open
        if (this.currentPopup && this.currentPopup.element) {
            // Check if clicking inside popup
            // Note: x,y are document coords. popup element checking needs client coords usually or accounting for scroll
            const rect = this.currentPopup.element.getBoundingClientRect();
            const clientX = x - window.scrollX;
            const clientY = y - window.scrollY;

            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {
                return;
            }

            // If clicking outside, close popup
            this.removePopup();
        }

        if (!text) return;

        this.showIcon(x, y, text);
    }

    /**
     * Show translate icon
     * @param {number} x
     * @param {number} y
     * @param {string} text
     */
    showIcon(x, y, text) {
        this.currentIcon = new TranslateIcon((e) => {
            this.showPopup(text, e);
        });

        this.currentIcon.mount(document.body);

        // Adjust position slightly to not be exactly under cursor
        this.currentIcon.setPosition(x + 10, y - 20);

        // Auto-hide after 5 seconds
        if (this.iconTimeout) clearTimeout(this.iconTimeout);
        this.iconTimeout = setTimeout(() => {
            this.removeIcon();
        }, 2500);
    }

    /**
     * Remove icon
     */
    removeIcon() {
        if (this.iconTimeout) {
            clearTimeout(this.iconTimeout);
            this.iconTimeout = null;
        }

        if (this.currentIcon) {
            this.currentIcon.destroy();
            this.currentIcon = null;
        }
    }

    /**
     * Show translation popup
     * @param {string} text
     * @param {Event} event
     */
    async showPopup(text, event) {
        // Get user selection range for better positioning if possible
        let targetRect;
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            targetRect = selection.getRangeAt(0).getBoundingClientRect();
        } else {
            // Fallback to event target (icon)
            targetRect = event.target.getBoundingClientRect();
        }

        this.removeIcon(); // This will also clear the timeout
        this.removePopup();

        this.currentPopup = new TranslatePopup({
            selectedText: text,
            settings: this.settings,
            onTranslate: () => this.performTranslation(text),
            onClose: () => this.removePopup(),
            onSettingsChange: (newSettings) => this.handleSettingsUpdate(newSettings),
            onSpeak: (text, lang) => this.controller.speak(text, lang)
        });

        // Mount first to render content and get dimensions
        this.currentPopup.mount(document.body);

        // Apply Absolute positioning to scroll with page
        this.currentPopup.element.style.position = 'absolute';
        this.currentPopup.element.style.zIndex = '2147483647';

        this.targetRect = targetRect; // Store for repositioning
        this.repositionPopup();

        // Initial translation
        await this.performTranslation(text);
    }

    /**
     * Re-calculate and apply popup position
     */
    repositionPopup() {
        if (!this.currentPopup || !this.currentPopup.element || !this.targetRect) return;

        const popupRect = this.currentPopup.element.getBoundingClientRect();
        const pos = PositionUtils.calculatePopupPosition(this.targetRect, popupRect);

        this.currentPopup.setPosition(pos.left + window.scrollX, pos.top + window.scrollY);
    }

    /**
     * Remove popup
     */
    removePopup() {
        if (this.currentPopup) {
            this.currentPopup.destroy();
            this.currentPopup = null;
        }
        this.controller.stopSpeech();
        this.targetRect = null;
    }

    /**
     * Execute translation
     * @param {string} text
     */
    async performTranslation(text) {
        if (!this.currentPopup) return;

        this.currentPopup.showLoading();
        // Reposition on loading state too (size might change)
        this.repositionPopup();

        try {
            const result = await this.controller.translate(
                text,
                this.settings.sourceLang,
                this.settings.targetLang,
                this.settings.translationService
            );

            // Check if popup is still open
            if (this.currentPopup) {
                this.currentPopup.displayResult(result);
                // Reposition after content update (crucial for size changes)
                this.repositionPopup();
                
                // Save to history
                await StorageService.addToHistory({
                    source: text,
                    translation: result.translation,
                    sourceLang: this.settings.sourceLang,
                    targetLang: this.settings.targetLang,
                    service: this.settings.translationService
                });
            }
        } catch (error) {
            if (this.currentPopup) {
                this.currentPopup.displayError(error);
                this.repositionPopup();
            }
        }
    }

    /**
     * Handle settings update
     * @param {Object} newSettings
     */
    handleSettingsUpdate(newSettings) {
        Object.assign(this.settings, newSettings);
        if (this.onSettingsChange) {
            this.onSettingsChange(newSettings);
        }
    }

    /**
     * Update internal settings (e.g. from storage change)
     * @param {Object} newSettings
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }

    /**
     * Clean up
     */
    destroy() {
        this.removeIcon();
        this.removePopup();
    }
}
