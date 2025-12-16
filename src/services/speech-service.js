/**
 * Service for text-to-speech functionality
 */
class SpeechService {
    constructor() {
        this.synthesis = window.speechSynthesis;
    }

    /**
     * Speak text in specified language
     * @param {string} text
     * @param {string} lang - Language code
     */
    speak(text, lang) {
        // Stop any ongoing speech
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'zh-CN' ? 'zh-CN' : lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;

        this.synthesis.speak(utterance);
    }

    /**
     * Stop current speech
     */
    stop() {
        this.synthesis.cancel();
    }
}
