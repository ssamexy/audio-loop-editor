import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

async function loadSegmentManager() {
    const source = await readFile(new URL('../src/services/segment-manager.js', import.meta.url), 'utf8');
    const context = { console };
    vm.createContext(context);
    vm.runInContext(`${source}\n;globalThis.SegmentManager = SegmentManager;`, context);
    return context.SegmentManager;
}

test('YouTube Looper import follows timeline containment hierarchy', async () => {
    const SegmentManager = await loadSegmentManager();
    const manager = new SegmentManager();
    const result = manager.importJSON({
        sourceId: 'youtube:test',
        loops: [
            { label: '1-1', startTime: 1, endTime: 5 },
            { label: 'New loop', startTime: 5, endTime: 9 },
            { label: '1-2', startTime: 5, endTime: 7 },
            { label: '1-3', startTime: 7, endTime: 9 },
            { label: '1', startTime: 0.5, endTime: 10 }
        ]
    });

    assert.equal(result.success, true);
    assert.deepEqual(
        Array.from(manager.getSegments(), segment => [segment.id, segment.parentId, segment.name]),
        [
            ['1', undefined, 'Segment 1'],
            ['1-1', '1', 'Segment 1-1'],
            ['1-2', '1', 'Segment New loop'],
            ['1-2-1', '1-2', 'Segment 1-2'],
            ['1-2-2', '1-2', 'Segment 1-3']
        ]
    );
});

test('editor JSON preserves parent_id across export and import', async () => {
    const SegmentManager = await loadSegmentManager();
    const manager = new SegmentManager();
    const imported = manager.importJSON({
        segments: [
            { id: '1', name: 'Parent', start_ms: 0, end_ms: 10000 },
            { id: '1-1', name: 'Child', start_ms: 1000, end_ms: 2000, parent_id: '1' }
        ]
    });

    assert.equal(imported.success, true);
    const exported = manager.exportJSON('sample.mp3');
    assert.equal(exported.segments[1].parent_id, '1');

    const roundTripManager = new SegmentManager();
    assert.equal(roundTripManager.importJSON(exported).success, true);
    assert.deepEqual(
        Array.from(roundTripManager.getSegments(), segment => [segment.id, segment.parentId]),
        [['1', undefined], ['1-1', '1']]
    );
});

class FakeElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.children = [];
        this.listeners = new Map();
        this.className = '';
        this.classList = {
            add: (...names) => names.forEach(name => this.className = `${this.className} ${name}`.trim()),
            remove: (...names) => names.forEach(name => {
                this.className = this.className.split(/\s+/).filter(value => value && value !== name).join(' ');
            })
        };
        this.dataset = {};
        this.style = {};
        this.draggable = false;
    }

    appendChild(child) {
        this.children.push(child);
        return child;
    }

    addEventListener(type, listener) {
        this.listeners.set(type, listener);
    }

    setAttribute() {}

    pack() {}
}

test('segment reordering uses a dedicated drag handle', async () => {
    const source = await readFile(new URL('../src/services/ui-controller.js', import.meta.url), 'utf8');
    const elementsById = new Map();
    const context = {
        console,
        TimeUtils: {
            formatTime: milliseconds => `00:00.${String(milliseconds).padStart(3, '0')}`
        },
        document: {
            createElement: tagName => new FakeElement(tagName),
            getElementById: id => elementsById.get(id) || null,
            querySelectorAll: () => []
        }
    };
    vm.createContext(context);
    vm.runInContext(`${source}\n;globalThis.UIController = UIController;`, context);

    const manager = {
        getSegments: () => [{ id: '1', name: 'A', startMs: 0, endMs: 1000 }],
        updateSegment() {}
    };
    const controller = new context.UIController(manager, {});
    const row = controller.createSegmentRow(manager.getSegments()[0], 0);
    const idContainer = row.children[0];
    const dragHandle = idContainer.children.find(child => child.className.includes('segment-drag-handle'));
    const idInput = idContainer.children.find(child => child.className.includes('segment-id-input'));

    assert.ok(dragHandle, 'a dedicated drag handle should be rendered');
    assert.equal(dragHandle.draggable, true);
    assert.equal(idContainer.draggable, false);
    assert.equal(idInput.listeners.has('dragstart'), false);
    assert.equal(dragHandle.listeners.has('dragstart'), true);
});
