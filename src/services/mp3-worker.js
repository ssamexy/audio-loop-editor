/**
 * MP3 Encoding Web Worker
 * Offloads MP3 encoding from the main thread to prevent UI freezing.
 */

importScripts('https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js');

self.onmessage = function (e) {
    const { channels, sampleRate, kbps, leftData, rightData, taskId } = e.data;

    try {
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
        const mp3Data = [];
        const blockSize = 1152;

        const totalSamples = leftData.length;
        let lastReportedProgress = 0;

        for (let i = 0; i < totalSamples; i += blockSize) {
            const leftChunk = leftData.subarray(i, i + blockSize);
            const rightChunk = rightData ? rightData.subarray(i, i + blockSize) : leftChunk;

            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(new Uint8Array(mp3buf));
            }

            // Report progress every 5%
            const progress = Math.floor((i / totalSamples) * 100);
            if (progress >= lastReportedProgress + 5) {
                lastReportedProgress = progress;
                self.postMessage({ type: 'progress', progress, taskId });
            }
        }

        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(new Uint8Array(mp3buf));
        }

        self.postMessage({
            type: 'done',
            mp3Data: mp3Data, // Array of Uint8Arrays
            taskId
        });

    } catch (error) {
        self.postMessage({ type: 'error', error: error.message, taskId });
    }
};
