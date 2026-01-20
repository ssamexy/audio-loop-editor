/**
 * Audio Processor - 音訊處理器
 * 使用 Web Audio API 處理音訊檔案
 */

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.sourceNode = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
    }

    /**
     * 載入音訊檔案
     */
    async loadFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();

            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            return {
                success: true,
                duration: this.audioBuffer.duration,
                sampleRate: this.audioBuffer.sampleRate,
                channels: this.audioBuffer.numberOfChannels
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 播放音訊片段
     */
    async playSegment(startMs, endMs) {
        if (!this.audioBuffer) return;

        // 確保 AudioContext 已啟動 (解決瀏覽器自動暫停問題)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.stop();

        const startTime = startMs / 1000;
        const duration = (endMs - startMs) / 1000;

        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = this.audioBuffer;
        this.sourceNode.connect(this.audioContext.destination);

        this.sourceNode.start(0, startTime, duration);
        this.isPlaying = true;
        this.startTime = this.audioContext.currentTime;

        this.sourceNode.onended = () => {
            this.isPlaying = false;
        };
    }

    /**
     * 停止播放
     */
    stop() {
        if (this.sourceNode) {
            try {
                this.sourceNode.stop();
            } catch (e) {
                // Already stopped
            }
            this.sourceNode = null;
        }
        this.isPlaying = false;
    }

    /**
     * 取得波形資料
     */
    getWaveformData(width = 1000) {
        if (!this.audioBuffer) return null;

        const rawData = this.audioBuffer.getChannelData(0);
        const samples = width;
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];

        for (let i = 0; i < samples; i++) {
            const blockStart = blockSize * i;
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(rawData[blockStart + j]);
            }
            filteredData.push(sum / blockSize);
        }

        return filteredData;
    }

    /**
     * 剪輯音訊片段
     */
    async trimSegment(startMs, endMs) {
        if (!this.audioBuffer) return null;

        const startSample = Math.floor((startMs / 1000) * this.audioBuffer.sampleRate);
        const endSample = Math.floor((endMs / 1000) * this.audioBuffer.sampleRate);
        const length = endSample - startSample;

        const numberOfChannels = this.audioBuffer.numberOfChannels;
        const sampleRate = this.audioBuffer.sampleRate;

        const trimmedBuffer = this.audioContext.createBuffer(
            numberOfChannels,
            length,
            sampleRate
        );

        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sourceData = this.audioBuffer.getChannelData(channel);
            const targetData = trimmedBuffer.getChannelData(channel);

            for (let i = 0; i < length; i++) {
                targetData[i] = sourceData[startSample + i];
            }
        }

        return trimmedBuffer;
    }

    /**
     * 將 AudioBuffer 轉換為 WAV Blob
     */
    audioBufferToWav(buffer) {
        const length = buffer.length * buffer.numberOfChannels * 2 + 44;
        const arrayBuffer = new ArrayBuffer(length);
        const view = new DataView(arrayBuffer);
        const channels = [];
        let offset = 0;
        let pos = 0;

        // Write WAV header
        const setUint16 = (data) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };
        const setUint32 = (data) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };

        // "RIFF" chunk descriptor
        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"

        // "fmt " sub-chunk
        setUint32(0x20746d66); // "fmt "
        setUint32(16); // subchunk1size
        setUint16(1); // audio format (1 = PCM)
        setUint16(buffer.numberOfChannels);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // byte rate
        setUint16(buffer.numberOfChannels * 2); // block align
        setUint16(16); // bits per sample

        // "data" sub-chunk
        setUint32(0x61746164); // "data"
        setUint32(length - pos - 4); // subchunk2size

        // Write interleaved data
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        while (pos < length) {
            for (let i = 0; i < buffer.numberOfChannels; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    /**
     * 批次處理多個片段
     */
    async processSegments(segments, onProgress) {
        const results = [];

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            if (onProgress) {
                onProgress(i + 1, segments.length, `處理段落 ${segment.id}...`);
            }

            try {
                const trimmedBuffer = await this.trimSegment(segment.startMs, segment.endMs);
                const blob = this.audioBufferToWav(trimmedBuffer);

                results.push({
                    segment,
                    blob,
                    success: true
                });
            } catch (error) {
                results.push({
                    segment,
                    error: error.message,
                    success: false
                });
            }
        }

        return results;
    }

    /**
     * 取得音訊資訊
     */
    getInfo() {
        if (!this.audioBuffer) return null;

        return {
            duration: this.audioBuffer.duration,
            durationMs: Math.floor(this.audioBuffer.duration * 1000),
            sampleRate: this.audioBuffer.sampleRate,
            channels: this.audioBuffer.numberOfChannels,
            length: this.audioBuffer.length
        };
    }
}
