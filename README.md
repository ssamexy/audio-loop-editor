# 🎵 Audio Loop Editor

[繁體中文](#繁體中文) | [English](#english)

---

## 繁體中文

**音訊分段剪輯與循環練習工具** - 專為音樂練習設計

[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-blue)](https://ssamexy.github.io/audio-loop-editor/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

### ✨ 功能特色

- 🎯 **毫秒精度剪輯** - 精確到毫秒的時間控制 (`MM:SS.mmm`)，支援連續快速標註 (`Start -> Continue -> Finish`)
- 📋 **多段落管理** - 支援多段落同時編輯與階層式子段落
- ⏱️ **長度提示** - 滑鼠懸停於段落名稱可查看精確時長
- ▶️ **即時試播放** - 點擊播放按鈕即可預覽每個片段
- ⚡ **自動切分** - 一鍵將音訊平均分割成多段
- 📥 **JSON 匯入/匯出** - 儲存與載入分段設定；匯入 YouTube Looper 時依音樂時間軸推導父子階層，並支援使用 ↕ 手把拖曳排序
- 💾 **批次匯出** - 一次下載所有剪輯片段 (WAV/MP3)
- 🔗 **音訊合併** - 將多個音訊檔案合併為一個檔案
- 🎞️ **影片轉音訊** - 直接將影片 (MP4/MOV) 轉為 WAV/MP3 音訊
- 🔄 **循環播放** - 段落循環練習功能
- 🌐 **雙語介面** - 支援繁體中文與英文
- 🔒 **完全離線** - 所有處理在瀏覽器完成，不上傳任何檔案


### 🚀 線上使用

直接訪問：**[https://ssamexy.github.io/audio-loop-editor/](https://ssamexy.github.io/audio-loop-editor/)**

### 📖 使用方式

1. **上傳音訊** - 點擊或拖曳 MP3/WAV/OGG 等音訊檔案
2. **設定分段** - 使用「標註開始/繼續/結束」進行連續剪輯，或使用自動切分功能
3. **調整時間** - 使用 +/- 按鈕微調或直接輸入時間
4. **試播放** - 點擊 ▶ 按鈕預覽每個段落
5. **匯出** - 點擊「開始剪輯」下載所有段落

### 🎯 適用場景

- 🎸 **樂器練習** - 將樂曲分段反覆練習
- 🎤 **歌唱練習** - 分段練習困難段落
- 🎧 **聽力訓練** - 反覆聆聽特定片段
- 📚 **語言學習** - 分段練習聽力材料

### 🔒 隱私保護

✅ 所有處理都在您的瀏覽器中完成  
✅ 不會上傳任何檔案到伺服器  
✅ 無需註冊或登入  
✅ 完全免費使用

---

## English

**Audio Segment Editor for Loop Practice** - Designed for music practice

[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-blue)](https://ssamexy.github.io/audio-loop-editor/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

### ✨ Features

- 🎯 **Millisecond Precision** - Accurate time control (`MM:SS.mmm`) with continuous marking flow (`Start -> Continue -> Finish`)
- 📋 **Multi-segment Management** - Edit multiple segments with hierarchical sub-segments
- ⏱️ **Duration Tooltip** - Hover over segment name to view precise duration
- ▶️ **Instant Preview** - Click play to preview each segment
- ⚡ **Auto Split** - One-click split audio into equal parts
- 📥 **JSON Import/Export** - Save and load segment settings; YouTube Looper imports infer parent/child hierarchy from the music timeline and segments can be reordered with the dedicated ↕ handle
- 💾 **Batch Export** - Download all segments at once (WAV/MP3)
- 🔗 **Audio Merging** - Combine multiple audio files into one
- 🎞️ **Video to Audio** - Convert video files (MP4/MOV) to WAV/MP3 audio directly
- 🔄 **Loop Playback** - Segment loop practice mode
- 🌐 **Bilingual UI** - Supports Traditional Chinese and English
- 🔒 **Fully Offline** - All processing done in browser, no file uploads


### 🚀 Try It Online

Visit: **[https://ssamexy.github.io/audio-loop-editor/](https://ssamexy.github.io/audio-loop-editor/)**

### 📖 How to Use

1. **Upload Audio** - Click or drag MP3/WAV/OGG files
2. **Create Segments** - Use "Mark Start/Continue/Finish" for continuous editing, or auto-split
3. **Adjust Time** - Use +/- buttons or type time directly
4. **Preview** - Click ▶ to preview each segment
5. **Export** - Click "Start Processing" to download all segments

### 🎯 Use Cases

- 🎸 **Instrument Practice** - Practice difficult sections repeatedly
- 🎤 **Vocal Training** - Work on challenging vocal parts
- 🎧 **Listening Training** - Repeat specific sections
- 📚 **Language Learning** - Practice listening materials

### 🔒 Privacy

✅ All processing is done in your browser  
✅ No files are uploaded to any server  
✅ No registration required  
✅ Completely free to use

---

## 🔧 Technical Details

- **Web Audio API** - Audio processing and playback
- **File API** - File reading and downloading
- **Client-side Only** - No server required

### Browser Support

| Browser | Minimum Version |
|---------|:---------------:|
| Chrome  | 60+ |
| Firefox | 55+ |
| Safari  | 14+ |
| Edge    | 79+ |

## 🛠 Local Development

```bash
# Clone the repository
git clone https://github.com/ssamexy/audio-loop-editor.git
cd audio-loop-editor

# Start local server
python -m http.server 8000
# or
npx http-server

# Visit http://localhost:8000
```

## 📄 License

MIT License - Free to use and modify

## 🔗 Links

- [Live Demo](https://ssamexy.github.io/audio-loop-editor/)
- [Changelog](./changelog.md)
- [Report Issues](https://github.com/ssamexy/audio-loop-editor/issues)

---

**Made with ❤️ using Web Audio API**
