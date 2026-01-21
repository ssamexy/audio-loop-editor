/**
 * Time Utilities - 時間格式轉換工具
 */

const TimeUtils = {
    /**
     * 解析時間字串為毫秒
     * 支援格式: MM:SS.mmm, HH:MM:SS.mmm, SS.mmm
     */
    parseToMs(timeStr) {
        if (!timeStr || timeStr.trim() === '') return 0;

        const parts = timeStr.trim().split(':');
        let hours = 0, minutes = 0, seconds = 0, milliseconds = 0;

        if (parts.length === 3) {
            // HH:MM:SS.mmm
            hours = parseInt(parts[0]) || 0;
            minutes = parseInt(parts[1]) || 0;
            const secParts = parts[2].split('.');
            seconds = parseInt(secParts[0]) || 0;
            milliseconds = parseInt(secParts[1]) || 0;
        } else if (parts.length === 2) {
            // MM:SS.mmm
            minutes = parseInt(parts[0]) || 0;
            const secParts = parts[1].split('.');
            seconds = parseInt(secParts[0]) || 0;
            milliseconds = parseInt(secParts[1]) || 0;
        } else {
            // SS.mmm
            const secParts = parts[0].split('.');
            seconds = parseInt(secParts[0]) || 0;
            milliseconds = parseInt(secParts[1]) || 0;
        }

        return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
    },

    /**
     * 毫秒轉換為時間字串 (MM:SS.mmm)
     */
    formatTime(ms) {
        if (ms < 0) ms = 0;

        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = ms % 1000;

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    },

    /**
     * 毫秒轉換為時間字串 (MM:SS) - 用於顯示
     */
    formatTimeSeconds(ms) {
        if (ms < 0) ms = 0;

        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },

    /**
     * 毫秒轉換為人類可讀格式
     */
    formatDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    },

    /**
     * 驗證時間範圍
     */
    validateRange(startMs, endMs, maxMs = Infinity) {
        if (startMs < 0 || endMs < 0) {
            return { valid: false, error: '時間不能為負數' };
        }
        if (startMs >= endMs) {
            return { valid: false, error: '開始時間必須小於結束時間' };
        }
        if (endMs > maxMs) {
            return { valid: false, error: '結束時間超過音訊長度' };
        }
        return { valid: true };
    }
};
