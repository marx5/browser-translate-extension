// Background script to handle messages from content script
// Provides config to content script and proxies API calls to bypass CORS

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getConfig') {
        try {
            sendResponse({ config: {} });
        } catch (error) {
            sendResponse({ config: {} });
        }
        return true;
    }

    // Proxy API calls to bypass CORS for localhost
    if (request.action === 'proxyFetch') {
        (async () => {
            try {
                const response = await fetch(request.url, request.options);
                const data = await response.json();
                
                if (!response.ok) {
                    sendResponse({ 
                        error: true, 
                        status: response.status, 
                        data 
                    });
                } else {
                    sendResponse({ error: false, data });
                }
            } catch (error) {
                sendResponse({ 
                    error: true, 
                    message: error.message 
                });
            }
        })();
        return true; // Keep channel open for async response
    }
});
