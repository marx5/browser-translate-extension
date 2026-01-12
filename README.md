# 🌐 Browser Translation Extension

> _Tiện ích dịch đa dịch vụ cho trình duyệt - Multi-service translation extension_

[![Chrome](https://img.shields.io/badge/Chrome-Supported-green?logo=google-chrome&logoColor=white)](https://www.google.com/chrome/)
[![Edge](https://img.shields.io/badge/Edge-Supported-blue?logo=microsoft-edge&logoColor=white)](https://www.microsoft.com/edge)
[![Brave](https://img.shields.io/badge/Brave-Supported-orange?logo=brave&logoColor=white)](https://brave.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[🇻🇳 Tiếng Việt](#-tiếng-việt) | [🇺🇸 English](#-english)

---

## 🇻🇳 Tiếng Việt

**Browser Translation Extension** là tiện ích mở rộng mạnh mẽ giúp dịch văn bản trực tiếp trên trang web hoặc qua popup, hỗ trợ **Google Translate**, **Gemini AI** và **OpenAI**.

### ✨ Tính năng

| Tính năng             | Mô tả                                                |
| --------------------- | ---------------------------------------------------- |
| 🎯 **Dịch Inline**    | Bôi đen văn bản → Icon dịch hiện ra → Click để dịch  |
| 📱 **Popup hiện đại** | Giao diện đẹp, Dark Mode, lưu lịch sử dịch           |
| 🤖 **Đa dịch vụ**     | Google (miễn phí), Gemini AI, OpenAI                 |
| 🔊 **Phát âm (TTS)**  | Nghe đọc văn bản gốc và bản dịch                     |
| 📖 **Phiên âm IPA**   | Hiển thị IPA cho tiếng Anh, Romaji cho tiếng Nhật... |
| 📜 **Lịch sử dịch**   | Lưu và quản lý 50 bản dịch gần nhất                  |
| 🔐 **Bảo mật**        | API key lưu an toàn trong trình duyệt                |

### 🚀 Cài đặt

#### Cách 1: Tải từ Source

```bash
# Clone repository
git clone https://github.com/marx5/browser-translate-extension.git

# Hoặc tải ZIP và giải nén
```

#### Cách 2: Load vào trình duyệt

1. Mở trình duyệt → Truy cập `chrome://extensions/`
2. Bật **Developer mode** (góc phải trên)
3. Click **Load unpacked** → Chọn thư mục extension
4. Done! Icon extension sẽ xuất hiện trên thanh công cụ 🎉

### ⚙️ Cấu hình

#### Google Translate (Mặc định)

- Không cần cấu hình, hoạt động ngay!

#### Gemini AI (qua Antigravity Proxy)

1. Cài đặt và chạy [Antigravity Tools](https://github.com/anthropics/antigravity)
2. Mở extension → **Settings** (⚙️)
3. Nhập:
   - **Gemini Proxy URL**: `http://localhost:8045/v1/chat/completions`
   - **Gemini API Key**: API key từ Antigravity Tools
4. Click **Save Settings**

#### OpenAI

1. Lấy API key tại [platform.openai.com](https://platform.openai.com/api-keys)
2. Mở extension → **Settings** (⚙️)
3. Nhập **OpenAI API Key**
4. Click **Save Settings**

### 📖 Hướng dẫn sử dụng

#### Dịch Inline (trên trang web)

1. Bôi đen văn bản cần dịch
2. Click icon 🌐 xuất hiện
3. Kết quả hiện trong popup nhỏ

#### Dịch qua Popup

1. Click icon extension trên thanh công cụ
2. Nhập hoặc paste văn bản
3. Nhấn **Translate** hoặc Enter

### 🔧 Yêu cầu hệ thống

- Chrome/Edge/Brave phiên bản 88+
- Manifest V3 compatible

---

## 🇺🇸 English

**Browser Translation Extension** is a powerful translation tool that works directly on webpages or via popup, supporting **Google Translate**, **Gemini AI**, and **OpenAI**.

### ✨ Features

| Feature                   | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| 🎯 **Inline Translation** | Select text → Click translate icon → Get translation |
| 📱 **Modern Popup**       | Beautiful UI, Dark Mode, translation history         |
| 🤖 **Multi-service**      | Google (free), Gemini AI, OpenAI                     |
| 🔊 **Text-to-Speech**     | Listen to source and translated text                 |
| 📖 **Phonetics (IPA)**    | IPA for English, Romaji for Japanese...              |
| 📜 **History**            | Save and manage last 50 translations                 |
| 🔐 **Secure**             | API keys stored safely in browser                    |

### 🚀 Installation

#### Option 1: Clone from Source

```bash
git clone https://github.com/marx5/browser-translate-extension.git
```

#### Option 2: Load into Browser

1. Open browser → Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → Select extension folder
4. Done! Extension icon appears in toolbar 🎉

### ⚙️ Configuration

#### Google Translate (Default)

- No configuration needed, works out of the box!

#### Gemini AI (via Antigravity Proxy)

1. Install and run [Antigravity Tools](https://github.com/anthropics/antigravity)
2. Open extension → **Settings** (⚙️)
3. Enter:
   - **Gemini Proxy URL**: `http://localhost:8045/v1/chat/completions`
   - **Gemini API Key**: API key from Antigravity Tools
4. Click **Save Settings**

#### OpenAI

1. Get API key at [platform.openai.com](https://platform.openai.com/api-keys)
2. Open extension → **Settings** (⚙️)
3. Enter **OpenAI API Key**
4. Click **Save Settings**

### 📖 Usage Guide

#### Inline Translation (on webpage)

1. Select/highlight text
2. Click the 🌐 icon that appears
3. View translation in mini popup

#### Popup Translation

1. Click extension icon in toolbar
2. Type or paste text
3. Press **Translate** or Enter

### 🔧 Requirements

- Chrome/Edge/Brave version 88+
- Manifest V3 compatible

---

## 📁 Project Structure

```
browser-translate-extension/
├── manifest.json           # Extension configuration
├── background.js           # Service worker
├── popup.html/css/js       # Popup interface
├── content.js/css          # Content script
└── src/
    ├── services/
    │   └── translation/    # Google, Gemini, OpenAI translators
    ├── ui/                 # UI components
    └── utils/              # Utilities
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=marx5/browser-translate-extension&type=Date)](https://star-history.com/#marx5/browser-translate-extension&Date)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/marx5">marx5</a>
</p>
