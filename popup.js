// Popup script
// Orchestrates the popup UI

(document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load settings first (including API keys)
    const settings = await StorageService.getSettings();

    const config = {
      OPENAI_API_KEY: settings.openaiApiKey || ''
    };

    // Initialize controller
    const translationController = new TranslationController(config);

    // Initialize UI
    const popupUI = new PopupUI(translationController, settings);

  } catch (error) {
    console.error('Popup Init Error:', error);
  }
}));
