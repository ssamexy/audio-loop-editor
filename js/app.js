/**
 * Main Application - 主應用程式
 * Refactored to use AppController class
 */

class AppController {
    constructor() {
        // Core Managers
        this.segmentManager = null;
        this.audioProcessor = null;
        this.uiController = null;

        // Application State
        this.state = {
            currentFile: null,
            isMarkingStart: false,
            markStartTime: 0,

            // Player State
            isLooping: false,
            isSeeking: false,
            currentSegmentRange: null, // {id, startMs, endMs}
            seekStep: 10 // Default 10s
        };
    }

    /**
     * Initialize Application
     */
    init() {
        this.setupInstances();
        this.setupGlobalListeners();

        // Initialize i18n if available
        if (typeof i18n !== 'undefined' && i18n.init) {
            i18n.onLangChange = () => this.handleLanguageChange();
            i18n.init();
        }
    }

    /**
     * Handle Language Change
     */
    handleLanguageChange() {
        // Update floating player info
        const floatingInfo = document.getElementById('floatingPlayerInfo');
        if (this.state.currentSegmentRange) {
            const segments = this.segmentManager.getSegments();
            const segment = segments.find(s => String(s.id) === String(this.state.currentSegmentRange.id));
            if (segment) {
                const prefix = typeof i18n !== 'undefined' ? i18n.t('segment_prefix') : '段落: ';
                floatingInfo.textContent = prefix + segment.name;
            }
        } else {
            floatingInfo.textContent = typeof i18n !== 'undefined' ? i18n.t('main_audio') : '主音訊';
        }

        // Update Marking Button if active
        if (this.state.isMarkingStart) {
            const btn = document.getElementById('btnMarkSegment');
            const info = document.getElementById('markInfo');
            btn.innerHTML = typeof i18n !== 'undefined' ? i18n.t('mark_end') : '標註結束';
            const infoText = typeof i18n !== 'undefined' ? i18n.t('marking_start_time') : '已標註開始: {time}';
            info.textContent = infoText.replace('{time}', TimeUtils.formatTime(this.state.markStartTime));
        }

        // Update Seek Button Titles
        this.updateSeekButtonTitles();
    }

    /**
     * Setup Manager Instances
     */
    setupInstances() {
        this.segmentManager = new SegmentManager();
        this.audioProcessor = new AudioProcessor();

        // UIController receives callbacks to communicate back to AppController
        this.uiController = new UIController(
            this.segmentManager,
            this.audioProcessor,
            {
                onPlaySegment: (segment) => this.playSegmentInPlayer(segment)
            }
        );

        // Set initial step size
        this.uiController.setStepSize(1000); // 1 second

        // Setup SegmentManager callbacks
        this.segmentManager.onChange = () => this.handleSegmentChange();
    }

    /**
     * Handle Segment Changes
     */
    handleSegmentChange() {
        this.uiController.renderSegments();

        // Check and update segment range if currently playing a segment
        if (this.state.currentSegmentRange && this.state.currentSegmentRange.id) {
            const segments = this.segmentManager.getSegments();
            const currentSegment = segments.find(s => String(s.id) === String(this.state.currentSegmentRange.id));

            if (currentSegment) {
                // Update range to reflect latest segment settings
                this.state.currentSegmentRange.startMs = currentSegment.startMs;
                this.state.currentSegmentRange.endMs = currentSegment.endMs;

                // Update time display
                const totalTimeEl = document.getElementById('totalTime');
                const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;

                if (segmentOnlyMode) {
                    const segmentDuration = currentSegment.endMs - currentSegment.startMs;
                    totalTimeEl.textContent = TimeUtils.formatTimeSeconds(segmentDuration);
                }

                // Check if current playback position is within new range
                const audioPlayer = document.getElementById('audioPlayer');
                const currentMs = audioPlayer.currentTime * 1000;

                if (currentMs < this.state.currentSegmentRange.startMs) {
                    audioPlayer.currentTime = this.state.currentSegmentRange.startMs / 1000;
                } else if (currentMs > this.state.currentSegmentRange.endMs) {
                    audioPlayer.currentTime = this.state.currentSegmentRange.startMs / 1000;
                }
            }
        }
    }

    /**
     * Play Full Audio (Reset Segment Mode)
     */
    playFullAudio() {
        const audioPlayer = document.getElementById('audioPlayer');
        const btnPlayPause = document.getElementById('btnPlayPause');
        const btnPlayMain = document.getElementById('btnPlayMain');
        const totalTimeEl = document.getElementById('totalTime');

        // Clear segment range
        this.state.currentSegmentRange = null;
        document.getElementById('floatingPlayerInfo').textContent = (typeof i18n !== 'undefined' ? i18n.t('main_audio') : '主音訊');

        // Reset all segment play buttons
        document.querySelectorAll('.btn-icon.playing').forEach(btn => {
            btn.textContent = '▶';
            btn.classList.remove('playing');
            btn.classList.add('play');
        });

        // Reset total time display
        if (audioPlayer.duration) {
            totalTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.duration * 1000);
        }

        // Update main play button style
        if (btnPlayMain) {
            btnPlayMain.innerHTML = '⏸ ' + (typeof i18n !== 'undefined' ? i18n.t('play_main').replace('▶ ', '') : '暫停');
        }

        audioPlayer.currentTime = 0;
        audioPlayer.play();
        btnPlayPause.textContent = '⏸';
    }

    /**
     * Toggle Main Audio Play/Pause
     */
    toggleMainAudio() {
        const audioPlayer = document.getElementById('audioPlayer');
        const btnPlayPause = document.getElementById('btnPlayPause');
        const btnPlayMain = document.getElementById('btnPlayMain');
        const totalTimeEl = document.getElementById('totalTime');
        const playText = typeof i18n !== 'undefined' ? i18n.t('play_main').replace('▶ ', '') : '播放';
        const pauseText = typeof i18n !== 'undefined' ? i18n.t('pause') : '暫停';

        // Reset all segment play buttons
        document.querySelectorAll('.btn-icon.playing').forEach(btn => {
            btn.textContent = '▶';
            btn.classList.remove('playing');
            btn.classList.add('play');
        });

        // If currently playing a segment, switch to main audio mode
        if (this.state.currentSegmentRange !== null) {
            this.state.currentSegmentRange = null;
            document.getElementById('floatingPlayerInfo').textContent = typeof i18n !== 'undefined' ? i18n.t('main_audio') : '主音訊';
            if (audioPlayer.duration) {
                totalTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.duration * 1000);
            }
        }

        // Toggle Play/Pause
        if (audioPlayer.paused) {
            audioPlayer.play();
            btnPlayPause.textContent = '⏸';
            if (btnPlayMain) {
                btnPlayMain.innerHTML = '⏸ ' + pauseText;
            }
        } else {
            audioPlayer.pause();
            btnPlayPause.textContent = '▶';
            if (btnPlayMain) {
                btnPlayMain.innerHTML = '▶ ' + playText;
            }
        }
    }

    /**
     * Play specific segment in the floating player
     */
    playSegmentInPlayer(segment) {
        const audioPlayer = document.getElementById('audioPlayer');
        const btnPlayPause = document.getElementById('btnPlayPause');
        const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;
        const seekBar = document.getElementById('seekBar');
        const totalTimeEl = document.getElementById('totalTime');

        // Store current segment info
        this.state.currentSegmentRange = {
            id: segment.id,
            startMs: segment.startMs,
            endMs: segment.endMs
        };

        const segmentPrefix = typeof i18n !== 'undefined' ? i18n.t('segment_prefix') : '段落: ';
        document.getElementById('floatingPlayerInfo').textContent = segmentPrefix + segment.name;

        // Update seekbar range based on mode
        if (segmentOnlyMode) {
            // Segment Only Mode
            seekBar.min = 0;
            seekBar.max = 100;
            const segmentDuration = segment.endMs - segment.startMs;
            totalTimeEl.textContent = TimeUtils.formatTimeSeconds(segmentDuration);
        } else {
            // Full File Mode
            seekBar.min = 0;
            seekBar.max = 100;
            if (audioPlayer.duration) {
                totalTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.duration * 1000);
            }
        }

        audioPlayer.currentTime = segment.startMs / 1000;
        audioPlayer.play();
        btnPlayPause.textContent = '⏸';
    }

    /**
     * Setup all DOM event listeners
     */
    setupGlobalListeners() {
        // File Upload
        this.setupFileUploadListeners();

        // UI Interactions (Drag & Drop JSON)
        this.setupDragDropListeners();

        // Player Controls
        this.setupPlayerControls();

        // Keyboard Shortcuts
        this.setupKeyboardShortcuts();

        // Marking & Splitting
        this.setupToolsListeners();

        // Process Buttons
        document.getElementById('btnProcess').addEventListener('click', () => this.processAudio());

        // Step Size Preset Buttons
        document.querySelectorAll('.btn-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const stepMs = parseInt(btn.dataset.step);
                this.uiController.setStepSize(stepMs);
            });
        });

        document.getElementById('stepSize').addEventListener('change', (e) => {
            const stepSeconds = parseFloat(e.target.value);
            if (stepSeconds > 0) {
                const stepMs = Math.round(stepSeconds * 1000);
                this.uiController.setStepSize(stepMs);
            }
        });

        // Segment Controls
        document.getElementById('btnAddSegment').addEventListener('click', () => this.addSegment());
        document.getElementById('btnImportJSON').addEventListener('click', () => this.importJSON());
        document.getElementById('btnExportJSON').addEventListener('click', () => this.exportJSON());
        document.getElementById('btnClearAll').addEventListener('click', () => this.clearAllSegments());
    }

    /**
     * Setup File Upload Listeners
     */
    setupFileUploadListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        const handleDragOver = (e, element) => {
            e.preventDefault();
            element.classList.add('dragover');
        };

        const handleDragLeave = (element) => {
            element.classList.remove('dragover');
        };

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => handleDragOver(e, uploadArea));
        uploadArea.addEventListener('dragleave', () => handleDragLeave(uploadArea));

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) this.handleFileSelect(file);
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleFileSelect(file);
        });
    }

    /**
     * Setup Drag & Drop for JSON Import
     */
    setupDragDropListeners() {
        const segmentsSection = document.getElementById('segmentsSection');
        const segmentsList = document.getElementById('segmentsList');

        segmentsSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer.types.includes('Files')) {
                segmentsList.classList.add('drag-active');
                if (!document.getElementById('dropOverlay')) {
                    const overlay = document.createElement('div');
                    overlay.id = 'dropOverlay';
                    overlay.className = 'drop-overlay';
                    const msg = typeof i18n !== 'undefined' ? i18n.t('drop_json_to_import') : '放開以匯入設定檔';
                    overlay.innerHTML = `<div class="drop-message">${msg}</div>`;
                    segmentsList.appendChild(overlay);
                }
            }
        });

        segmentsSection.addEventListener('dragleave', (e) => {
            if (e.relatedTarget && !segmentsSection.contains(e.relatedTarget)) {
                segmentsList.classList.remove('drag-active');
                const overlay = document.getElementById('dropOverlay');
                if (overlay) overlay.remove();
            }
        });

        segmentsSection.addEventListener('drop', async (e) => {
            e.preventDefault();
            segmentsList.classList.remove('drag-active');
            const overlay = document.getElementById('dropOverlay');
            if (overlay) overlay.remove();

            const file = e.dataTransfer.files[0];
            if (file && file.name.toLowerCase().endsWith('.json')) {
                // Trigger actual import logic via a temporary input mimicking behavior or direct call
                // Since we have the file object, we can just process it directly.
                const confirmMsg = typeof i18n !== 'undefined' ? i18n.t('confirm_import') : '是否匯入設定檔？這將覆蓋現有段落。';
                if (this.segmentManager.getCount() > 0 && !confirm(confirmMsg)) {
                    return;
                }

                try {
                    const text = await file.text();
                    const result = this.segmentManager.importJSON(text);
                    alert(result.message);
                } catch (error) {
                    const errorMsg = typeof i18n !== 'undefined' ? i18n.t('import_failed', { error: error.message }) : `匯入失敗: ${error.message}`;
                    alert(errorMsg);
                }
            }
        });
    }

    /**
     * Setup Player Control Listeners
     */
    setupPlayerControls() {
        const audioPlayer = document.getElementById('audioPlayer');
        const btnPlayPause = document.getElementById('btnPlayPause');
        const btnLoop = document.getElementById('btnLoop');
        const seekBar = document.getElementById('seekBar');
        const playbackSpeed = document.getElementById('playbackSpeed');
        const currentTimeEl = document.getElementById('currentTime');
        const totalTimeEl = document.getElementById('totalTime');

        // Play/Pause Button
        btnPlayPause.addEventListener('click', () => {
            this.togglePlayPause();
        });

        // Rewind Button
        const btnRewind = document.getElementById('btnRewind');
        if (btnRewind) {
            btnRewind.onclick = () => this.seekBy(-this.state.seekStep);
        }

        // Forward Button
        const btnForward = document.getElementById('btnForward');
        if (btnForward) {
            btnForward.onclick = () => this.seekBy(this.state.seekStep);
        }

        // Loop Button
        btnLoop.addEventListener('click', () => {
            this.state.isLooping = !this.state.isLooping;
            btnLoop.classList.toggle('active', this.state.isLooping);
            btnLoop.style.background = this.state.isLooping ? '#667eea' : '';
            btnLoop.style.color = this.state.isLooping ? 'white' : '';
        });

        // Speed Control
        playbackSpeed.addEventListener('change', () => {
            audioPlayer.playbackRate = parseFloat(playbackSpeed.value);
        });

        // Seek Step Control
        const seekStepSelect = document.getElementById('seekStep');
        if (seekStepSelect) {
            seekStepSelect.addEventListener('change', () => {
                this.state.seekStep = parseInt(seekStepSelect.value);
                this.updateSeekButtonTitles();
            });
            // Init title
            this.updateSeekButtonTitles();
        }

        // Seekbar Input (Dragging)
        seekBar.addEventListener('input', () => {
            this.state.isSeeking = true;
            const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;

            if (this.state.currentSegmentRange && segmentOnlyMode) {
                // Segment Mode
                const segmentDuration = this.state.currentSegmentRange.endMs - this.state.currentSegmentRange.startMs;
                const seekPosInSegment = (seekBar.value / 100) * segmentDuration;
                currentTimeEl.textContent = TimeUtils.formatTimeSeconds(seekPosInSegment);
            } else {
                // Full File Mode
                const seekTime = (seekBar.value / 100) * audioPlayer.duration;
                currentTimeEl.textContent = TimeUtils.formatTimeSeconds(seekTime * 1000);
            }
        });

        // Seekbar Change (Drop)
        seekBar.addEventListener('change', () => {
            const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;

            if (this.state.currentSegmentRange && segmentOnlyMode) {
                const segmentDuration = this.state.currentSegmentRange.endMs - this.state.currentSegmentRange.startMs;
                const seekPosInSegment = (seekBar.value / 100) * segmentDuration;
                const actualTimeMs = this.state.currentSegmentRange.startMs + seekPosInSegment;
                audioPlayer.currentTime = actualTimeMs / 1000;
            } else {
                const seekTime = (seekBar.value / 100) * audioPlayer.duration;
                audioPlayer.currentTime = seekTime;
            }
            this.state.isSeeking = false;
        });

        // Time Update
        audioPlayer.addEventListener('timeupdate', () => {
            if (!this.state.isSeeking && audioPlayer.duration) {
                const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;

                if (this.state.currentSegmentRange && segmentOnlyMode) {
                    // Segment Mode Progress
                    const segmentDuration = this.state.currentSegmentRange.endMs - this.state.currentSegmentRange.startMs;
                    const currentPosInSegment = (audioPlayer.currentTime * 1000) - this.state.currentSegmentRange.startMs;
                    const progress = Math.max(0, Math.min(100, (currentPosInSegment / segmentDuration) * 100));
                    seekBar.value = progress;
                    currentTimeEl.textContent = TimeUtils.formatTimeSeconds(Math.max(0, currentPosInSegment));
                } else {
                    // Full File Progress
                    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                    seekBar.value = progress;
                    currentTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.currentTime * 1000);
                }

                // Loop Check
                if (this.state.currentSegmentRange) {
                    const currentMs = audioPlayer.currentTime * 1000;
                    if (currentMs >= this.state.currentSegmentRange.endMs) {
                        if (this.state.isLooping) {
                            audioPlayer.currentTime = this.state.currentSegmentRange.startMs / 1000;
                        } else {
                            audioPlayer.pause();
                            btnPlayPause.textContent = '▶';
                            this.state.currentSegmentRange = null; // Exit segment mode on finish (non-loop)
                            // Restore full time display
                            if (audioPlayer.duration) {
                                totalTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.duration * 1000);
                            }
                        }
                    }
                }
            }
        });

        // Metadata Loaded
        audioPlayer.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.duration * 1000);
        });

        // Ended
        audioPlayer.addEventListener('ended', () => {
            if (!this.state.isLooping) {
                btnPlayPause.textContent = '▶';
            }
        });

        // Segment Only Mode Checkbox Change
        const segmentOnlyCheckbox = document.getElementById('segmentOnlyMode');
        if (segmentOnlyCheckbox) {
            segmentOnlyCheckbox.addEventListener('change', () => {
                if (segmentOnlyCheckbox.checked && this.state.currentSegmentRange) {
                    const segmentDuration = this.state.currentSegmentRange.endMs - this.state.currentSegmentRange.startMs;
                    totalTimeEl.textContent = TimeUtils.formatTimeSeconds(segmentDuration);
                } else {
                    if (audioPlayer.duration) {
                        totalTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.duration * 1000);
                    }
                }
            });
        }
    }

    /**
     * Setup Tools (Mark/Split) Listeners
     */
    setupToolsListeners() {
        // Auto Split Buttons
        document.querySelectorAll('.btn-split').forEach(btn => {
            if (btn.id === 'btnCustomSplit') {
                btn.addEventListener('click', () => {
                    const num = prompt('請輸入要切分的段落數量 (2-100):', '4');
                    if (num) {
                        const segments = parseInt(num);
                        if (segments >= 2 && segments <= 100) {
                            this.autoSplit(segments);
                        } else {
                            alert('請輸入 2-100 之間的數字');
                        }
                    }
                });
            } else {
                btn.addEventListener('click', () => {
                    const segments = parseInt(btn.dataset.segments);
                    this.autoSplit(segments);
                });
            }
        });

        // Split Main at Cursor
        document.getElementById('btnSplitMainAtCursor').addEventListener('click', () => {
            if (!this.audioProcessor.audioBuffer) return alert(typeof i18n !== 'undefined' ? i18n.t('no_audio') : '請先載入音訊');

            if (this.segmentManager.getCount() > 0) {
                const warning = typeof i18n !== 'undefined' ? i18n.t('overwrite_warning') : '確定要覆蓋嗎？';
                if (!confirm(warning)) return;
            }

            const duration = (this.audioProcessor.audioBuffer ? this.audioProcessor.audioBuffer.duration : document.getElementById('audioPlayer').duration) * 1000;
            const current = document.getElementById('audioPlayer').currentTime * 1000;

            if (isNaN(duration) || current <= 100 || current >= duration - 100) return;

            this.segmentManager.clearAll();
            this.segmentManager.addSegment({ name: 'Part 1', startMs: 0, endMs: Math.floor(current) });
            this.segmentManager.addSegment({ name: 'Part 2', startMs: Math.floor(current), endMs: Math.floor(duration) });
        });

        // Mark Segment Start/End
        document.getElementById('btnMarkSegment').addEventListener('click', () => {
            if (!this.audioProcessor.audioBuffer) return alert(typeof i18n !== 'undefined' ? i18n.t('no_audio') : '請先載入音訊');

            const btn = document.getElementById('btnMarkSegment');
            const info = document.getElementById('markInfo');
            const currentMs = document.getElementById('audioPlayer').currentTime * 1000;

            if (!this.state.isMarkingStart) {
                // Start Marking
                this.state.isMarkingStart = true;
                this.state.markStartTime = currentMs;

                const markEndText = typeof i18n !== 'undefined' ? i18n.t('mark_end') : '標註結束';
                btn.innerHTML = markEndText;
                btn.classList.add('btn-danger');
                btn.classList.remove('btn-secondary');

                info.style.display = 'block';
                const infoText = typeof i18n !== 'undefined' ? i18n.t('marking_start_time') : '已標註開始: {time}';
                info.textContent = infoText.replace('{time}', TimeUtils.formatTime(currentMs));

                // Marker visual disabled per request
                // this.uiController.addMarker(...) 
            } else {
                // End Marking
                if (currentMs <= this.state.markStartTime) {
                    alert('結束時間必須大於開始時間');
                    return;
                }

                this.segmentManager.addSegment({
                    name: `Segment ${this.segmentManager.getCount() + 1}`,
                    startMs: Math.floor(this.state.markStartTime),
                    endMs: Math.floor(currentMs)
                });

                // Reset State
                this.state.isMarkingStart = false;
                const markStartText = typeof i18n !== 'undefined' ? i18n.t('mark_start') : '標註開始';
                btn.innerHTML = markStartText;
                btn.classList.remove('btn-danger');
                btn.classList.add('btn-secondary');
                info.style.display = 'none';

                // Marker visual disabled per request
                // this.uiController.clearMarkers();
            }
        });
    }

    /**
     * File Selection Handler
     */
    async handleFileSelect(file) {
        if (!file.type.startsWith('audio/')) {
            alert(typeof i18n !== 'undefined' ? i18n.t('select_audio_file') : '請選擇音訊檔案');
            return;
        }

        this.state.currentFile = file;

        // UI Updates
        document.querySelector('.upload-prompt').style.display = 'none';
        document.getElementById('fileInfo').style.display = 'block';
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileDetails').textContent = typeof i18n !== 'undefined' ? i18n.t('loading') : '載入中...';

        // Load Audio
        const result = await this.audioProcessor.loadFile(file);

        if (result.success) {
            const info = this.audioProcessor.getInfo();
            const durationLabel = typeof i18n !== 'undefined' ? i18n.t('duration') : '長度';
            const sampleRateLabel = typeof i18n !== 'undefined' ? i18n.t('sample_rate') : '取樣率';
            const channelsLabel = typeof i18n !== 'undefined' ? i18n.t('channels') : '聲道';

            document.getElementById('fileDetails').textContent =
                `${durationLabel}: ${TimeUtils.formatDuration(info.durationMs)} | ` +
                `${sampleRateLabel}: ${info.sampleRate} Hz | ` +
                `${channelsLabel}: ${info.channels}`;

            // Initialize Player
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = URL.createObjectURL(file);

            // Show Player Bar
            document.getElementById('floatingPlayerBar').style.display = 'flex';
            document.body.classList.add('player-active');
            document.getElementById('floatingPlayerInfo').textContent = (typeof i18n !== 'undefined' ? i18n.t('main_audio') : '主音訊') + ': ' + file.name;

            // Setup Main Play Button
            const btnPlayMain = document.getElementById('btnPlayMain');
            btnPlayMain.style.display = 'inline-flex';
            btnPlayMain.onclick = () => this.toggleMainAudio();

            // Show sections
            document.getElementById('settingsSection').style.display = 'block';
            document.getElementById('segmentsSection').style.display = 'block';
            document.getElementById('exportSection').style.display = 'block';
        } else {
            alert(`載入失敗: ${result.error}`);
            document.getElementById('fileDetails').textContent = '載入失敗';
        }
    }

    /**
     * Auto Split Logic
     */
    autoSplit(numSegments) {
        if (!this.audioProcessor.audioBuffer) {
            alert(typeof i18n !== 'undefined' ? i18n.t('no_audio') : '請先載入音訊檔案');
            return;
        }

        if (this.segmentManager.getCount() > 0) {
            const confirmMsg = typeof i18n !== 'undefined'
                ? i18n.t('confirm_split', { count: this.segmentManager.getCount(), num: numSegments })
                : `將清除現有 ${this.segmentManager.getCount()} 個段落並自動切分為 ${numSegments} 段。\n\n是否繼續？`;
            if (!confirm(confirmMsg)) {
                return;
            }
        }

        const info = this.audioProcessor.getInfo();
        this.segmentManager.autoSplit(info.durationMs, numSegments);
    }

    /**
     * Add Segment
     */
    addSegment() {
        if (!this.audioProcessor.audioBuffer) {
            alert(typeof i18n !== 'undefined' ? i18n.t('no_audio') : '請先載入音訊檔案');
            return;
        }

        const info = this.audioProcessor.getInfo();
        const segments = this.segmentManager.getSegments();

        let startMs = 0;
        if (segments.length > 0) {
            const lastSegment = segments[segments.length - 1];
            startMs = lastSegment.endMs;
        }

        const endMs = Math.min(startMs + 10000, info.durationMs);
        const segmentLabel = typeof i18n !== 'undefined' ? i18n.t('segment_label') : '段落';

        this.segmentManager.addSegment({
            name: `${segmentLabel} ${this.segmentManager.getCount() + 1}`,
            startMs,
            endMs
        });
    }

    /**
     * Import JSON
     */
    importJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const result = this.segmentManager.importJSON(text);

                if (result.success) {
                    alert(result.message);
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert(`匯入失敗: ${error.message}`);
            }
        });

        input.click();
    }

    /**
     * Export JSON
     */
    exportJSON() {
        if (this.segmentManager.getCount() === 0) {
            alert('沒有段落可以匯出');
            return;
        }

        const sourceFileName = this.state.currentFile ? this.state.currentFile.name.replace(/\.[^/.]+$/, '') : 'segments';
        const data = this.segmentManager.exportJSON(this.state.currentFile ? this.state.currentFile.name : '');
        const json = JSON.stringify(data, null, 2);

        // UTF-8 BOM
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${sourceFileName}_segments.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Clear All Segments
     */
    clearAllSegments() {
        if (this.segmentManager.getCount() === 0) return;

        const confirmMsg = typeof i18n !== 'undefined'
            ? i18n.t('confirm_clear', { count: this.segmentManager.getCount() })
            : `確定要清除所有 ${this.segmentManager.getCount()} 個段落嗎？`;

        if (confirm(confirmMsg)) {
            this.segmentManager.clearAll();
        }
    }

    /**
     * Process Audio (Trim & Export)
     */
    async processAudio() {
        if (!this.audioProcessor.audioBuffer) {
            alert('請先載入音訊檔案');
            return;
        }

        const segments = this.segmentManager.getSegments();
        if (segments.length === 0) {
            alert(typeof i18n !== 'undefined' ? i18n.t('no_segments') : '請新增至少一個段落');
            return;
        }

        // Validate
        const info = this.audioProcessor.getInfo();
        const validation = this.segmentManager.validateAll(info.durationMs);
        if (!validation.valid) {
            const errorPrefix = typeof i18n !== 'undefined' ? i18n.t('segment_error') : '段落設定有誤:\n';
            alert(errorPrefix + validation.errors.join('\n'));
            return;
        }

        // Confirm
        const keepOriginal = document.getElementById('keepOriginal').checked;
        let message = typeof i18n !== 'undefined'
            ? i18n.t('confirm_process', { count: segments.length })
            : `將剪輯 ${segments.length} 個段落`;
        if (keepOriginal) {
            message += typeof i18n !== 'undefined' ? i18n.t('keep_full_version') : '\n同時保留完整版本';
        }

        const continuePrompt = typeof i18n !== 'undefined' ? i18n.t('continue_prompt') : '\n\n是否繼續？';
        if (!confirm(message + continuePrompt)) {
            return;
        }

        // Progress UI
        const progressContainer = document.getElementById('progressContainer');
        const btnProcess = document.getElementById('btnProcess');

        progressContainer.style.display = 'block';
        btnProcess.disabled = true;

        const processingText = typeof i18n !== 'undefined' ? i18n.t('processing_wait') : '⏳ 剪輯中請稍等...';
        btnProcess.innerHTML = processingText;

        this.uiController.updateProgress(0, 100, typeof i18n !== 'undefined' ? i18n.t('preparing') : '準備中...');

        // Defer execution to allow UI update
        setTimeout(async () => {
            try {
                const useMp3 = document.getElementById('exportMp3')?.checked || false;
                const format = useMp3 ? 'mp3' : 'wav';

                const results = await this.audioProcessor.processSegments(segments, (current, total, status) => {
                    this.uiController.updateProgress(current, total, status);
                }, format);

                const useZip = document.getElementById('downloadZip')?.checked || false;
                const baseFilename = this.state.currentFile.name.replace(/\.[^/.]+$/, '');

                if (useZip) {
                    // ZIP Mode
                    const zip = new JSZip();

                    results.forEach(result => {
                        if (result.success) {
                            const ext = result.format || 'wav';
                            const safeName = result.segment.name.replace(/[^a-z0-9_\u4e00-\u9fa5]/gi, '_');
                            zip.file(`${result.segment.name}.${ext}`, result.blob);
                        }
                    });

                    if (keepOriginal) {
                        const originalExt = this.state.currentFile.name.split('.').pop();
                        const response = await fetch(URL.createObjectURL(this.state.currentFile));
                        const originalBlob = await response.blob();
                        zip.file(`full_original.${originalExt}`, originalBlob);
                    }

                    this.uiController.updateProgress(100, 100, typeof i18n !== 'undefined' ? i18n.t('packing_zip') : '正在打包...');

                    const content = await zip.generateAsync({ type: "blob" });
                    const url = URL.createObjectURL(content);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${baseFilename}_segments.zip`;
                    a.click();
                    URL.revokeObjectURL(url);

                } else {
                    // One by one Mode
                    for (const result of results) {
                        if (result.success) {
                            const ext = result.format || 'wav';
                            const url = URL.createObjectURL(result.blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${baseFilename}_${result.segment.name}.${ext}`;
                            a.click();
                            // Small delay to prevent browser block
                            await new Promise(r => setTimeout(r, 200));
                            URL.revokeObjectURL(url);
                        }
                    }
                }

                this.uiController.updateProgress(100, 100, typeof i18n !== 'undefined' ? i18n.t('success', { success: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length }) : '完成！');
                alert(typeof i18n !== 'undefined' ? i18n.t('success', { success: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length }) : '剪輯完成！');

            } catch (err) {
                console.error(err);
                alert((typeof i18n !== 'undefined' ? i18n.t('error') : '發生錯誤: ') + err.message);
            } finally {
                btnProcess.disabled = false;
                btnProcess.innerHTML = typeof i18n !== 'undefined' ? i18n.t('start_process') : '🎵 開始剪輯';
                progressContainer.style.display = 'none';
            }
        }, 100);
    }

    /**
     * Toggle Play/Pause Logic
     */
    togglePlayPause() {
        const audioPlayer = document.getElementById('audioPlayer');
        const btnPlayPause = document.getElementById('btnPlayPause');

        if (audioPlayer.paused) {
            audioPlayer.play();
            btnPlayPause.textContent = '⏸';
        } else {
            audioPlayer.pause();
            btnPlayPause.textContent = '▶';
        }
    }

    /**
     * Seek by seconds
     */
    seekBy(seconds) {
        const audioPlayer = document.getElementById('audioPlayer');
        if (!audioPlayer.duration) return;

        let newTime = audioPlayer.currentTime + seconds;
        const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;

        if (this.state.currentSegmentRange && segmentOnlyMode) {
            const startSec = this.state.currentSegmentRange.startMs / 1000;
            const endSec = this.state.currentSegmentRange.endMs / 1000;

            // Constrain to segment
            if (newTime < startSec) newTime = startSec;
            if (newTime > endSec) newTime = endSec;
        } else {
            // Constrain to file
            if (newTime < 0) newTime = 0;
            if (newTime > audioPlayer.duration) newTime = audioPlayer.duration;
        }

        audioPlayer.currentTime = newTime;
    }

    /**
     * Update Seek Button Titles with i18n
     */
    updateSeekButtonTitles() {
        const btnRewind = document.getElementById('btnRewind');
        const btnForward = document.getElementById('btnForward');

        if (typeof i18n !== 'undefined') {
            if (btnRewind) btnRewind.title = i18n.t('rewind', { s: this.state.seekStep });
            if (btnForward) btnForward.title = i18n.t('forward', { s: this.state.seekStep });
        } else {
            if (btnRewind) btnRewind.title = `倒退 ${this.state.seekStep} 秒`;
            if (btnForward) btnForward.title = `前進 ${this.state.seekStep} 秒`;
        }
    }

    /**
     * Setup Keyboard Shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if input focused
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.seekBy(-this.state.seekStep);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.seekBy(this.state.seekStep);
                    break;
            }
        });
    }
}

// Instantiate and start app
const app = new AppController();

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
