/**
 * Smart Practice Splitter
 * Finds low-energy boundaries for practice-sized segments.
 */

class PracticeSplitter {
    constructor(defaults = {}) {
        this.defaults = {
            parentTargetSec: 90,
            childTargetSec: 30,
            childMinSec: 22,
            childMaxSec: 38,
            searchRadiusSec: 8,
            analysisWindowSec: 0.35,
            analysisStepSec: 0.25,
            ...defaults
        };
    }

    split(audioBuffer, options = {}) {
        if (!audioBuffer || !audioBuffer.sampleRate || !audioBuffer.length) {
            throw new Error('A decoded AudioBuffer is required');
        }

        const config = this._normalizeOptions(options);
        const analysis = this._createAnalysisContext(audioBuffer);
        const durationSec = analysis.durationSec;
        const childCount = this._calculateCount(durationSec, config.childTargetSec);
        const boundaries = this._findBoundaries(analysis, durationSec, childCount, config);
        const children = this._buildChildren(boundaries, config);
        const parents = this._buildParents(children, durationSec, config);

        return this._interleaveSegments(parents, children);
    }

    _normalizeOptions(options) {
        const config = { ...this.defaults, ...options };
        config.parentTargetSec = this._positiveNumber(config.parentTargetSec, 'parentTargetSec');
        config.childTargetSec = this._positiveNumber(config.childTargetSec, 'childTargetSec');
        config.childMinSec = this._positiveNumber(config.childMinSec, 'childMinSec');
        config.childMaxSec = this._positiveNumber(config.childMaxSec, 'childMaxSec');
        config.searchRadiusSec = this._positiveNumber(config.searchRadiusSec, 'searchRadiusSec');
        config.analysisWindowSec = this._positiveNumber(config.analysisWindowSec, 'analysisWindowSec');
        config.analysisStepSec = this._positiveNumber(config.analysisStepSec, 'analysisStepSec');

        if (config.childMinSec > config.childTargetSec || config.childTargetSec > config.childMaxSec) {
            throw new Error('Child segment minimum, target, and maximum must be in ascending order');
        }

        return config;
    }

    _positiveNumber(value, name) {
        const number = Number(value);
        if (!Number.isFinite(number) || number <= 0) {
            throw new Error(`${name} must be a positive number`);
        }
        return number;
    }

    _createAnalysisContext(audioBuffer) {
        const channels = [];
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            channels.push(audioBuffer.getChannelData(channel));
        }

        return {
            channels,
            sampleRate: audioBuffer.sampleRate,
            durationSec: audioBuffer.duration || audioBuffer.length / audioBuffer.sampleRate
        };
    }

    _calculateCount(durationSec, targetSec) {
        return Math.max(1, Math.round(durationSec / targetSec));
    }

    _findBoundaries(analysis, durationSec, childCount, config) {
        const boundaries = [{ timeSec: 0, confidence: 1, reason: 'track-start' }];

        for (let index = 1; index < childCount; index++) {
            const previousTime = boundaries[index - 1].timeSec;
            const remainingSegments = childCount - index;
            const lowerBound = Math.max(
                previousTime + config.childMinSec,
                durationSec - remainingSegments * config.childMaxSec
            );
            const upperBound = Math.min(
                previousTime + config.childMaxSec,
                durationSec - remainingSegments * config.childMinSec
            );
            const idealTime = durationSec * index / childCount;
            const cut = this._findBestCut(
                analysis,
                idealTime,
                lowerBound,
                upperBound,
                config
            );

            boundaries.push(cut);
        }

        boundaries.push({ timeSec: durationSec, confidence: 1, reason: 'track-end' });
        return boundaries;
    }

    _findBestCut(analysis, idealTime, lowerBound, upperBound, config) {
        if (upperBound <= lowerBound) {
            return {
                timeSec: Math.max(lowerBound, Math.min(idealTime, upperBound)),
                confidence: 0,
                reason: 'duration-constraint'
            };
        }

        const searchStart = Math.max(
            lowerBound,
            Math.min(upperBound, idealTime - config.searchRadiusSec)
        );
        const searchEnd = Math.min(
            upperBound,
            Math.max(lowerBound, idealTime + config.searchRadiusSec)
        );
        const candidates = [];

        for (let timeSec = searchStart; timeSec <= searchEnd; timeSec += config.analysisStepSec) {
            candidates.push({
                timeSec,
                energy: this._measureRms(analysis, timeSec, config.analysisWindowSec)
            });
        }

        candidates.push({
            timeSec: searchEnd,
            energy: this._measureRms(analysis, searchEnd, config.analysisWindowSec)
        });

        const best = candidates.reduce((current, candidate) => (
            candidate.energy < current.energy ? candidate : current
        ));
        const energies = candidates.map(candidate => candidate.energy);
        const minimum = Math.min(...energies);
        const maximum = Math.max(...energies);
        const spread = maximum - minimum;
        const confidence = spread > Number.EPSILON
            ? Math.min(1, Math.max(0, (maximum - best.energy) / spread))
            : 0.5;

        return {
            timeSec: Math.max(lowerBound, Math.min(best.timeSec, upperBound)),
            confidence,
            reason: 'low-energy-rms'
        };
    }

    _measureRms(analysis, centerSec, windowSec) {
        const halfWindow = windowSec / 2;
        const startSample = Math.max(0, Math.floor((centerSec - halfWindow) * analysis.sampleRate));
        const endSample = Math.min(
            analysis.channels[0].length,
            Math.ceil((centerSec + halfWindow) * analysis.sampleRate)
        );
        const stride = Math.max(1, Math.floor(analysis.sampleRate / 2000));

        let sumSquares = 0;
        let sampleCount = 0;

        for (let sample = startSample; sample < endSample; sample += stride) {
            for (const channelData of analysis.channels) {
                const value = channelData[sample] || 0;
                sumSquares += value * value;
                sampleCount++;
            }
        }

        return sampleCount > 0 ? Math.sqrt(sumSquares / sampleCount) : 0;
    }

    _buildChildren(boundaries, config) {
        const children = [];

        for (let index = 0; index < boundaries.length - 1; index++) {
            const start = boundaries[index];
            const end = boundaries[index + 1];
            const childIndex = index + 1;

            children.push({
                index: childIndex,
                startMs: Math.round(start.timeSec * 1000),
                endMs: Math.round(end.timeSec * 1000),
                confidence: end.confidence,
                cutReason: end.reason,
                source: 'smart-practice',
                targetSec: config.childTargetSec
            });
        }

        return children;
    }

    _buildParents(children, durationSec, config) {
        const parentCount = Math.min(
            children.length,
            this._calculateCount(durationSec, config.parentTargetSec)
        );
        const parents = [];
        let childOffset = 0;

        for (let parentIndex = 0; parentIndex < parentCount; parentIndex++) {
            const remainingChildren = children.length - childOffset;
            const remainingParents = parentCount - parentIndex;
            const groupSize = Math.ceil(remainingChildren / remainingParents);
            const group = children.slice(childOffset, childOffset + groupSize);
            const id = String(parentIndex + 1);

            parents.push({
                id,
                name: `Practice ${id}`,
                startMs: group[0].startMs,
                endMs: group[group.length - 1].endMs,
                source: 'smart-practice',
                cutReason: 'grouped-practice-segments',
                confidence: this._averageConfidence(group)
            });

            group.forEach((child, groupIndex) => {
                child.id = `${id}-${groupIndex + 1}`;
                child.parentId = id;
                child.name = `Practice ${child.id}`;
                delete child.index;
                delete child.targetSec;
            });

            childOffset += groupSize;
        }

        return parents;
    }

    _averageConfidence(segments) {
        if (segments.length === 0) return 0;
        return segments.reduce((sum, segment) => sum + segment.confidence, 0) / segments.length;
    }

    _interleaveSegments(parents, children) {
        const result = [];

        parents.forEach(parent => {
            result.push(parent);
            children
                .filter(child => child.parentId === parent.id)
                .forEach(child => result.push(child));
        });

        return result;
    }
}
