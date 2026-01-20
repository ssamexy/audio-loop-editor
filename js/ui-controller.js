/**
 * UI Controller - UI 控制器
 * 負責管理所有 UI 互動和渲染
 */

class UIController {
    constructor(segmentManager, audioProcessor) {
        this.segmentManager = segmentManager;
        this.audioProcessor = audioProcessor;
        this.stepSize = 100; // 預設微調刻度
        this.currentPlayingSegment = null;
    }

    /**
     * 渲染段落列表
     */
    renderSegments() {
        const container = document.getElementById('segmentsList');
        container.innerHTML = '';

        const segments = this.segmentManager.getSegments();

        segments.forEach((segment, index) => {
            const row = this.createSegmentRow(segment, index);
            container.appendChild(row);
        });

        // 更新段落數量顯示
        const count = segments.length;
        if (count > 0) {
            document.getElementById('segmentsSection').style.display = 'block';
            document.getElementById('exportSection').style.display = 'block';
        }
    }

    /**
     * 建立段落列
     */
    createSegmentRow(segment, index) {
        const row = document.createElement('div');
        row.className = 'segment-row';
        row.dataset.segmentId = segment.id;

        if (this.segmentManager.isSubSegment(segment.id)) {
            row.classList.add('sub-segment');
        }

        // ID 輸入
        const idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.value = segment.id;
        idInput.disabled = true;
        idInput.style.background = '#f0f0f0';

        // 名稱輸入
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = segment.name;
        nameInput.placeholder = '段落名稱';
        nameInput.addEventListener('change', () => {
            this.segmentManager.updateSegment(segment.id, { name: nameInput.value });
        });

        // 開始時間
        const startTimeGroup = this.createTimeInputGroup(segment.startMs, (newMs) => {
            this.segmentManager.updateSegment(segment.id, { startMs: newMs });
        });

        // 結束時間
        const endTimeGroup = this.createTimeInputGroup(segment.endMs, (newMs) => {
            this.segmentManager.updateSegment(segment.id, { endMs: newMs });
        });

        // 操作按鈕
        const actions = document.createElement('div');
        actions.className = 'segment-actions';

        // 播放按鈕
        const playBtn = document.createElement('button');
        playBtn.className = 'btn-icon play';
        playBtn.textContent = '▶';
        playBtn.title = '試播放';
        playBtn.addEventListener('click', () => this.playSegment(segment));
        actions.appendChild(playBtn);

        // 新增子段落按鈕 (僅主段落)
        if (!this.segmentManager.isSubSegment(segment.id)) {
            const addSubBtn = document.createElement('button');
            addSubBtn.className = 'btn-icon add-sub';
            addSubBtn.textContent = '+子';
            addSubBtn.title = '新增子段落';
            addSubBtn.addEventListener('click', () => {
                this.segmentManager.addSubSegment(segment.id);
            });
            actions.appendChild(addSubBtn);
        }

        // 刪除按鈕
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon delete';
        deleteBtn.textContent = '✕';
        deleteBtn.title = '刪除';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`確定要刪除段落 ${segment.id} 嗎？`)) {
                this.segmentManager.deleteSegment(segment.id);
            }
        });
        actions.appendChild(deleteBtn);

        // 組裝列
        row.appendChild(idInput);
        row.appendChild(nameInput);
        row.appendChild(startTimeGroup);
        row.appendChild(endTimeGroup);
        row.appendChild(actions);

        return row;
    }

    /**
     * 建立時間輸入群組 (含 +/- 按鈕)
     */
    createTimeInputGroup(initialMs, onChange) {
        const group = document.createElement('div');
        group.className = 'time-input-group';

        // - 按鈕
        const minusBtn = document.createElement('button');
        minusBtn.className = 'time-adjust-btn';
        minusBtn.textContent = '-';
        minusBtn.addEventListener('click', () => {
            const newMs = Math.max(0, initialMs - this.stepSize);
            input.value = TimeUtils.formatTime(newMs);
            onChange(newMs);
        });

        // 時間輸入
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'time-input';
        input.value = TimeUtils.formatTime(initialMs);
        input.placeholder = 'MM:SS.mmm';
        input.addEventListener('change', () => {
            const newMs = TimeUtils.parseToMs(input.value);
            input.value = TimeUtils.formatTime(newMs);
            onChange(newMs);
        });

        // + 按鈕
        const plusBtn = document.createElement('button');
        plusBtn.className = 'time-adjust-btn';
        plusBtn.textContent = '+';
        plusBtn.addEventListener('click', () => {
            const newMs = initialMs + this.stepSize;
            input.value = TimeUtils.formatTime(newMs);
            onChange(newMs);
        });

        group.appendChild(minusBtn);
        group.appendChild(input);
        group.appendChild(plusBtn);

        return group;
    }

    /**
     * 播放段落
     */
    playSegment(segment) {
        if (this.currentPlayingSegment === segment.id) {
            this.audioProcessor.stop();
            this.currentPlayingSegment = null;
        } else {
            this.audioProcessor.playSegment(segment.startMs, segment.endMs);
            this.currentPlayingSegment = segment.id;
        }
    }

    /**
     * 更新進度
     */
    updateProgress(current, total, message) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        const percentage = (current / total) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = message;
    }

    /**
     * 顯示訊息
     */
    showMessage(message, type = 'info') {
        alert(message);
    }

    /**
     * 繪製波形
     */
    drawWaveform() {
        const canvas = document.getElementById('waveformCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const waveformData = this.audioProcessor.getWaveformData(canvas.width);
        if (!waveformData) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#667eea';

        const barWidth = canvas.width / waveformData.length;
        const heightScale = canvas.height;

        waveformData.forEach((value, index) => {
            const barHeight = value * heightScale;
            const x = index * barWidth;
            const y = (canvas.height - barHeight) / 2;

            ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
    }

    /**
     * 設定微調刻度
     */
    setStepSize(ms) {
        this.stepSize = ms;
        document.getElementById('stepSize').value = ms;
    }
}
