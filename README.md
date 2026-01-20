# 🎵 Audio Loop Editor

**音訊分段剪輯與循環練習工具** - 專為音樂練習設計

[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-blue)](https://ssamexy.github.io/audio-loop-editor/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## ✨ 功能特色

- 🎯 **毫秒精度剪輯** - 精確到毫秒的時間控制 (`MM:SS.mmm`)
- 📋 **多段落管理** - 支援多段落同時編輯與階層式子段落
- ▶️ **即時試播放** - 點擊播放按鈕即可預覽每個片段
- 📊 **波形視覺化** - 直觀的音訊波形顯示
- ⚡ **自動切分** - 一鍵將音訊平均分割成多段
- 📥 **JSON 匯入/匯出** - 儲存與載入分段設定
- 💾 **批次匯出** - 一次下載所有剪輯片段
- 🔒 **完全離線** - 所有處理在瀏覽器完成，不上傳任何檔案

## 🚀 線上使用

直接訪問：**[https://ssamexy.github.io/audio-loop-editor/](https://ssamexy.github.io/audio-loop-editor/)**

## 📖 使用方式

1. **上傳音訊** - 點擊或拖曳 MP3/WAV/OGG 等音訊檔案
2. **設定分段** - 手動新增或使用自動切分功能
3. **調整時間** - 使用 +/- 按鈕微調或直接輸入時間
4. **試播放** - 點擊 ▶ 按鈕預覽每個段落
5. **匯出** - 點擊「開始剪輯」下載所有段落

## 🎯 適用場景

- 🎸 **樂器練習** - 將樂曲分段反覆練習
- 🎤 **歌唱練習** - 分段練習困難段落
- 🎧 **聽力訓練** - 反覆聆聽特定片段
- 📚 **語言學習** - 分段練習聽力材料

## 🔧 技術說明

- **Web Audio API** - 音訊處理與播放
- **Canvas API** - 波形視覺化
- **File API** - 檔案讀取與下載
- **純前端** - 無需伺服器，完全在瀏覽器運行

### 瀏覽器支援

| 瀏覽器 | 最低版本 |
|--------|:--------:|
| Chrome | 60+ |
| Firefox | 55+ |
| Safari | 14+ |
| Edge | 79+ |

## 🔒 隱私保護

✅ 所有處理都在您的瀏覽器中完成  
✅ 不會上傳任何檔案到伺服器  
✅ 無需註冊或登入  
✅ 完全免費使用

## 📁 專案結構

```
audio-loop-editor/
├── index.html          # 主頁面
├── css/
│   └── style.css       # 樣式表
├── js/
│   ├── time-utils.js       # 時間工具
│   ├── segment-manager.js  # 段落管理
│   ├── audio-processor.js  # 音訊處理
│   ├── ui-controller.js    # UI 控制
│   └── app.js              # 主程式
├── README.md           # 說明文件
└── LICENSE             # MIT 授權
```

## 🛠 本地開發

```bash
# 克隆專案
git clone https://github.com/ssamexy/audio-loop-editor.git
cd audio-loop-editor

# 啟動本地伺服器
python -m http.server 8000
# 或
npx http-server

# 訪問 http://localhost:8000
```

## 📄 授權

MIT License - 自由使用與修改

## 🔗 相關連結

- [線上 Demo](https://ssamexy.github.io/audio-loop-editor/)
- [問題回報](https://github.com/ssamexy/audio-loop-editor/issues)

---

**Made with ❤️ using Web Audio API**
