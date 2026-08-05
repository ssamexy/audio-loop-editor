/**
 * Segment Manager - 段落管理器
 */

class SegmentManager {
    constructor() {
        this.segments = [];
        this.nextId = 1;
        this.onChange = null;
    }

    /**
     * 新增段落
     */
    addSegment(segment) {
        if (!segment.id) {
            segment.id = String(this.nextId++);
        }
        this.segments.push(segment);
        this._notifyChange();
        return segment;
    }

    /**
     * 新增子段落
     */
    addSubSegment(parentId, segmentData) {
        const parent = this.segments.find(s => s.id === parentId);
        if (!parent) return null;

        const subSegment = {
            id: segmentData.id,
            name: segmentData.name,
            startMs: segmentData.startMs,
            endMs: segmentData.endMs
        };
        this._copyOptionalFields(subSegment, segmentData);

        // 插入到父段落後面
        const parentIndex = this.segments.findIndex(s => s.id === parentId);
        const lastSubIndex = this._findLastSubSegmentIndex(parentId);
        const insertIndex = lastSubIndex >= 0 ? lastSubIndex + 1 : parentIndex + 1;

        this.segments.splice(insertIndex, 0, subSegment);
        this._notifyChange();
        return subSegment;
    }

    /**
     * 找出父段落的最後一個子段落索引
     */
    _findLastSubSegmentIndex(parentId) {
        let lastIndex = -1;
        for (let i = 0; i < this.segments.length; i++) {
            if (this.segments[i].id.startsWith(`${parentId}-`)) {
                lastIndex = i;
            }
        }
        return lastIndex;
    }

    /**
     * 更新段落
     */
    updateSegment(id, updates) {
        const segment = this.segments.find(s => s.id === id);
        if (segment) {
            Object.assign(segment, updates);
            this._notifyChange();
        }
    }

    /**
     * 刪除段落
     */
    deleteSegment(id) {
        const targetId = String(id);
        const index = this.segments.findIndex(s => String(s.id) === targetId);
        if (index >= 0) {
            // 如果是主段落 (不含 "-")，也要刪除所有子段落
            if (!targetId.includes('-')) {
                const prefix = `${targetId}-`;
                this.segments = this.segments.filter(s => !String(s.id).startsWith(prefix) && String(s.id) !== targetId);
            } else {
                this.segments.splice(index, 1);
            }
            this._notifyChange();
        }
    }

    /**
     * 重新排序段落
     */
    /**
     * 重新排序段落
     */
    reorderSegment(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.segments.length) return;
        if (toIndex < 0 || toIndex >= this.segments.length) return;

        const [removed] = this.segments.splice(fromIndex, 1);
        this.segments.splice(toIndex, 0, removed);

        this.renumberAll();
        this._notifyChange();
    }

    /**
     * 重新編號所有段落 (保持層級結構)
     */
    renumberAll() {
        let mainCounter = 0;
        let currentMainId = null;
        let subCounters = {};

        this.segments.forEach(segment => {
            const oldId = String(segment.id);
            const level = oldId.split('-').length;

            if (level === 1 || currentMainId === null) {
                // 主段落 (或列表開頭的子段落被迫變為主段落)
                mainCounter++;
                const newId = String(mainCounter);
                if (segment.id !== newId) {
                    segment.id = newId;
                }
                currentMainId = newId;
                subCounters[currentMainId] = 0;
            } else {
                // 子段落
                subCounters[currentMainId]++;
                // 支援多層級：這裡簡化為皆依附於最近的主段落
                // 若原為 1-1-1 (Level 3), 在此簡易邏輯下可能變為 Main-N (Level 2)
                // 若需嚴格支援多層級，需遞迴或 stack，但依需求與現有兩層為主，這足以應付
                // 我們嘗試保留原來的相對層級嗎？
                // 簡單起見，將所有 "非 Level 1" 都視為 "Level 2" 依附於 currentMain
                // 除非我們想支援 3 層。
                // 檢查原始 Level
                if (level >= 3) {
                    // 嘗試保留 3 層? logic gets complex. 
                    // 讓我們先統一由 Main 重新計數，變成 2 層結構 (Main - Sub)
                    // 或是維持字尾?
                    // 為了符合 "Auto Renumber" 預期，重列為 1, 1-1, 1-2... 是最乾淨的
                    const newId = `${currentMainId}-${subCounters[currentMainId]}`;
                    segment.id = newId;
                } else {
                    const newId = `${currentMainId}-${subCounters[currentMainId]}`;
                    segment.id = newId;
                }
                if (segment.parentId !== undefined || level > 1) {
                    segment.parentId = currentMainId;
                }
            }

            //Update Name if it was default name? No, keep user name.
        });
    }

    /**
     * 取代段落 (用於同層切分)
     */
    replaceSegment(id, newSegments) {
        const index = this.segments.findIndex(s => s.id === id);
        if (index >= 0) {
            // 暫時給予臨時 ID，notifyChange 後若有 renumber 需求...
            // 但 replaceSegment 通常發生在中間，ID 可能會衝突
            // 這裡我們不自動 renumber，保持 create logic
            newSegments.forEach(s => {
                if (!s.id) s.id = String(this.nextId++);
            });
            this.segments.splice(index, 1, ...newSegments);
            this._notifyChange();
        }
    }

    /**
     * 清除所有段落
     */
    clearAll() {
        this.segments = [];
        this.nextId = 1;
        this._notifyChange();
    }

    /**
     * 自動切分
     */
    autoSplit(totalDurationMs, numSegments) {
        this.clearAll();
        const segmentLength = totalDurationMs / numSegments;
        const segmentLabel = typeof i18n !== 'undefined' ? i18n.t('segment_label') : '段落';

        for (let i = 0; i < numSegments; i++) {
            const startMs = Math.floor(i * segmentLength);
            const endMs = i === numSegments - 1 ? totalDurationMs : Math.floor((i + 1) * segmentLength);

            this.addSegment({
                id: String(i + 1),
                name: `${segmentLabel} ${i + 1}`,
                startMs,
                endMs
            });
        }
    }

    /**
     * 匯出為 JSON
     */
    exportJSON(sourceFileName = '') {
        return {
            version: '1.2',
            source_file: sourceFileName,
            segments: this.segments.map(segment => this._toJSONSegment(segment))
        };
    }

    _toJSONSegment(segment) {
        const result = {
            id: segment.id,
            name: segment.name,
            start_ms: segment.startMs,
            end_ms: segment.endMs
        };
        this._copyOptionalFields(result, segment);
        return result;
    }

    _fromJSONSegment(segment) {
        const result = {
            id: segment.id,
            name: segment.name,
            startMs: segment.start_ms ?? segment.startMs,
            endMs: segment.end_ms ?? segment.endMs
        };
        this._copyOptionalFields(result, {
            parentId: segment.parentId ?? segment.parent_id,
            source: segment.source,
            cutReason: segment.cutReason ?? segment.cut_reason,
            confidence: segment.confidence
        });
        return result;
    }

    _copyOptionalFields(target, source) {
        if (source.parentId !== undefined && source.parentId !== null) {
            target.parentId = source.parentId;
        }
        if (source.source !== undefined && source.source !== null) {
            target.source = source.source;
        }
        if (source.cutReason !== undefined && source.cutReason !== null) {
            target.cutReason = source.cutReason;
        }
        if (source.confidence !== undefined && source.confidence !== null) {
            target.confidence = source.confidence;
        }
    }

    /**
     * 偵測 JSON 格式類型
     * @param {Object} data - 已解析的 JSON 物件
     * @returns {'audio_loop_editor'|'youtube_looper'|'unknown'}
     */
    _detectFormat(data) {
        if (data && Array.isArray(data.loops)) {
            return 'youtube_looper';
        }
        if (data && Array.isArray(data.segments)) {
            return 'audio_loop_editor';
        }
        return 'unknown';
    }

    /**
     * 將 YouTube Looper 格式轉換為內部段落格式
     *
     * YouTube Looper schema:
     * {
     *   "loops": [
     *     { "id": "<uid>", "startTime": <sec>, "endTime": <sec>,
     *       "label": "<label>", "source": "youtube:<VIDEO_ID>", "readonly": <bool> }
     *   ],
     *   "sourceId": "youtube:<VIDEO_ID>"
     * }
     *
     * 轉換規則:
     *   startTime / endTime (秒, 浮點) → startMs / endMs (毫秒, 四捨五入)
     *   label → id 與 name 前綴 ("Segment {label}")
     *   sourceId → 保留為參考資訊 (不強制載入音檔)
     *
     * @param {Object} data - YouTube Looper JSON 物件
     * @returns {{ segments: Array, sourceId: string }}
     */
    _fromYouTubeLooper(data) {
        const sourceId = data.sourceId || '';
        const segments = (data.loops || []).map(loop => ({
            id: String(loop.label ?? loop.id),
            name: `Segment ${loop.label ?? loop.id}`,
            startMs: Math.round(parseFloat(loop.startTime || 0) * 1000),
            endMs: Math.round(parseFloat(loop.endTime || 0) * 1000),
            source: loop.source || sourceId || undefined,
        })).sort((first, second) => this._compareSegmentIds(first.id, second.id));
        return { segments, sourceId };
    }

    /**
     * 依階層編號自然排序，例如 1, 1-1, 1-2, 2, 2-1, 10。
     * YouTube Looper 匯出的 loops 不保證依畫面階層順序排列。
     */
    _compareSegmentIds(firstId, secondId) {
        const firstParts = String(firstId).split('-');
        const secondParts = String(secondId).split('-');
        const partCount = Math.max(firstParts.length, secondParts.length);

        for (let index = 0; index < partCount; index++) {
            const firstPart = firstParts[index];
            const secondPart = secondParts[index];

            if (firstPart === undefined) return -1;
            if (secondPart === undefined) return 1;

            const firstNumber = Number(firstPart);
            const secondNumber = Number(secondPart);
            const bothNumeric = Number.isFinite(firstNumber) && Number.isFinite(secondNumber);

            if (bothNumeric && firstNumber !== secondNumber) {
                return firstNumber - secondNumber;
            }

            if (!bothNumeric && firstPart !== secondPart) {
                return firstPart.localeCompare(secondPart, undefined, { numeric: true });
            }
        }

        return 0;
    }

    /**
     * 從 JSON 匯入 (自動偵測格式)
     *
     * 支援:
     *  - Audio Loop Editor 格式 (segments[]/start_ms/end_ms)
     *  - YouTube Looper 格式    (loops[]/startTime/endTime/label)
     */
    importJSON(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            const fmt = this._detectFormat(data);

            if (fmt === 'unknown') {
                throw new Error('無法識別的 JSON 格式（既不是 Audio Loop Editor 也不是 YouTube Looper）');
            }

            this.clearAll();

            let segmentsToLoad = [];

            if (fmt === 'youtube_looper') {
                const converted = this._fromYouTubeLooper(data);
                segmentsToLoad = converted.segments;
                // sourceId 僅供參考，不自動載入音檔（Web 版無本地檔案路徑概念）
            } else {
                // audio_loop_editor
                segmentsToLoad = (data.segments || []).map(s => this._fromJSONSegment(s));
            }

            segmentsToLoad.forEach(s => this.addSegment(s));

            const count = segmentsToLoad.length;
            const formatLabel = fmt === 'youtube_looper' ? ' (YouTube Looper)' : '';
            const successMsg = typeof i18n !== 'undefined'
                ? i18n.t('import_success', { count })
                : `成功匯入 ${count} 個段落${formatLabel}`;

            return { success: true, message: successMsg, format: fmt };
        } catch (error) {
            const errorMsg = typeof i18n !== 'undefined'
                ? i18n.t('import_failed', { error: error.message })
                : `匯入失敗: ${error.message}`;

            return { success: false, message: errorMsg };
        }
    }

    /**
     * 驗證所有段落
     */
    validateAll(maxDurationMs) {
        return this.validateSegments(this.segments, maxDurationMs);
    }

    validateSegments(segments, maxDurationMs) {
        const errors = [];

        segments.forEach((segment, index) => {
            if (!segment.id || !segment.name) {
                errors.push(`段落 ${index + 1}: 缺少編號或名稱`);
            }

            const validation = TimeUtils.validateRange(segment.startMs, segment.endMs, maxDurationMs);
            if (!validation.valid) {
                errors.push(`段落 ${segment.id}: ${validation.error}`);
            }
        });

        return { valid: errors.length === 0, errors };
    }

    /**
     * 檢查是否為子段落
     */
    isSubSegment(segmentOrId) {
        if (segmentOrId && typeof segmentOrId === 'object') {
            if (segmentOrId.parentId !== undefined && segmentOrId.parentId !== null) {
                return true;
            }
            return String(segmentOrId.id).includes('-');
        }
        return String(segmentOrId).includes('-');
    }

    getParentSegments() {
        return this.segments.filter(segment => !this.isSubSegment(segment));
    }

    getChildSegments() {
        return this.segments.filter(segment => this.isSubSegment(segment));
    }

    /**
     * 通知變更
     */
    _notifyChange() {
        if (this.onChange) {
            this.onChange(this.segments);
        }
    }

    /**
     * 取得所有段落
     */
    getSegments() {
        return this.segments;
    }

    /**
     * 取得段落數量
     */
    getCount() {
        return this.segments.length;
    }
}
