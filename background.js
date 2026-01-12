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
                
                // Try to parse as JSON, fallback to text if fails
                let data;
                const contentType = response.headers.get('content-type');
                const responseText = await response.text();
                
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    // Not JSON, wrap text in error object
                    data = { error: { message: responseText, type: 'non_json_response' } };
                }
                
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
