// Background script to handle messages from content script
// Provides config to content script

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getConfig') {
        // Try to get config
        try {
            // Since we can't directly access CONFIG from background,
            // we'll need to inject it or use storage
            // For now, return empty config and let content script handle it
            sendResponse({ config: {} });
        } catch (error) {
            sendResponse({ config: {} });
        }
        return true; // Keep channel open for async response
    }
});
