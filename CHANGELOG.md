# Changelog

All notable changes to the "Audio Loop Editor" project will be documented in this file.

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
