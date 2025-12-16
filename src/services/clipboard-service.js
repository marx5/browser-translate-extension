/**
 * Service for clipboard operations
 */
class ClipboardService {
    /**
     * Copy text to clipboard
     * @param {string} text
     * @returns {Promise<boolean>}
     */
    static async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            return this.copyFallback(text);
        }
    }

    /**
     * Fallback copy method for older browsers
     * @private
     */
    static copyFallback(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch (err) {
            return false;
        }
    }

    /**
     * Show visual feedback on button
     * @param {HTMLElement} button
     */
    static showFeedback(button) {
        const originalText = button.textContent;
        button.textContent = '✓';
        button.style.color = '#34a853';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.color = '';
        }, 1000);
    }
}
