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
let currentSegmentRange = null; // 當前播放的段落範圍 {startMs, endMs}

/**
 * 播放完整音訊
 */
function playFullAudio() {
    const audioPlayer = document.getElementById('audioPlayer');
    const btnPlayPause = document.getElementById('btnPlayPause');

    currentSegmentRange = null;
    document.getElementById('floatingPlayerInfo').textContent = '主音訊';

    audioPlayer.currentTime = 0;
    audioPlayer.play();
    btnPlayPause.textContent = '⏸';
}

/**
 * 在浮動播放器中播放段落
 */
function playSegmentInPlayer(segment) {
    const audioPlayer = document.getElementById('audioPlayer');
    const btnPlayPause = document.getElementById('btnPlayPause');
    const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;
    const seekBar = document.getElementById('seekBar');
    const totalTimeEl = document.getElementById('totalTime');

    currentSegmentRange = {
        startMs: segment.startMs,
        endMs: segment.endMs
    };

    document.getElementById('floatingPlayerInfo').textContent = '段落: ' + segment.name;

    // 根據播放模式更新 seekbar 範圍
    if (segmentOnlyMode) {
        // 僅段落模式：seekbar 僅顯示段落範圍
        seekBar.min = 0;
        seekBar.max = 100;
        const segmentDuration = segment.endMs - segment.startMs;
        totalTimeEl.textContent = TimeUtils.formatTimeSeconds(segmentDuration);
    } else {
        // 全檔案模式：恢復原始 seekbar 範圍
        seekBar.min = 0;
        seekBar.max = 100;
        totalTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.duration * 1000);
    }

    audioPlayer.currentTime = segment.startMs / 1000;
    audioPlayer.play();
    btnPlayPause.textContent = '⏸';
}

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

        // 如果正在播放段落，檢查並更新時間範圍
        if (currentSegmentRange) {
            const segments = segmentManager.getSegments();
            const currentSegment = segments.find(s =>
                s.startMs === currentSegmentRange.startMs && s.endMs === currentSegmentRange.endMs
            );

            // 如果找到對應段落但時間已變更，更新範圍
            if (currentSegment) {
                const totalTimeEl = document.getElementById('totalTime');
                const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;

                if (segmentOnlyMode) {
                    const segmentDuration = currentSegment.endMs - currentSegment.startMs;
                    totalTimeEl.textContent = TimeUtils.formatTimeSeconds(segmentDuration);
                }
            }

            // 檢查當前播放位置是否在範圍內
            const audioPlayer = document.getElementById('audioPlayer');
            const currentMs = audioPlayer.currentTime * 1000;

            if (currentMs < currentSegmentRange.startMs) {
                audioPlayer.currentTime = currentSegmentRange.startMs / 1000;
            } else if (currentMs > currentSegmentRange.endMs) {
                audioPlayer.currentTime = currentSegmentRange.startMs / 1000;
            }
        }
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
        const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;

        if (currentSegmentRange && segmentOnlyMode) {
            // 僅段落模式：根據段落範圍計算時間
            const segmentDuration = currentSegmentRange.endMs - currentSegmentRange.startMs;
            const seekPosInSegment = (seekBar.value / 100) * segmentDuration;
            currentTimeEl.textContent = TimeUtils.formatTimeSeconds(seekPosInSegment);
        } else {
            // 全檔案模式
            const seekTime = (seekBar.value / 100) * audioPlayer.duration;
            currentTimeEl.textContent = TimeUtils.formatTimeSeconds(seekTime * 1000);
        }
    });

    seekBar.addEventListener('change', () => {
        const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;

        if (currentSegmentRange && segmentOnlyMode) {
            // 僅段落模式：根據段落範圍計算實際播放時間
            const segmentDuration = currentSegmentRange.endMs - currentSegmentRange.startMs;
            const seekPosInSegment = (seekBar.value / 100) * segmentDuration;
            const actualTimeMs = currentSegmentRange.startMs + seekPosInSegment;
            audioPlayer.currentTime = actualTimeMs / 1000;
        } else {
            // 全檔案模式
            const seekTime = (seekBar.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = seekTime;
        }
        isSeeking = false;
    });

    // 更新進度條
    audioPlayer.addEventListener('timeupdate', () => {
        if (!isSeeking && audioPlayer.duration) {
            const segmentOnlyMode = document.getElementById('segmentOnlyMode')?.checked ?? true;

            // 根據播放模式計算進度
            if (currentSegmentRange && segmentOnlyMode) {
                // 僅段落模式：進度相對於段落
                const segmentDuration = currentSegmentRange.endMs - currentSegmentRange.startMs;
                const currentPosInSegment = (audioPlayer.currentTime * 1000) - currentSegmentRange.startMs;
                const progress = Math.max(0, Math.min(100, (currentPosInSegment / segmentDuration) * 100));
                seekBar.value = progress;
                currentTimeEl.textContent = TimeUtils.formatTimeSeconds(Math.max(0, currentPosInSegment));
            } else {
                // 全檔案模式：進度相對於整個檔案
                const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                seekBar.value = progress;
                currentTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.currentTime * 1000);
            }

            // 如果在播放段落且已超過段落結束時間，則停止或循環
            if (currentSegmentRange) {
                const currentMs = audioPlayer.currentTime * 1000;
                if (currentMs >= currentSegmentRange.endMs) {
                    if (isLooping) {
                        audioPlayer.currentTime = currentSegmentRange.startMs / 1000;
                    } else {
                        audioPlayer.pause();
                        btnPlayPause.textContent = '▶';
                        currentSegmentRange = null;
                        // 恢復全檔案模式顯示
                        totalTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.duration * 1000);
                    }
                }
            }
        }
    });

    // 載入後顯示總時長
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.duration * 1000);
    });

    // 播放結束
    audioPlayer.addEventListener('ended', () => {
        if (!isLooping) {
            btnPlayPause.textContent = '▶';
        }
    });

    // 播放模式切換 (僅段落 checkbox)
    const segmentOnlyCheckbox = document.getElementById('segmentOnlyMode');
    if (segmentOnlyCheckbox) {
        segmentOnlyCheckbox.addEventListener('change', () => {
            if (segmentOnlyCheckbox.checked && currentSegmentRange) {
                // 切換到僅段落模式：顯示段落時長
                const segmentDuration = currentSegmentRange.endMs - currentSegmentRange.startMs;
                totalTimeEl.textContent = TimeUtils.formatTimeSeconds(segmentDuration);
            } else {
                // 切換到全檔案模式：顯示完整時長
                totalTimeEl.textContent = TimeUtils.formatTimeSeconds(audioPlayer.duration * 1000);
            }
        });
    }
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

        // 顯示浮動播放條
        document.getElementById('floatingPlayerBar').style.display = 'flex';
        document.body.classList.add('player-active');
        document.getElementById('floatingPlayerInfo').textContent = '主音訊: ' + file.name;

        // 設定主播放按鈕 (現在在檔案資訊區域內)
        const btnPlayMain = document.getElementById('btnPlayMain');
        btnPlayMain.style.display = 'inline-flex';
        btnPlayMain.onclick = () => {
            playFullAudio();
        };

        // 顯示設定區塊
        document.getElementById('settingsSection').style.display = 'block';

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

    const sourceFileName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'segments';
    const data = segmentManager.exportJSON(currentFile ? currentFile.name : '');
    const json = JSON.stringify(data, null, 2);

    // 使用 UTF-8 BOM 確保中文編碼正確
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

        // 取得下載模式 (使用 checkbox)
        const useZip = document.getElementById('downloadZip')?.checked || false;
        const baseFilename = currentFile.name.replace(/\.[^/.]+$/, '');

        if (useZip) {
            // ZIP 打包模式
            const zip = new JSZip();

            results.forEach(result => {
                if (result.success) {
                    const filename = `${result.segment.id}_${result.segment.name}.wav`;
                    zip.file(filename, result.blob);
                }
            });

            // 如果保留完整版本
            if (keepOriginal) {
                const fullBlob = audioProcessor.audioBufferToWav(audioProcessor.audioBuffer);
                zip.file(`完整版_${baseFilename}.wav`, fullBlob);
            }

            // 生成 ZIP 並下載
            uiController.updateProgress(1, 1, '正在打包 ZIP...');
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadBlob(zipBlob, `${baseFilename}_segments.zip`);
        } else {
            // 個別下載模式
            results.forEach(result => {
                if (result.success) {
                    const filename = `${result.segment.id}_${result.segment.name}_${baseFilename}.wav`;
                    downloadBlob(result.blob, filename);
                }
            });

            // 如果保留完整版本
            if (keepOriginal) {
                const fullBlob = audioProcessor.audioBufferToWav(audioProcessor.audioBuffer);
                downloadBlob(fullBlob, `完整版_${baseFilename}.wav`);
            }
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
