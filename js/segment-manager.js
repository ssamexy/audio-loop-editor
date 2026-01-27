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
            version: '1.1',
            source_file: sourceFileName,
            segments: this.segments.map(s => ({
                id: s.id,
                name: s.name,
                start_ms: s.startMs,
                end_ms: s.endMs
            }))
        };
    }

    /**
     * 從 JSON 匯入
     */
    importJSON(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            if (!data.segments || !Array.isArray(data.segments)) {
                throw new Error('無效的 JSON 格式');
            }

            this.clearAll();

            data.segments.forEach(s => {
                this.addSegment({
                    id: s.id,
                    name: s.name,
                    startMs: s.start_ms,
                    endMs: s.end_ms
                });
            });

            const successMsg = typeof i18n !== 'undefined'
                ? i18n.t('import_success', { count: data.segments.length })
                : `成功匯入 ${data.segments.length} 個段落`;

            return { success: true, message: successMsg };
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
        const errors = [];

        this.segments.forEach((segment, index) => {
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
    isSubSegment(id) {
        return String(id).includes('-');
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
