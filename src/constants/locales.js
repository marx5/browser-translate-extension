/**
 * Localization strings for the extension UI
 */
const LOCALES = {
    en: {
        settingsTitle: 'Settings',
        translateTitle: 'Translate',
        inputPlaceholder: 'Enter text or select text on page...',
        translateBtn: 'Translate',
        translationLabel: 'Translation',
        geminiApiKey: 'Gemini API Key',
        openaiApiKey: 'OpenAI API Key',
        saveSettings: 'Save Settings',
        saveSuccess: 'Settings saved!',
        interfaceLanguage: 'Interface Language',
        originalLabel: 'ORIGINAL',
        translating: 'Translating...',
        requiredGemini: 'Required for Gemini translation',
        requiredOpenAI: 'Required for OpenAI translation',
        autoDetect: 'Auto Detect',
        swapLanguages: 'Swap languages',
        close: 'Close',
        copy: 'Copy',
        speak: 'Speak',
        back: 'Back',
        openSettings: 'Settings',
        errorMessage: 'Translation failed. Please try again.',
        fallbackNotice: '⚠️ API Limit/Error: {error}\n🔄 Switched to Google Translate.',
        service: {
            google: 'Google Translate',
            gemini: 'Gemini AI',
            openai: 'OpenAI',
            mymemory: 'MyMemory'
        },
        errors: {
            apiKeyInvalid: '❌ API Key is invalid. Please check your settings.',
            apiKeyMissing: '🔑 API Key is missing. Please check your settings.',
            quotaExceeded: '📊 Quota/Credits exceeded. Please check your account or switch services.',
            rateLimit: '⏱️ Rate limit exceeded. Please try again later.',
            forbidden: '🔒 Access forbidden. Please check your permissions.',
            serverError: '🔧 Service error. Please try again later.',
            networkError: '🌐 Network error. Please check your connection.',
            unknown: '❌ Unknown error occurred.'
        }
    },
    vi: {
        settingsTitle: 'Cài đặt',
        translateTitle: 'Dịch',
        inputPlaceholder: 'Nhập văn bản hoặc bôi đen trên trang web...',
        translateBtn: 'Dịch',
        translationLabel: 'Bản dịch',
        geminiApiKey: 'Gemini API Key',
        openaiApiKey: 'OpenAI API Key',
        saveSettings: 'Lưu cài đặt',
        saveSuccess: 'Đã lưu cài đặt!',
        interfaceLanguage: 'Ngôn ngữ hiển thị',
        originalLabel: 'GỐC',
        translating: 'Đang dịch...',
        requiredGemini: 'Cần thiết cho dịch vụ Gemini',
        requiredOpenAI: 'Cần thiết cho dịch vụ OpenAI',
        autoDetect: 'Tự động phát hiện',
        swapLanguages: 'Đổi ngôn ngữ',
        close: 'Đóng',
        copy: 'Sao chép',
        speak: 'Phát âm',
        back: 'Quay lại',
        openSettings: 'Cài đặt',
        errorMessage: 'Dịch thất bại. Vui lòng thử lại.',
        fallbackNotice: '⚠️ Lỗi API: {error}\n🔄 Đã tự động chuyển sang Google Translate.',
        service: {
            google: 'Google Dịch',
            gemini: 'Gemini AI',
            openai: 'OpenAI',
            mymemory: 'MyMemory'
        },
        errors: {
            apiKeyInvalid: '❌ API Key không hợp lệ. Vui lòng kiểm tra lại cài đặt.',
            apiKeyMissing: '🔑 Thiếu API Key. Vui lòng kiểm tra cài đặt.',
            quotaExceeded: '📊 Đã hết Quota/Credits. Vui lòng kiểm tra tài khoản hoặc đổi dịch vụ.',
            rateLimit: '⏱️ Quá giới hạn lượt gọi (Rate limit). Vui lòng thử lại sau.',
            forbidden: '🔒 Truy cập bị từ chối. Vui lòng kiểm tra quyền hạn.',
            serverError: '🔧 Lỗi máy chủ dịch vụ. Vui lòng thử lại sau.',
            networkError: '🌐 Lỗi kết nối mạng.',
            unknown: '❌ Lỗi không xác định.'
        }
    }
};
