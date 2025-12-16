/**
 * UI Constants - CSS classes, DOM IDs, and UI text
 */

// CSS Class Names
const CSS_CLASSES = {
    // Popup
    POPUP: 'inline-translate-popup',
    POPUP_CONTENT: 'inline-popup-content',
    POPUP_CLOSE: 'inline-popup-close',
    POPUP_LOADING: 'inline-popup-loading',
    POPUP_ERROR: 'inline-popup-error',
    POPUP_ACTIONS: 'inline-popup-actions',

    // Icon
    TRANSLATE_ICON: 'translate-icon-btn',

    // Sections
    TEXT_SECTION: 'inline-text-section',
    TEXT_CONTENT: 'inline-text-content',
    TEXT_MAIN: 'inline-text-main',
    TEXT_ACTIONS: 'inline-text-actions',
    SECTION_LABEL: 'inline-section-label',

    // Selectors
    SERVICE_SELECTOR: 'inline-service-selector',
    SERVICE_SELECT: 'inline-service-select',
    LANGUAGE_SELECTOR: 'inline-language-selector',
    LANG_SELECT: 'inline-lang-select',
    SWAP_BTN: 'inline-swap-btn',

    // Phonetic
    PHONETIC: 'inline-phonetic',
    PHONETIC_TEXT: 'inline-phonetic-text',

    // Buttons
    ICON_BTN: 'inline-icon-btn',

    // States
    HIDDEN: 'hidden',
    CLOSING: 'closing',

    // Notices
    FALLBACK_NOTICE: 'inline-fallback-notice'
};

// DOM Element IDs
const DOM_IDS = {
    // Service & Language
    SERVICE_SELECT: 'inlineServiceSelect',
    SOURCE_LANG: 'inlineSourceLang',
    TARGET_LANG: 'inlineTargetLang',
    SWAP_LANGS: 'inlineSwapLangs',

    // Phonetics
    SOURCE_PHONETIC: 'sourcePhonetic',
    TRANSLATION_PHONETIC: 'translationPhonetic',

    // Speak buttons
    SPEAK_SOURCE: 'inlineSpeakSource',
    SPEAK_TRANSLATION: 'inlineSpeakTranslation'
};

// UI Text
const UI_TEXT = {
    LABELS: {
        ORIGINAL: 'ORIGINAL',
        TRANSLATION: 'TRANSLATION'
    },
    LOADING: 'Translating...',
    CLOSE_TITLE: 'Close',
    SPEAK_TITLE: 'Speak',
    SWAP_TITLE: 'Swap languages'
};

// Popup Dimensions (for positioning calculations)
const POPUP_DIMENSIONS = {
    ESTIMATED_WIDTH: 400,
    ESTIMATED_HEIGHT: 300,
    MARGIN: 20,
    ICON_OFFSET_X: 10,
    ICON_OFFSET_Y: 20
};
