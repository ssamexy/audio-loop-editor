# Changelog

All notable changes to the "Audio Loop Editor" project will be documented in this file.


## [v1.7.4] - 2026-01-27

### Fixed
- **Player UI (Mobile)**: Optimized the player bar to align playback buttons and settings (speed, step, mode) side-by-side on the second row for a more compact experience.
- **Player UI (Desktop)**: Restored the flat horizontal layout to match the pre-v1.6.0 style (specifically v1.5.8).

## [v1.7.3] - 2026-01-27

### Fixed
- **Player UI**: Restored the desktop audio player bar to its original single horizontal row layout. Condensed the mobile player bar into an ultra-compact 2-row layout.
- **Documentation**: Updated README with latest feature set and versioning.

## [v1.7.2] - 2026-01-27

### Fixed
- **Responsiveness**: Standardized layout behavior across all sections. The "Splitter" section now switches to a **Card Layout** on mobile devices to prevent content cutoff. Video/Audio converter controls now wrap properly on smaller screens.

## [v1.7.1] - 2026-01-27

### Fixed
- **Mobile Layout**: Fixed issue where header and section titles were cut off on the right side on mobile devices by adjusting container padding and overflow handling.

## [v1.7.0] - 2026-01-27

### Optimized
- **MP3 Export**: Moved MP3 encoding process to a Web Worker, preventing the browser from freezing ("Page Not Responding") during large file exports.
- **Mobile UX**: Redesigned the floating player bar for mobile devices to be ultra-compact (2 rows), significantly increasing visible content area.
- **User Feedback**: Added "Please wait" hints for MP3 export to manage user expectations.

## [v1.6.0] - 2026-01-26

### Added
- **Video to Audio**: New feature to convert video files (MP4, MOV, etc.) to WAV or MP3 audio directly in the browser.
- **UI Structure**: Restructured the application into three distinct, easy-to-use sections: "Audio Splitter", "Audio Merger", and "Video Converter".

### Changed
- **Layout**: Main functionality screens are now stacked top-to-bottom with clear section headers for better navigation.


### Added
- **Merge Improvements**:
    - **Individual Segment Preview**: Added play button "▶" to preview specific segments in the merge list.
    - **Time Range Display**: Shows the start and end time of each segment in the final merged sequence (e.g., `00:00 - 00:15`).
    - **Custom Filename**: Added input field to specify the output filename (default: `merged_audio`).
- **Translations**: Added new localized strings for merge features.

### Improved
- **Memory Optimization**: Implemented specific `release()` method in AudioProcessor to free up memory immediately after merge processing.

## [v1.5.8] - 2026-01-26

### Added
- **Merge Preview**: Added play button to preview merged audio before downloading.
- **Drag & Drop Reordering**: Support reordering files in the merge list via drag and drop.

### Optimized
- **Memory Usage**: Implemented strict memory release logic during large file operations to prevent crashes.

## [v1.5.7] - 2026-01-26

### Added
- **Merge Feature**: New "Merge Audio" section to combine multiple audio files into one and export as MP3/WAV.
- **User Manual**: Added a Help (❓) button in the header that opens a friendly user manual.
- **UI Layout**: Reordered player controls to `Play | Rewind | Forward | Loop` for better ergonomics.

## [v1.5.6] - 2026-01-26

### Added
- **Audio Controls**: Added standard Rewind (⏪) and Forward (⏩) buttons to the player bar.
- **Seek Settings**: Added a dropdown menu to customize the seek step (2s, 5s, 10s, 20s, 30s, 60s), defaulting to 10s.
- **Keyboard Shortcuts**: Implemented keyboard shortcuts for better control: `Space` (Play/Pause), `Left Arrow` (Rewind), `Right Arrow` (Forward).

## [v1.5.5] - 2026-01-22

### Changed
- **UI 優化**: 在子段落選單中，為「依時間單位切分」與「平均分為 N 段」也加上了「二分為子段落」的說明標籤，使操作邏輯更一致。

## [v1.5.4] - 2026-01-22

### Fixed
- **多語系切換**: 修復了各段落中的「+子」按鈕在語言切換後不會更新的問題。
- **三級段落優化**: 支援第三級段落的「+子」按鈕選單（限制僅支援同層切分），並加大第三級段落的右移縮排，使層級更分明。

### Changed
- **UI 優化**: 在電腦版網頁模式下加大各項操作按鈕（微調按鈕、播放、刪除等），提升點擊準確度與使用體驗。

## [v1.5.3] - 2026-01-22

### Fixed
- **同層切分 (Sibling Split)**: 修復了在第二級或第三級段落執行時會跳回第一級編號的錯誤。現在會維持在相同層級並自動尋找下一個可用編號。
- **層級限制**: 增加最大層級限制為 3 層（如 1-1-1），超過此層級將不再顯示「新增子段落」按鈕。

## [v1.5.2] - 2026-01-22

### Refactored
- **Codebase Overhaul**: Refactored `app.js` and `ui-controller.js`. Encapsulated application logic into a centralized `AppController` class to improve maintainability and debugging.
- **Dependency Management**: Decoupled `UIController` from global scope functions, now using strict callback interfaces.
- **Feature Temporarily Disabled**: Temporarily disabled the visual seek bar markers for "Mark Start/End" due to layout issues, while keeping the marking functionality itself intact.

## [v1.5.1] - 2026-01-22

### Fixed
- **Split Main Audio**: Fixed NaN error for segment duration and missing bilingual support in confirmation dialog.
- **Mark Start**: Fixed marker position issue caused by invalid duration calculation.
- **UI Layout**: Fixed position of Main Audio Tools buttons (forced next to each other).

## [v1.5.0] - 2026-01-22

### Added
- **主音樂工具 (Main Audio Tools)**:
  - 新增「主音樂二分」按鈕，可從當前位置將主音樂切分為兩段 (重置現有段落)。
  - 新增「標註開始/結束」按鈕，可透過兩次點擊手動標註段落範圍，並在進度條上顯示標記線。
- **子段落切分 (Sub-segment Split)**:
  - 新增「同層切分 (Sibling Split)」選項，將當前段落切分為兩個同級段落 (取代原段落)。
- **Visual Improvements**:
  - 新增 `.seek-marker` 樣式，用於顯示標註起始點。

### Fixed
- **UI UX**: Remove number input spinners from step size setting.
- **Mobile Layout**: Force 2-row layout for floating player bar on mobile devices.

## [v1.4.9] - 2026-01-22

### Changed
- **Mobile Player Bar**: Redesigned the floating player bar on mobile to use 2 rows - seek bar on top, controls on bottom - for better usability.
- **Step Size Display**: Fixed the default step size to display as "1" (second) instead of "1000" (milliseconds).
- **Mobile Button Sizes**: Ensured all player control buttons maintain 48x48px touch targets on mobile.

## [v1.4.8] - 2026-01-22

### Added
- **MP3 Progress Visuals**: Added a progress bar and status message ("Duration: ...", "Processing...") during MP3 export to prevent users from thinking the app froze.
- **Drag & Drop Import**: Users can now drag and drop JSON settings files directly into the segment list area to import segments.
- **Improved Step Size Controls**: Changed the default time adjustment unit from milliseconds to seconds (0.5s, 1s, 2s) for easier coarse tuning, while keeping fine-tuning available.
- **Bilingual Popups**: fully internationalized all popup messages including import confirmation, delete all confirmation, and sub-segment options.

### Changed
- **Default Behavior**: The app no longer automatically creates an empty "Segment 1" upon loading an audio file, keeping the workspace clean.
- **Process Button**: The "Start Processing" button now changes text to indicate it is working and disables itself to prevent double-clicks.

## [v1.4.7] - 2026-01-21

### Fixed
- **Memory Optimization**: Improved handling of large audio files and added a warning message about memory usage.
- **i18n Coverage**: Fixed missing translations for file details (duration, sample rate), sub-segment menu, and popup alerts.
- **Play Button Logic**: Fixed the main play button to correctly toggle between Play and Pause states instead of always restarting.

### Added
- **Sub-segment Menu**: Added a dedicated menu for creating sub-segments with options to split at position, by time unit, or evenly.

## [v1.0.0] - Initial Release
- Basic features: Audio loading, waveform visualization, segment editing, MP3/WAV export.
