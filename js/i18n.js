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
            'upload_prompt': '點擊或拖曳音訊檔案到此處',
            'upload_hint': '支援 MP3, WAV, OGG, M4A 等格式',
            'loading': '載入中...',
            'play_main': '▶ 播放',

            // Settings
            'settings': '⚙️ 設定',
            'step_size': '時間微調刻度 (毫秒):',
            'auto_split': '自動切分:',
            'segments': '段',
            'other': '其他...',

            // Segments
            'segment_list': '📋 分段列表',
            'id': '編號',
            'segment_name': '段落名稱',
            'start_time': '開始時間',
            'end_time': '結束時間',
            'actions': '操作',
            'add_segment': '➕ 新增段落',
            'import_settings': '📥 匯入段落設定',
            'export_settings': '📤 匯出段落設定',
            'clear_all': '🗑 清除全部',

            // Export
            'export_title': '💾 匯出設定',
            'export_mp3': '輸出為 MP3 (取消勾選則為 WAV)',
            'download_zip': '打包成 ZIP (取消勾選則個別下載)',
            'keep_original': '同時保留完整版本',
            'start_process': '🎵 開始剪輯',
            'preparing': '準備中...',
            'packing_zip': '正在打包 ZIP...',

            // Floating Player
            'main_audio': '主音訊',
            'segment_prefix': '段落: ',
            'segment_only': '僅段落',

            // Buttons
            'add_sub': '+子',
            'add_sub_title': '新增子段落',
            'delete_title': '刪除',
            'disclaimer': '免責聲明',

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
            'split_invalid': '請輸入 2-100 之間的數字'
        },
        'en': {
            // Header
            'app_title': '🎵 Audio Loop Editor',
            'app_subtitle': 'Audio segment editor for loop practice - millisecond precision, multi-segment, preview',

            // File Upload
            'select_audio': '📁 Select Audio File',
            'upload_prompt': 'Click or drag audio file here',
            'upload_hint': 'Supports MP3, WAV, OGG, M4A formats',
            'loading': 'Loading...',
            'play_main': '▶ Play',

            // Settings
            'settings': '⚙️ Settings',
            'step_size': 'Time adjustment step (ms):',
            'auto_split': 'Auto split:',
            'segments': 'seg',
            'other': 'Other...',

            // Segments
            'segment_list': '📋 Segment List',
            'id': 'ID',
            'segment_name': 'Segment Name',
            'start_time': 'Start Time',
            'end_time': 'End Time',
            'actions': 'Actions',
            'add_segment': '➕ Add Segment',
            'import_settings': '📥 Import Settings',
            'export_settings': '📤 Export Settings',
            'clear_all': '🗑 Clear All',

            // Export
            'export_title': '💾 Export Settings',
            'export_mp3': 'Export as MP3 (uncheck for WAV)',
            'download_zip': 'Bundle as ZIP (uncheck for individual)',
            'keep_original': 'Also keep full version',
            'start_process': '🎵 Start Processing',
            'preparing': 'Preparing...',
            'packing_zip': 'Creating ZIP...',

            // Floating Player
            'main_audio': 'Main Audio',
            'segment_prefix': 'Segment: ',
            'segment_only': 'Segment Only',

            // Buttons
            'add_sub': '+Sub',
            'add_sub_title': 'Add Sub-segment',
            'delete_title': 'Delete',
            'disclaimer': 'Disclaimer',

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
            'split_invalid': 'Enter a number between 2-100'
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
