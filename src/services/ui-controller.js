/**
 * UI Controller - UI 控制器
 * 負責管理所有 UI 互動和渲染
 */

class UIController {
    constructor(segmentManager, audioProcessor, callbacks = {}) {
        this.segmentManager = segmentManager;
        this.audioProcessor = audioProcessor;
        this.callbacks = callbacks; // { onPlaySegment: function(segment) }
        this.stepSize = 1000; // 預設微調刻度 1000ms
        this.currentPlayingSegment = null;
    }

    /**
     * 渲染段落列表
     */
    renderSegments() {
        const container = document.getElementById('segmentsList');
        container.innerHTML = '';

        // Add Lock Toggle to Header (Only if not already present in DOM outside list?
        // Wait, segmentsList is the container. The header is likely outside.
        // Let's check app.html or if the user wants it inside the list header.
        // The list header is managed by HTML usually. 
        // Let's assume we can inject a button into the DOM near "ID" label if needed.
        // Or cleaner: check if 'lockIdToggle' exists.

        // Let's inject it into the segment list header via JS if it's dynamic, 
        // or ensure we setup listener in init. 
        // Current implementation of 'setupGlobalListeners' in app.js manages main listeners.
        // But UI changes (like adding a button to a static header) should probably be done once.
        // Here we just render rows.

        // However, we need to make sure the LOCK state is preserved.
        // We read it from 'lockIdToggle' dataset in createSegmentRow.

        // Let's try to find the header ID label and append the button if missing.
        const idHeader = document.querySelector('.segment-header .header-id');
        // Assuming there's a class. If not, we might need to rely on structure.
        // Let's look at index.html content? I don't see it.
        // I'll assume there is an element with text "ID" or similar.

        // Alternatively, I'll add a method `setupIdLockToggle` to be called once.

        this.ensureLockToggle();
        const segments = this.segmentManager.getSegments();

        try {
            segments.forEach((segment, index) => {
                const row = this.createSegmentRow(segment, index);
                container.appendChild(row);
            });
        } catch (e) {
            console.error('Render error:', e);
            alert(`渲染列表時發生錯誤: ${e.message}`);
        }

        // 更新段落數量顯示
        const count = segments.length;
        if (count > 0) {
            document.getElementById('segmentsSection').style.display = 'block';
            document.getElementById('exportSection').style.display = 'block';
        }
    }

    ensureLockToggle() {
        const idHeader = document.querySelector('.segment-col-id');
        if (!idHeader) return; // Should not happen if HTML is correct

        // Check if button already exists
        if (document.getElementById('lockIdToggle')) return;

        // Create Toggle Button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'lockIdToggle';
        toggleBtn.className = 'btn-icon-sm';
        toggleBtn.innerHTML = '🔒'; // Default Locked
        toggleBtn.title = typeof i18n !== 'undefined' ? i18n.t('unlock_ids') : '解鎖編號';
        toggleBtn.dataset.locked = 'true';
        toggleBtn.style.marginLeft = '5px';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.border = 'none';
        toggleBtn.style.background = 'transparent';
        toggleBtn.style.fontSize = '1.2em';

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isLocked = toggleBtn.dataset.locked === 'true';
            this.toggleIdLock(!isLocked);
        });

        // Append to header
        idHeader.appendChild(toggleBtn);
        // Force initial state render (if needed, though createSegmentRow reads DOM)
        // But since we just added it, existing rows might be stale if they were rendered before this call?
        // renderSegments calls ensureLockToggle *after* creating rows.
        // Wait, creating rows reads `document.getElementById('lockIdToggle')`. 
        // If it doesn't exist yet, it defaults to undefined.
        // My createSegmentRow logic: `const isLocked = document.getElementById('lockIdToggle')?.dataset.locked !== 'false';`
        // If element missing, `undefined !== 'false'` is TRUE. So defaults to Locked. Correct.

        // However, if we toggle, we need to update rows.
    }

    toggleIdLock(locked) {
        const btn = document.getElementById('lockIdToggle');
        if (!btn) return;

        btn.dataset.locked = locked;
        btn.innerHTML = locked ? '🔒' : '🔓';
        btn.title = locked
            ? (typeof i18n !== 'undefined' ? i18n.t('unlock_ids') : '解鎖編號')
            : (typeof i18n !== 'undefined' ? i18n.t('lock_ids') : '鎖定編號');

        // Update all existing rows
        const inputs = document.querySelectorAll('.segment-id-input');
        inputs.forEach(input => {
            input.readOnly = locked;
            if (locked) {
                input.classList.add('locked');
            } else {
                input.classList.remove('locked');
            }
        });

        const handles = document.querySelectorAll('.segment-drag-handle');
        handles.forEach(handle => {
            if (locked) {
                handle.classList.add('draggable-handle');
                handle.draggable = true;
                handle.title = typeof i18n !== 'undefined' ? i18n.t('drag_to_reorder') : '拖曳以排序';
            } else {
                handle.classList.remove('draggable-handle');
                handle.draggable = false;
                handle.title = '';
            }
        });
    }

    getSegmentDepth(segment) {
        if (segment.parentId === undefined || segment.parentId === null) {
            return Math.max(0, String(segment.id).split('-').length - 1);
        }

        const segmentsById = new Map(
            this.segmentManager.getSegments().map(item => [String(item.id), item])
        );
        let depth = 1;
        let parentId = String(segment.parentId);
        const visited = new Set();

        while (parentId && !visited.has(parentId)) {
            visited.add(parentId);
            const parent = segmentsById.get(parentId);
            if (!parent || parent.parentId === undefined || parent.parentId === null) {
                break;
            }
            depth += 1;
            parentId = String(parent.parentId);
        }

        return depth;
    }

    /**
     * 建立段落列
     */
    createSegmentRow(segment, index) {
        const row = document.createElement('div');
        row.className = 'segment-row';
        row.dataset.segmentId = segment.id;
        row.dataset.index = index;

        // The row accepts drops, but only the dedicated handle starts a drag.
        row.draggable = false;

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            row.classList.add('drag-over');
        });
        row.addEventListener('dragleave', () => {
            row.classList.remove('drag-over');
        });
        row.addEventListener('drop', (e) => {
            e.preventDefault();
            row.classList.remove('drag-over');
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(row.dataset.index);
            if (!isNaN(fromIndex) && fromIndex !== toIndex) {
                this.segmentManager.reorderSegment(fromIndex, toIndex);
            }
        });

        const hierarchyLevel = this.getSegmentDepth(segment);
        if (hierarchyLevel === 1) {
            row.classList.add('sub-segment');
        } else if (hierarchyLevel >= 2) {
            row.classList.add('level-3');
        }

        // Tooltip for Duration
        const durationSec = (segment.endMs - segment.startMs) / 1000;
        row.title = (typeof i18n !== 'undefined' ? i18n.t('duration') : '長度') + `: ${durationSec.toFixed(1)}s`;

        // ID Container (Handle + Input)
        const idContainer = document.createElement('div');
        idContainer.className = 'segment-id-container';
        idContainer.style.display = 'flex';
        idContainer.style.alignItems = 'center';
        idContainer.style.marginRight = '5px';
        idContainer.draggable = false;

        const dragHandle = document.createElement('span');
        dragHandle.className = 'segment-drag-handle';
        dragHandle.textContent = '↕';
        dragHandle.setAttribute('aria-label', typeof i18n !== 'undefined' ? i18n.t('drag_to_reorder') : '拖曳以排序');

        // ID 輸入 (加入鎖定邏輯)
        const idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.value = segment.id;
        idInput.className = 'segment-id-input';

        // 根據全域鎖定狀態設定
        const isLocked = document.getElementById('lockIdToggle')?.dataset.locked !== 'false'; // Default locked
        idInput.readOnly = isLocked;
        if (isLocked) {
            idInput.classList.add('locked');
            dragHandle.classList.add('draggable-handle');
            dragHandle.draggable = true;
            dragHandle.title = typeof i18n !== 'undefined' ? i18n.t('drag_to_reorder') : '拖曳以排序';
        } else {
            idInput.classList.remove('locked');
            dragHandle.classList.remove('draggable-handle');
            dragHandle.draggable = false;
            dragHandle.title = '';
        }

        // ID Update Logic
        idInput.addEventListener('change', () => {
            if (idInput.readOnly) return;
            const newId = idInput.value.trim();
            if (!newId) {
                alert(typeof i18n !== 'undefined' ? i18n.t('id_empty') : '編號不能為空');
                idInput.value = segment.id;
                return;
            }
            // 檢查是否重複
            const existingIds = this.segmentManager.getSegments().map(s => String(s.id));
            if (existingIds.includes(newId) && newId !== segment.id) {
                alert(typeof i18n !== 'undefined' ? i18n.t('id_duplicate') : '此編號已存在，請使用其他編號');
                idInput.value = segment.id;
                return;
            }
            const renameResult = typeof this.segmentManager.renameSegment === 'function'
                ? this.segmentManager.renameSegment(segment.id, newId)
                : (this.segmentManager.updateSegment(segment.id, { id: newId }), true);
            if (renameResult === false) {
                idInput.value = segment.id;
                return;
            }
            // re-render handled by update? No, usually fine, but data-id update needed
            row.dataset.segmentId = newId;
        });

        // Drag Events specifically for the dedicated handle
        dragHandle.addEventListener('dragstart', (e) => {
            if (!dragHandle.draggable) {
                e.preventDefault();
                return;
            }
            row.classList.add('dragging'); // View feedback on row
            e.dataTransfer.setData('text/plain', index);
            e.dataTransfer.effectAllowed = 'move';
        });
        dragHandle.addEventListener('dragend', () => {
            row.classList.remove('dragging');
        });

        idContainer.appendChild(dragHandle);
        idContainer.appendChild(idInput);

        // 名稱輸入
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = segment.name;
        nameInput.placeholder = typeof i18n !== 'undefined' ? i18n.t('segment_name') : '段落名稱';
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

        // UIController.createTimeInputGroup calls onChange -> segmentManager.updateSegment -> notifies -> renderSegments.
        // So re-render happens. The display will update.

        // 操作按鈕
        const actions = document.createElement('div');
        actions.className = 'segment-actions';

        // 播放按鈕
        const playBtn = document.createElement('button');
        playBtn.className = 'btn-icon play';
        playBtn.textContent = '▶';
        playBtn.setAttribute('data-i18n-title', 'play_main');
        playBtn.title = typeof i18n !== 'undefined' ? i18n.t('play_main') : '試播放';
        playBtn.dataset.segmentId = segment.id;
        playBtn.addEventListener('click', () => this.playSegment(segment, playBtn));
        actions.appendChild(playBtn);

        // 新增子段落按鈕
        const addSubBtn = document.createElement('button');
        addSubBtn.className = 'btn-icon add-sub';
        addSubBtn.setAttribute('data-i18n', 'add_sub');
        addSubBtn.setAttribute('data-i18n-title', 'add_sub_title');
        addSubBtn.textContent = typeof i18n !== 'undefined' ? i18n.t('add_sub') : '+子';
        addSubBtn.title = typeof i18n !== 'undefined' ? i18n.t('add_sub_title') : '新增子段落';

        // 綁定事件
        addSubBtn.addEventListener('click', (e) => {
            this.showSubSegmentMenu(segment, e.target);
        });
        actions.appendChild(addSubBtn);

        // 刪除按鈕
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon delete';
        deleteBtn.textContent = '✕';
        deleteBtn.setAttribute('data-i18n-title', 'delete_title');
        deleteBtn.title = typeof i18n !== 'undefined' ? i18n.t('delete_title') : '刪除';
        deleteBtn.addEventListener('click', () => {
            if (confirm(typeof i18n !== 'undefined' ? i18n.t('confirm_delete', { id: segment.id }) : `確定要刪除段落 ${segment.id} 嗎？`)) {
                this.segmentManager.deleteSegment(segment.id);
            }
        });
        actions.appendChild(deleteBtn);

        // Assemble Row
        row.appendChild(idContainer);
        row.appendChild(nameInput);
        // Duration removed from layout, now in tooltip
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
     * 播放段落 (使用浮動播放器)
     */
    playSegment(segment, playBtn) {
        const audioPlayer = document.getElementById('audioPlayer');

        // 檢查是否點擊同一個正在播放的段落的按鈕
        if (playBtn && playBtn.classList.contains('playing')) {
            // 切換暫停/播放
            if (audioPlayer.paused) {
                audioPlayer.play();
                playBtn.textContent = '⏸';
                document.getElementById('btnPlayPause').textContent = '⏸';
            } else {
                audioPlayer.pause();
                playBtn.textContent = '▶';
                document.getElementById('btnPlayPause').textContent = '▶';
            }
            return;
        }

        // 重置所有其他播放按鈕為播放狀態
        document.querySelectorAll('.btn-icon.play, .btn-icon.playing').forEach(btn => {
            btn.textContent = '▶';
            btn.classList.remove('playing');
            btn.classList.add('play');
        });

        // 重置主播放按鈕樣式
        const btnPlayMain = document.getElementById('btnPlayMain');
        if (btnPlayMain) {
            btnPlayMain.innerHTML = '▶ ' + (typeof i18n !== 'undefined' ? i18n.t('play_main').replace('▶ ', '') : '播放');
        }

        // 使用 callback 如果有提供
        if (this.callbacks && typeof this.callbacks.onPlaySegment === 'function') {
            this.callbacks.onPlaySegment(segment);

            // 將當前按鈕設為暫停狀態
            if (playBtn) {
                playBtn.textContent = '⏸';
                playBtn.classList.remove('play');
                playBtn.classList.add('playing');
            }
        } else {
            // 後備方案: 使用 AudioProcessor
            console.warn('UIController: using fallback audioProcessor play');
            if (this.currentPlayingSegment === segment.id) {
                this.audioProcessor.stop();
                this.currentPlayingSegment = null;
            } else {
                this.audioProcessor.playSegment(segment.startMs, segment.endMs);
                this.currentPlayingSegment = segment.id;
            }
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
        if (!canvas) return; // 沒 canvas 就不畫
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
        // 顯示為秒 (例如 1000ms -> 1s)
        const stepInput = document.getElementById('stepSize');
        if (stepInput) {
            stepInput.value = ms / 1000;
        }
    }

    /**
     * 顯示子段落選單
     */
    showSubSegmentMenu(parentSegment, button) {
        // 移除舊選單
        const existingMenu = document.querySelector('.sub-segment-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'sub-segment-menu';

        const menuTitle = typeof i18n !== 'undefined' ? i18n.t('sub_menu_title') : '新增子段落方式';
        const splitPosition = typeof i18n !== 'undefined' ? i18n.t('split_position') : '📍 從當前播放位置二分';
        const splitUnit = typeof i18n !== 'undefined' ? i18n.t('split_unit') : '⏱️ 依時間單位切分...';
        const splitEvenly = typeof i18n !== 'undefined' ? i18n.t('split_evenly') : '🔢 平均分為 N 段...';
        const splitChild = typeof i18n !== 'undefined' ? i18n.t('sub_menu_split_child') : '↳ 二分為子段落';
        const splitSibling = typeof i18n !== 'undefined' ? i18n.t('sub_menu_split_sibling') : '✂️ 同層切分';

        const currentLevel = String(parentSegment.id).split('-').length;
        const isMaxLevel = currentLevel >= 3;

        if (isMaxLevel) {
            // 第三層選單：僅支援同層切分
            menu.innerHTML = `
                <div class="menu-title">${menuTitle}</div>
                <button class="menu-item" data-action="split-sibling">${splitSibling}</button>
                <button class="menu-item menu-cancel">✕ ${typeof i18n !== 'undefined' ? i18n.t('cancel') : '取消'}</button>
            `;
        } else {
            // 第一、二層選單：支援所有功能
            menu.innerHTML = `
                <div class="menu-title">${menuTitle}</div>
                <button class="menu-item" data-action="split-at-position">${splitPosition}<br><small>(${splitChild})</small></button>
                <button class="menu-item" data-action="split-sibling">${splitSibling}</button>
                <button class="menu-item" data-action="split-by-unit">${splitUnit}<br><small>(${splitChild})</small></button>
                <button class="menu-item" data-action="split-evenly">${splitEvenly}<br><small>(${splitChild})</small></button>
                <button class="menu-item menu-cancel">✕ ${typeof i18n !== 'undefined' ? i18n.t('cancel') : '取消'}</button>
            `;
        }

        // 定位選單
        const rect = button.getBoundingClientRect();
        menu.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 5}px;
            left: ${rect.left}px;
            z-index: 10000;
        `;

        document.body.appendChild(menu);

        // 選單事件
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (!action) return;

            const audioPlayer = document.getElementById('audioPlayer');
            const parentDuration = parentSegment.endMs - parentSegment.startMs;
            const currentLevel = String(parentSegment.id).split('-').length;

            if (action === 'split-at-position') {
                if (currentLevel >= 3) {
                    alert('已達最大層級限制 (3層)');
                    menu.remove();
                    return;
                }
                const currentPos = audioPlayer.currentTime * 1000;
                if (currentPos >= parentSegment.startMs && currentPos <= parentSegment.endMs) {
                    const subSegments = this.segmentManager.getSegments().filter(s => s.id.startsWith(`${parentSegment.id}-`));
                    const nextNum = subSegments.length + 1;

                    this.segmentManager.addSubSegment(parentSegment.id, {
                        id: `${parentSegment.id}-${nextNum}`,
                        name: `${parentSegment.name}-A`,
                        startMs: parentSegment.startMs,
                        endMs: Math.floor(currentPos)
                    });
                    this.segmentManager.addSubSegment(parentSegment.id, {
                        id: `${parentSegment.id}-${nextNum + 1}`,
                        name: `${parentSegment.name}-B`,
                        startMs: Math.floor(currentPos),
                        endMs: parentSegment.endMs
                    });
                } else {
                    alert('請先將播放位置移動到此段落範圍內');
                }
            } else if (action === 'split-by-unit') {
                if (currentLevel >= 3) {
                    alert('已達最大層級限制 (3層)');
                    menu.remove();
                    return;
                }
                const promptMsg = typeof i18n !== 'undefined' ? i18n.t('enter_unit') : '請輸入每段時長 (秒):';
                const unitMs = prompt(promptMsg, '10');
                if (unitMs) {
                    const unitValue = parseFloat(unitMs) * 1000;
                    if (unitValue > 0 && unitValue < parentDuration) {
                        const subSegments = this.segmentManager.getSegments().filter(s => s.id.startsWith(`${parentSegment.id}-`));
                        let nextNum = subSegments.length + 1;

                        for (let t = parentSegment.startMs; t < parentSegment.endMs; t += unitValue) {
                            this.segmentManager.addSubSegment(parentSegment.id, {
                                id: `${parentSegment.id}-${nextNum}`,
                                name: `${parentSegment.name}-${nextNum}`,
                                startMs: Math.floor(t),
                                endMs: Math.floor(Math.min(t + unitValue, parentSegment.endMs))
                            });
                            nextNum++;
                        }
                    } else {
                        alert('時長需大於 0 且小於段落總長');
                    }
                }
            } else if (action === 'split-evenly') {
                if (currentLevel >= 3) {
                    alert('已達最大層級限制 (3層)');
                    menu.remove();
                    return;
                }
                const promptMsg = typeof i18n !== 'undefined' ? i18n.t('enter_even') : '請輸入要平分的段落數量 (2-20):';
                const num = prompt(promptMsg, '2');
                if (num) {
                    const n = parseInt(num);
                    if (n >= 2 && n <= 20) {
                        const segDuration = parentDuration / n;
                        const subSegments = this.segmentManager.getSegments().filter(s => s.id.startsWith(`${parentSegment.id}-`));
                        let nextNum = subSegments.length + 1;

                        for (let i = 0; i < n; i++) {
                            this.segmentManager.addSubSegment(parentSegment.id, {
                                id: `${parentSegment.id}-${nextNum}`,
                                name: `${parentSegment.name}-${nextNum}`,
                                startMs: Math.floor(parentSegment.startMs + i * segDuration),
                                endMs: Math.floor(parentSegment.startMs + (i + 1) * segDuration)
                            });
                            nextNum++;
                        }
                    } else {
                        alert('請輸入 2-20 之間的數字');
                    }
                }
            } else if (action === 'split-sibling') {
                const currentPos = audioPlayer.currentTime * 1000;
                if (currentPos > parentSegment.startMs && currentPos < parentSegment.endMs) {
                    const originalId = String(parentSegment.id);
                    const idParts = originalId.split('-');
                    const prefix = idParts.length > 1 ? idParts.slice(0, -1).join('-') + '-' : '';
                    const lastPart = idParts[idParts.length - 1];

                    // 產生下一個可用的同層 ID
                    const getNextSiblingId = (baseId) => {
                        const parts = baseId.split('-');
                        let num = parseInt(parts.pop());
                        if (isNaN(num)) return baseId + '_2';

                        let candidate = prefix + (num + 1);
                        while (this.segmentManager.getSegments().some(s => s.id === candidate)) {
                            num++;
                            candidate = prefix + (num + 1);
                        }
                        return candidate;
                    };

                    const seg1 = {
                        id: originalId,
                        name: parentSegment.name + '-1',
                        startMs: parentSegment.startMs,
                        endMs: Math.floor(currentPos)
                    };
                    const seg2 = {
                        id: getNextSiblingId(originalId),
                        name: parentSegment.name + '-2',
                        startMs: Math.floor(currentPos),
                        endMs: parentSegment.endMs
                    };
                    this.segmentManager.replaceSegment(parentSegment.id, [seg1, seg2]);
                } else {
                    alert('請將播放位置移動到此段落範圍內');
                }
            }

            menu.remove();
        });

        // 點擊外部關閉
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target !== button) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    /**
     * 新增標記線
     * @note 暫時停用此功能
     */
    addMarker(percentage) {
        // const bar = document.querySelector('.floating-player-seekbar');
        // if (!bar) return;
        // const marker = document.createElement('div');
        // marker.className = 'seek-marker';
        // marker.style.left = `${percentage}%`;
        // bar.appendChild(marker);
    }

    /**
     * 清除標記線
     * @note 暫時停用此功能
     */
    clearMarkers() {
        // document.querySelectorAll('.seek-marker').forEach(el => el.remove());
    }
}
