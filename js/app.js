/**
 * Main Application - 主應用程式
 */

// 全域變數
let segmentManager;
let audioProcessor;
let uiController;
let currentFile = null;

// 播放器狀態
let isLooping = false;
let isSeeking = false;

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

/**
 * 初始化應用程式
 */
function initializeApp() {
    segmentManager = new SegmentManager();
    audioProcessor = new AudioProcessor();
    uiController = new UIController(segmentManager, audioProcessor);

    // 設定段落變更回調
    segmentManager.onChange = () => {
        uiController.renderSegments();
    };
}

/**
 * 設定主播放器控制
 */
function setupPlayerControls() {
    const audioPlayer = document.getElementById('audioPlayer');
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnLoop = document.getElementById('btnLoop');
    const seekBar = document.getElementById('seekBar');
    const playbackSpeed = document.getElementById('playbackSpeed');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');

    // Play/Pause 按鈕
    btnPlayPause.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            btnPlayPause.textContent = '⏸';
        } else {
            audioPlayer.pause();
            btnPlayPause.textContent = '▶';
        }
    });

    // Loop 按鈕
    btnLoop.addEventListener('click', () => {
        isLooping = !isLooping;
        audioPlayer.loop = isLooping;
        btnLoop.classList.toggle('active', isLooping);
        btnLoop.style.background = isLooping ? '#667eea' : '';
        btnLoop.style.color = isLooping ? 'white' : '';
    });

    // 倍速控制
    playbackSpeed.addEventListener('change', () => {
        audioPlayer.playbackRate = parseFloat(playbackSpeed.value);
    });

    // Seekbar 拖曳
    seekBar.addEventListener('input', () => {
        isSeeking = true;
        const seekTime = (seekBar.value / 100) * audioPlayer.duration;
        currentTimeEl.textContent = TimeUtils.formatTime(seekTime * 1000);
    });

    seekBar.addEventListener('change', () => {
        const seekTime = (seekBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
        isSeeking = false;
    });

    // 更新進度條
    audioPlayer.addEventListener('timeupdate', () => {
        if (!isSeeking && audioPlayer.duration) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            seekBar.value = progress;
            currentTimeEl.textContent = TimeUtils.formatTime(audioPlayer.currentTime * 1000);
        }
    });

    // 載入後顯示總時長
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = TimeUtils.formatTime(audioPlayer.duration * 1000);
    });

    // 播放結束
    audioPlayer.addEventListener('ended', () => {
        if (!isLooping) {
            btnPlayPause.textContent = '▶';
        }
    });
}

/**
 * 設定事件監聽器
 */
function setupEventListeners() {
    // 檔案上傳
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    });

    // 主播放器控制
    setupPlayerControls();

    // 微調刻度設定
    document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.dataset.step);
            uiController.setStepSize(step);
        });
    });

    document.getElementById('stepSize').addEventListener('change', (e) => {
        const step = parseInt(e.target.value);
        if (step > 0) {
            uiController.setStepSize(step);
        }
    });

    // 自動切分
    document.querySelectorAll('.btn-split').forEach(btn => {
        if (btn.id === 'btnCustomSplit') {
            btn.addEventListener('click', () => {
                const num = prompt('請輸入要切分的段落數量 (2-100):', '4');
                if (num) {
                    const segments = parseInt(num);
                    if (segments >= 2 && segments <= 100) {
                        autoSplit(segments);
                    } else {
                        alert('請輸入 2-100 之間的數字');
                    }
                }
            });
        } else {
            btn.addEventListener('click', () => {
                const segments = parseInt(btn.dataset.segments);
                autoSplit(segments);
            });
        }
    });

    // 段落控制
    document.getElementById('btnAddSegment').addEventListener('click', addSegment);
    document.getElementById('btnImportJSON').addEventListener('click', importJSON);
    document.getElementById('btnExportJSON').addEventListener('click', exportJSON);
    document.getElementById('btnClearAll').addEventListener('click', clearAllSegments);

    // 處理按鈕
    document.getElementById('btnProcess').addEventListener('click', processAudio);
}

/**
 * 處理檔案選擇
 */
async function handleFileSelect(file) {
    if (!file.type.startsWith('audio/')) {
        alert('請選擇音訊檔案');
        return;
    }

    currentFile = file;

    // 顯示檔案資訊
    document.querySelector('.upload-prompt').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileDetails').textContent = '載入中...';

    // 載入音訊
    const result = await audioProcessor.loadFile(file);

    if (result.success) {
        const info = audioProcessor.getInfo();
        document.getElementById('fileDetails').textContent =
            `長度: ${TimeUtils.formatDuration(info.durationMs)} | ` +
            `取樣率: ${info.sampleRate} Hz | ` +
            `聲道: ${info.channels}`;

        // 設定音訊播放器
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = URL.createObjectURL(file);

        // 顯示相關區塊
        document.getElementById('audioPreviewSection').style.display = 'block';
        document.getElementById('settingsSection').style.display = 'block';

        // 繪製波形
        uiController.drawWaveform();

        // 如果沒有段落，自動新增一個
        if (segmentManager.getCount() === 0) {
            segmentManager.addSegment({
                name: '段落 1',
                startMs: 0,
                endMs: Math.min(10000, info.durationMs)
            });
        }
    } else {
        alert(`載入失敗: ${result.error}`);
        document.getElementById('fileDetails').textContent = '載入失敗';
    }
}

/**
 * 自動切分
 */
function autoSplit(numSegments) {
    if (!audioProcessor.audioBuffer) {
        alert('請先載入音訊檔案');
        return;
    }

    if (segmentManager.getCount() > 0) {
        if (!confirm(`將清除現有 ${segmentManager.getCount()} 個段落並自動切分為 ${numSegments} 段。\n\n是否繼續？`)) {
            return;
        }
    }

    const info = audioProcessor.getInfo();
    segmentManager.autoSplit(info.durationMs, numSegments);
}

/**
 * 新增段落
 */
function addSegment() {
    if (!audioProcessor.audioBuffer) {
        alert('請先載入音訊檔案');
        return;
    }

    const info = audioProcessor.getInfo();
    const segments = segmentManager.getSegments();

    let startMs = 0;
    if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        startMs = lastSegment.endMs;
    }

    const endMs = Math.min(startMs + 10000, info.durationMs);

    segmentManager.addSegment({
        name: `段落 ${segmentManager.getCount() + 1}`,
        startMs,
        endMs
    });
}

/**
 * 匯入 JSON
 */
function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const result = segmentManager.importJSON(text);

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
 * 匯出 JSON
 */
function exportJSON() {
    if (segmentManager.getCount() === 0) {
        alert('沒有段落可以匯出');
        return;
    }

    const data = segmentManager.exportJSON(currentFile ? currentFile.name : '');
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'segments.json';
    a.click();

    URL.revokeObjectURL(url);
}

/**
 * 清除所有段落
 */
function clearAllSegments() {
    if (segmentManager.getCount() === 0) return;

    if (confirm(`確定要清除所有 ${segmentManager.getCount()} 個段落嗎？`)) {
        segmentManager.clearAll();
    }
}

/**
 * 處理音訊
 */
async function processAudio() {
    if (!audioProcessor.audioBuffer) {
        alert('請先載入音訊檔案');
        return;
    }

    const segments = segmentManager.getSegments();
    if (segments.length === 0) {
        alert('請新增至少一個段落');
        return;
    }

    // 驗證段落
    const info = audioProcessor.getInfo();
    const validation = segmentManager.validateAll(info.durationMs);
    if (!validation.valid) {
        alert('段落設定有誤:\n' + validation.errors.join('\n'));
        return;
    }

    // 確認
    const keepOriginal = document.getElementById('keepOriginal').checked;
    let message = `將剪輯 ${segments.length} 個段落`;
    if (keepOriginal) {
        message += '\n同時保留完整版本';
    }

    if (!confirm(message + '\n\n是否繼續？')) {
        return;
    }

    // 顯示進度
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.style.display = 'block';
    document.getElementById('btnProcess').disabled = true;

    try {
        // 處理段落
        const results = await audioProcessor.processSegments(segments, (current, total, status) => {
            uiController.updateProgress(current, total, status);
        });

        // 下載檔案
        results.forEach(result => {
            if (result.success) {
                const filename = `${result.segment.id}_${result.segment.name}_${currentFile.name.replace(/\.[^/.]+$/, '')}.wav`;
                downloadBlob(result.blob, filename);
            }
        });

        // 如果保留完整版本
        if (keepOriginal) {
            const fullBlob = audioProcessor.audioBufferToWav(audioProcessor.audioBuffer);
            downloadBlob(fullBlob, `完整版_${currentFile.name.replace(/\.[^/.]+$/, '')}.wav`);
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        alert(`處理完成！\n成功: ${successful}\n失敗: ${failed}`);

    } catch (error) {
        alert(`處理失敗: ${error.message}`);
    } finally {
        progressContainer.style.display = 'none';
        document.getElementById('btnProcess').disabled = false;
    }
}

/**
 * 下載 Blob
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
