/**
 * Internationalization (i18n) Module
 * Supports Traditional Chinese (zh-TW) and English (en)
 */

const i18n = {
    currentLang: 'zh-TW',

    translations: {
        'zh-TW': {
            // Header
            'app_title': '🎵 Audio Loop Editor',
            'app_subtitle': '音訊分段剪輯與循環練習工具 - 支援毫秒精度、多段剪輯、試播放',

            // File Upload
            'select_audio': '📁 選擇音訊檔案',
            'select_video': '🎬 選擇影片檔案',
            'upload_prompt': '點擊或拖曳音訊檔案到此處',
            'video_upload_prompt': '點擊或拖曳影片檔案到此處 (MP4, WEBM, MOV...)',
            'audio_convert_upload_prompt': '點擊或拖曳音訊檔案到此處 (MP3, WAV, OGG, M4A...)',
            'upload_hint': '支援 MP3, WAV, OGG, M4A 等格式',
            'drop_json_hint': '將 JSON 設定檔拖曳至此處可快速匯入',
            'drop_json_to_import': '放開以匯入設定檔',
            'loading': '載入中...',
            'play_main': '▶ 播放',

            // Settings
            'settings': '⚙️ 設定',
            'step_size': '時間微調刻度 (秒):',
            'auto_split': '自動切分:',
            'segments': '段',
            'other': '其他...',
            'confirm_import': '是否匯入設定檔？這將覆蓋現有段落。',
            'import_failed': '匯入失敗: {error}',
            'processing_wait': '⏳ 剪輯中請稍等...',
            'main_tools': '主音樂工具:',
            'split_main_cursor': '📍 主音樂二分',
            'mark_start': '🚩 標註開始',
            'mark_continue': '⏩ 繼續',
            'mark_finish': '🏁 結束',
            'mark_end': '🏁 標註結束',
            'error_time_order': '結束時間必須大於開始時間',
            'overwrite_warning': '這將會清除所有現有段落並重新切分，確定嗎？',
            'marking_start_time': '已標註開始: {time}',
            'sub_menu_split_child': '↳ 二分為子段落 (保留此層)',
            'sub_menu_split_sibling': '✂️ 同層切分 (取代此層)',

            // Merge
            'merge_title': '🔗 合併音訊',
            'merge_upload_prompt': '點擊或拖曳多個音訊檔案到此處',
            'merge_preview': '▶ 試聽',
            'merge_fail': '合併失敗: {error}',
            'merge_success': '合併成功！',
            'remove_file': '移除檔案',
            'filename_placeholder': '合併檔名 (無副檔名)',
            'merge_error_min_files': '請至少選擇兩個音訊檔案',
            'merge_error_min_files': '請至少選擇兩個音訊檔案',
            'preview_segment': '試聽片段',
            'merge_process': '🔗 合併並匯出',

            // Video Converter
            'video_convert_title': '🎞️ 影片轉音訊',
            'video_convert_desc': '將影片檔案轉換為 WAV 或 MP3 音訊檔',
            'audio_convert_title': '🎵 音訊格式轉換',
            'convert_process': '🔄 開始轉換',
            'convert_success': '轉換成功！',
            'video_file_too_large': '⚠️ 影片檔案較大，解碼可能需要一些時間，請耐心等待',
            'mp3_wait_hint': '（壓縮為 MP3 需要較多時間，請耐心等待）',

            // Feature Sections
            'feature_split_title': '✂️ 音樂分段剪輯 ★ 強力推薦',
            'feature_merge_title': '🔗 音樂合併工具',
            'feature_converter_title': '🎞️ 影片轉音訊工具',
            'feature_audio_converter_title': '🎵 音訊格式轉換工具',

            // Navigation
            'nav_splitter': '剪輯工具',
            'nav_merger': '合併工具',
            'nav_video_converter': '影片轉檔',
            'nav_audio_converter': '音訊轉檔',

            // Manual
            'manual_title': '📖 使用說明',
            'manual_content': `
                <h3>1. 音樂分段剪輯 (Audio Splitter) ⭐ 核心主要功能</h3>
                <ul>
                    <li><strong>核心功能</strong>：這是本工具最精華的部分，提供毫秒級的音訊標註與分段。</li>
                    <li><strong>載入音訊</strong>：點擊或拖曳 MP3/WAV 檔案至上傳區。</li>
                    <li><strong>精確剪輯</strong>：使用「標註開始」記錄起點，接著點擊「繼續」可連續標註多段，最後點擊「結束」完成。</li>
                    <li><strong>時間微調</strong>：使用 +/- 按鈕進行毫秒級微調，步進大小可在設定中調整。</li>
                    <li><strong>自動切分</strong>：支援將音訊等分為 2-6 段，或點擊「其他」自訂數量。</li>
                    <li><strong>子段落</strong>：點擊「+子」按鈕，可依播放位置或時間單位快速建立階層式段落。</li>
                    <li><strong>查看長度</strong>：滑鼠懸停於段落名稱上方，即可顯示該段落的時間長度。</li>
                </ul>
                <h3>2. 音樂合併工具 (Audio Merger)</h3>
                <ul>
                    <li><strong>批次上傳</strong>：一次選擇多個檔案，或逐一拖入合併區。</li>
                    <li><strong>調整順序</strong>：直接在列表中<strong>拖曳排序</strong>，預覽合併後的動線。</li>
                    <li><strong>試聽片段</strong>：點擊「▶」可單獨試聽該片段，確認無誤後再合併。</li>
                    <li><strong>自訂檔名</strong>：輸入匯出名稱，點擊「合併並匯出」即可完成。</li>
                </ul>
                <h3>3. 影片轉音訊 (Video to Audio)</h3>
                <ul>
                    <li><strong>影片支援</strong>：支援 MP4, MOV, WEBM 等常見影片格式。</li>
                    <li><strong>快速轉換</strong>：載入影片後，選擇輸出為 MP3 或 WAV，直接提取音軌。</li>
                </ul>
                <h3>4. 音訊格式轉換 (Audio Converter)</h3>
                <ul>
                    <li><strong>格式支援</strong>：支援 M4A, OGG, FLAC, AAC 等多種音訊格式。</li>
                    <li><strong>通用輸出</strong>：快速將不常見格式轉換為通用的 MP3 或 WAV 格式以便練習。</li>
                </ul>
                <h3>💡 操作小秘訣</h3>
                <ul>
                    <li><strong>快捷鍵</strong>：空白鍵 (播放/暫停)、左右方向鍵 (快進/退)。</li>
                    <li><strong>循環練習</strong>：開啟「🔁 循環播放」與「僅段落」模式，可反覆練習特定難點。</li>
                </ul>
            `,

            // Segments
            'segment_list': '📋 分段列表',
            'id': '編號',
            'segment_name': '段落名稱',
            'segment_label': '段落',
            'start_time': '開始時間',
            'end_time': '結束時間',
            'actions': '操作',
            'add_segment': '➕ 新增段落',
            'import_settings': '📥 匯入段落設定',
            'export_settings': '📤 匯出段落設定',
            'clear_all': '🗑 清除全部',
            'select_audio_file': '請選擇音訊檔案',

            // Export
            'export_title': '💾 匯出設定',
            'export_mp3': '輸出為 MP3 (取消勾選則為 WAV)',
            'download_zip': '打包成 ZIP (取消勾選則個別下載)',
            'keep_original': '同時保留完整版本',
            'mp3_slow_note': '💡 MP3 編碼需要較長時間，這是正常的',
            'start_process': '🎵 開始剪輯',
            'preparing': '準備中...',
            'packing_zip': '正在打包 ZIP...',

            // Floating Player
            'main_audio': '主音訊',
            'segment_prefix': '段落: ',
            'segment_only': '僅段落',
            'pause': '暫停',
            'rewind': '倒退 {s} 秒',
            'forward': '前進 {s} 秒',
            'seek_setting': '快進/退 (秒)',

            // File Details
            'duration': '長度',
            'sample_rate': '取樣率',
            'channels': '聲道',
            'memory_warning': '⚠️ 提醒：音訊檔案越大，記憶體佔用越多',

            // Buttons
            'add_sub': '+子',
            'add_sub_title': '新增子段落',
            'delete_title': '刪除',
            'disclaimer': '免責聲明',
            'cancel': '取消',

            // Sub-segment Menu
            'sub_menu_title': '新增子段落方式',
            'split_position': '📍 從當前播放位置二分',
            'split_unit': '⏱️ 依時間單位切分...',
            'split_evenly': '🔢 平均分為 N 段...',

            // Footer
            'footer_desc': '專為音樂練習設計的分段剪輯工具',
            'footer_privacy': '所有處理都在您的瀏覽器中完成，不會上傳任何檔案',

            // Alerts
            'confirm_delete': '確定要刪除段落 {id} 嗎？',
            'confirm_clear': '確定要清除所有 {count} 個段落嗎？',
            'confirm_split': '將清除現有 {count} 個段落並自動切分為 {num} 段。\n\n是否繼續？',
            'confirm_process': '將剪輯 {count} 個段落',
            'keep_full_version': '\n同時保留完整版本',
            'continue_prompt': '\n\n是否繼續？',
            'no_audio': '請先載入音訊檔案',
            'no_segments': '請新增至少一個段落',
            'no_export': '沒有段落可以匯出',
            'segment_error': '段落設定有誤:\n',
            'success': '處理完成！\n成功: {success}\n失敗: {failed}',
            'import_success': '成功匯入 {count} 個段落',
            'id_empty': '編號不能為空',
            'id_duplicate': '此編號已存在，請使用其他編號',
            'enter_segments': '請輸入要切分的段落數量 (2-100):',
            'enter_unit': '請輸入每段時長 (秒):',
            'enter_even': '請輸入要平分的段落數量 (2-20):',
            'move_to_range': '請先將播放位置移動到此段落範圍內',
            'unit_invalid': '時長需大於 0 且小於段落總長',
            'even_invalid': '請輸入 2-20 之間的數字',
            'split_invalid': '請輸入 2-100 之間的數字',
            'unlock_ids': '解鎖編號',
            'lock_ids': '鎖定編號',
            'drag_to_reorder': '拖曳以排序',
            'processing_segment_mp3': '處理段落 {id} (MP3 壓縮: {progress}%)...'
        },
        'en': {
            // Header
            'app_title': '🎵 Audio Loop Editor',
            'app_subtitle': 'Audio segment editor for loop practice - millisecond precision, multi-segment, preview',

            // File Upload
            'select_audio': '📁 Select Audio File',
            'select_video': '🎬 Select Video File',
            'upload_prompt': 'Click or drag audio file here',
            'video_upload_prompt': 'Click or drag video file here (MP4, WEBM...)',
            'audio_convert_upload_prompt': 'Click or drag audio file here (MP3, WAV, OGG, M4A...)',
            'upload_hint': 'Supports MP3, WAV, OGG, M4A formats',
            'drop_json_hint': 'Drag JSON settings file here to import',
            'drop_json_to_import': 'Drop to import settings',
            'loading': 'Loading...',
            'play_main': '▶ Play',

            // Settings
            'settings': '⚙️ Settings',
            'step_size': 'Time adjustment step (sec):',
            'auto_split': 'Auto split:',
            'segments': 'seg',
            'other': 'Other...',
            'confirm_import': 'Import settings? This will replace existing segments.',
            'import_failed': 'Import failed: {error}',
            'processing_wait': '⏳ Processing, please wait...',

            // Segments
            'segment_list': '📋 Segment List',
            'id': 'ID',
            'segment_name': 'Segment Name',
            'segment_label': 'Segment',
            'start_time': 'Start Time',
            'end_time': 'End Time',
            'actions': 'Actions',
            'add_segment': '➕ Add Segment',
            'import_settings': '📥 Import Settings',
            'export_settings': '📤 Export Settings',
            'clear_all': '🗑 Clear All',
            'select_audio_file': 'Please select an audio file',

            // Export
            'export_title': '💾 Export Settings',
            'export_mp3': 'Export as MP3 (uncheck for WAV)',
            'download_zip': 'Bundle as ZIP (uncheck for individual)',
            'keep_original': 'Also keep full version',
            'mp3_slow_note': '💡 MP3 encoding takes longer, this is normal',
            'start_process': '🎵 Start Processing',
            'preparing': 'Preparing...',
            'packing_zip': 'Creating ZIP...',

            // Floating Player
            'main_audio': 'Main Audio',
            'segment_prefix': 'Segment: ',
            'segment_only': 'Segment Only',
            'pause': 'Pause',
            'rewind': 'Rewind {s}s',
            'forward': 'Forward {s}s',
            'seek_setting': 'Seek Step(s)',

            // File Details
            'duration': 'Duration',
            'sample_rate': 'Sample Rate',
            'channels': 'Channels',
            'memory_warning': '⚠️ Note: Larger audio files use more memory',

            // Buttons
            'add_sub': '+Sub',
            'add_sub_title': 'Add Sub-segment',
            'delete_title': 'Delete',
            'disclaimer': 'Disclaimer',
            'cancel': 'Cancel',

            // Sub-segment Menu
            'sub_menu_title': 'Add Sub-segment Options',
            'split_position': '📍 Split at current position',
            'split_unit': '⏱️ Split by time unit...',
            'split_evenly': '🔢 Split into N parts...',
            'main_tools': 'Main Audio Tools:',
            'split_main_cursor': '📍 Split Main Audio Here',
            'mark_start': '🚩 Mark Start',
            'mark_continue': '⏩ Cont.',
            'mark_finish': '🏁 Finish',
            'mark_end': '🏁 Mark End',
            'error_time_order': 'End time must be greater than start time',
            'overwrite_warning': 'This will clear all segments and split. Confirm?',
            'marking_start_time': 'Marked Start: {time}',
            'sub_menu_split_child': '↳ Split into Sub-segments (Keep Parent)',
            'sub_menu_split_sibling': '✂️ Split Here (Replace Parent)',

            // Merge
            'merge_title': '🔗 Merge Audio',
            'merge_upload_prompt': 'Click or drag multiple audio files here',
            'merge_preview': '▶ Preview',
            'merge_fail': 'Merge Failed: {error}',
            'merge_success': 'Merge Successful!',
            'remove_file': 'Remove File',
            'filename_placeholder': 'Filename (no ext)',
            'merge_error_min_files': 'Please select at least two audio files',
            'preview_segment': 'Preview Segment',
            'merge_process': '🔗 Merge and Export',

            // Video Converter
            'video_convert_title': '🎞️ Video to Audio',
            'video_convert_desc': 'Convert video files to WAV or MP3 audio',
            'audio_convert_title': '🎵 Audio Format Converter',
            'convert_process': '🔄 Start Conversion',
            'convert_success': 'Conversion Successful!',
            'video_file_too_large': '⚠️ Video files may be large, decoding might take time.',
            'mp3_wait_hint': '(MP3 encoding takes more time, please wait patiently)',

            // Feature Sections
            'feature_split_title': '✂️ Audio Splitter ★ Flagship',
            'feature_merge_title': '🔗 Audio Merger',
            'feature_converter_title': '🎞️ Video Converter',
            'feature_audio_converter_title': '🎵 Audio Converter',

            // Navigation
            'nav_splitter': 'Splitter',
            'nav_merger': 'Merger',
            'nav_video_converter': 'Video to Audio',
            'nav_audio_converter': 'Audio Converter',

            // Manual
            'manual_title': '📖 User Manual',
            'manual_content': `
                <h3>1. Audio Splitter ⭐ Flagship Feature</h3>
                <ul>
                    <li><strong>Main Feature</strong>: This is the core of our tool, offering millisecond-precision audio marking and segmenting.</li>
                    <li><strong>Load Audio</strong>: Drag and drop MP3/WAV files to start.</li>
                    <li><strong>Precise Editing</strong>: Use "Mark Start" to begin, "Continue" to mark consecutive segments, and "Finish" to end.</li>
                    <li><strong>Time Fine-tuning</strong>: Use +/- buttons (Step size adjustable in Settings).</li>
                    <li><strong>Auto Split</strong>: Divide audio into 2-6 parts or custom amounts.</li>
                    <li><strong>Sub-segments</strong>: Create hierarchical sections via current position or time units.</li>
                    <li><strong>Duration Tooltip</strong>: Hover over the segment name to see its duration.</li>
                </ul>
                <h3>2. Audio Merger</h3>
                <ul>
                    <li><strong>Batch Upload</strong>: Load multiple files at once.</li>
                    <li><strong>Reorder</strong>: Use <strong>drag & drop</strong> to sort segments.</li>
                    <li><strong>Preview</strong>: Click "▶" to preview individual files before merging.</li>
                    <li><strong>Custom Filename</strong>: Name your project before exporting.</li>
                </ul>
                <h3>3. Video to Audio</h3>
                <ul>
                    <li><strong>Formats</strong>: Supports MP4, MOV, WEBM, etc.</li>
                    <li><strong>One-click</strong>: Extract high-quality WAV/MP3 from any video file.</li>
                </ul>
                <h3>4. Audio Converter</h3>
                <ul>
                    <li><strong>Cross-format</strong>: Convert M4A, OGG, FLAC to standard MP3/WAV.</li>
                </ul>
                <h3>💡 Pro Tips</h3>
                <ul>
                    <li><strong>Shortcuts</strong>: Space (Play/Pause), Left/Right Arrows (Seek).</li>
                    <li><strong>Loop Practice</strong>: Enable "🔁 Loop" and "Segment Only" to master difficult parts.</li>
                </ul>
            `,

            // Footer
            'footer_desc': 'Audio segment editor designed for music practice',
            'footer_privacy': 'All processing is done in your browser, no files are uploaded',

            // Alerts
            'confirm_delete': 'Delete segment {id}?',
            'confirm_clear': 'Clear all {count} segments?',
            'confirm_split': 'This will clear {count} segments and auto-split into {num} segments.\n\nContinue?',
            'confirm_process': 'Will process {count} segments',
            'keep_full_version': '\nAlso keep full version',
            'continue_prompt': '\n\nContinue?',
            'no_audio': 'Please load an audio file first',
            'no_segments': 'Please add at least one segment',
            'no_export': 'No segments to export',
            'segment_error': 'Segment settings error:\n',
            'success': 'Done!\nSuccess: {success}\nFailed: {failed}',
            'import_success': 'Imported {count} segments',
            'id_empty': 'ID cannot be empty',
            'id_duplicate': 'This ID already exists',
            'enter_segments': 'Enter number of segments (2-100):',
            'enter_unit': 'Enter duration per segment (seconds):',
            'enter_even': 'Enter number of equal parts (2-20):',
            'move_to_range': 'Move playback position to this segment range first',
            'unit_invalid': 'Duration must be greater than 0 and less than total length',
            'even_invalid': 'Enter a number between 2-20',
            'split_invalid': 'Enter a number between 2-100',
            'unlock_ids': 'Unlock IDs',
            'lock_ids': 'Lock IDs',
            'drag_to_reorder': 'Drag to reorder',
            'processing_segment_mp3': 'Processing segment {id} (MP3 compression: {progress}%)...'
        }
    },

    /**
     * Initialize i18n with browser language detection
     */
    init() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('zh')) {
            this.currentLang = 'zh-TW';
        } else {
            this.currentLang = 'en';
        }
        this.applyTranslations();
    },

    /**
     * Get translation for a key
     */
    t(key, params = {}) {
        let text = this.translations[this.currentLang][key] || this.translations['en'][key] || key;
        // Replace placeholders like {id}, {count}
        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });
        return text;
    },

    /**
     * Switch language
     */
    setLang(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.applyTranslations();
            localStorage.setItem('audioLoopEditor_lang', lang);
            if (this.onLangChange) this.onLangChange(lang);
        }
    },

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = this.t(key);
            } else {
                el.textContent = this.t(key);
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });

        // Update active state of language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const langCode = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
            if (langCode === this.currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
};

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved preference
    const savedLang = localStorage.getItem('audioLoopEditor_lang');
    if (savedLang && i18n.translations[savedLang]) {
        i18n.currentLang = savedLang;
    }
    i18n.init();
});
