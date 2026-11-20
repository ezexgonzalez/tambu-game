import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';
import { createDjLayoutEditorState, DJ_LAYOUT_GROUPS, djPlacementBounds, pickDjLayoutObject } from './djLayoutEditorState.js';
import { drawDjLayoutGuides, getDjLayoutWarnings } from './djLayoutEditorGuides.js';

const DIRECTIONS = new Map([
  ['ArrowLeft', [-1, 0]], ['ArrowUp', [0, -1]], ['ArrowRight', [1, 0]], ['ArrowDown', [0, 1]],
]);
const FILE_NAME = 'tambu-dj-layout-v1.json';
const GUIDE_DEPTH = 7000;
const BY_PIECE = 'object';

function createPanel(doc, container) {
  const panel = doc.createElement('aside');
  panel.id = 'dj-layout-editor';
  panel.setAttribute('aria-label', 'Editor de composición DJ');
  panel.innerHTML = `
    <style>
      #dj-layout-editor {
        position: absolute; z-index: 3; top: 10px; right: 10px; width: min(315px, 44%);
        max-height: calc(100% - 20px); overflow: auto; padding: 12px; display: grid; gap: 7px;
        background: #10151fee; color: #f4f4ef; border: 1px solid #46566b;
        font: 13px/1.3 system-ui, sans-serif;
      }
      #dj-layout-editor select, #dj-layout-editor button { font: inherit; }
      #dj-layout-editor label { display: flex; align-items: center; gap: 6px; min-width: 0; }
      #dj-layout-editor select[data-target] { width: 100%; }
      #dj-layout-editor div { display: flex; flex-wrap: wrap; gap: 5px; }
      #dj-layout-editor output, #dj-layout-editor small { overflow-wrap: anywhere; }
    </style>
    <strong>Composición DJ</strong>
    <label>Seleccionar <select data-mode><option value="group">Grupo</option><option value="object">Pieza</option></select></label>
    <select data-target aria-label="Grupo o pieza"></select>
    <small data-position>Sin selección</small>
    <div><button type="button" data-visibility disabled>Ocultar</button><button type="button" data-reset>Reset</button></div>
    <label><input type="checkbox" data-guides> Guías y avisos de solapes</label>
    <div><button type="button" data-export>Exportar JSON</button><button type="button" data-import>Importar JSON</button></div>
    <input hidden type="file" accept=".json,application/json" data-file>
    <small>Clic y arrastre · Flechas: 1 px · Shift: 8 px · Esc: deseleccionar · Espacio + arrastre: cámara</small>
    <output aria-live="polite" data-status></output>
  `;
  container.append(panel);
  return panel;
}

export function createDjLayoutEditor(scene, images) {
  const state = createDjLayoutEditorState();
  const canvas = scene.sys.game.canvas;
  const doc = canvas.ownerDocument, win = doc.defaultView;
  const previousTabIndex = canvas.getAttribute('tabindex');
  canvas.tabIndex = 0;
  const camera = scene.cameras.main;
  // Native 1× camera; pan to inspect the full height of the DJ area.
  camera.setScroll(0, camera.clampY(145));

  const panel = createPanel(doc, canvas.parentElement);
  const get = (name) => panel.querySelector(`[data-${name}]`);
  const mode = get('mode'), target = get('target'), position = get('position');
  const visibility = get('visibility'), status = get('status'), file = get('file');
  const guides = get('guides');
  const guideInk = scene.add.graphics().setDepth(GUIDE_DEPTH);
  const selectionInk = scene.add.graphics().setDepth(GUIDE_DEPTH + 1);
  drawDjLayoutGuides(guideInk);
  guideInk.setVisible(false);

  const removals = [];
  const objectChoices = state.editableObjectIds.map((id) => [id, id]);
  let placements, drag = null, spaceDown = false, destroyed = false, pendingImport = 0;
  const downloads = new Map();
  const focusCanvas = () => canvas.focus({ preventScroll: true });

  function on(target, name, handler) {
    target.addEventListener(name, handler);
    removals.push(() => target.removeEventListener(name, handler));
  }

  function options() {
    const choices = mode.value === BY_PIECE ? objectChoices : Object.entries(DJ_LAYOUT_GROUPS);
    target.replaceChildren(...[['', '—'], ...choices].map(([id, label]) => {
      const option = doc.createElement('option');
      option.value = id;
      option.textContent = label;
      return option;
    }));
  }

  function render() {
    placements = state.getPlacements();
    for (const [index, item] of placements.entries()) {
      const { originPx: [ox, oy] } = assets[item.assetId];
      // Preserve initial draw order at exact depth ties, even after multiple edits.
      images[index].setPosition(item.x + ox * item.scale, item.y + oy * item.scale)
        .setDepth(item.depth + index * 0.000001).setVisible(item.visible);
    }
    const selection = state.getSelection();
    target.value = selection?.id ?? '';
    visibility.disabled = !selection;
    const offset = state.getSelectionOffset();
    visibility.textContent = offset.visible ? 'Ocultar' : 'Mostrar';
    selectionInk.clear();
    if (selection) {
      const selected = placements.filter(state.isSelected);
      const bounds = selected.map(djPlacementBounds);
      const left = Math.min(...bounds.map((r) => r.x)), top = Math.min(...bounds.map((r) => r.y));
      const right = Math.max(...bounds.map((r) => r.x + r.width)), bottom = Math.max(...bounds.map((r) => r.y + r.height));
      selectionInk.lineStyle(1, 0xffdd87, 0.95).strokeRect(left, top, right - left, bottom - top);
      const anchor = selection.type === BY_PIECE ? selected.find(({ id }) => id === selection.id) : { x: left, y: top };
      position.textContent = `Mundo: ${anchor.x}, ${anchor.y} · Δ ${offset.dx}, ${offset.dy}`;
    } else {
      position.textContent = 'Sin selección';
    }
    if (guides.checked) {
      const warnings = getDjLayoutWarnings(placements);
      status.textContent = warnings.length ? warnings.join(' · ') : 'Sin solapes detectados por las guías.';
    }
  }

  function pointerDown(pointer) {
    if (pointer.button !== 0 || drag) return;
    focusCanvas();
    if (spaceDown) {
      drag = { id: pointer.id, pan: true, x: pointer.x, y: pointer.y,
        scrollX: camera.scrollX, scrollY: camera.scrollY };
      return;
    }
    const point = camera.getWorldPoint(pointer.x, pointer.y);
    const hit = pickDjLayoutObject(placements, point.x, point.y,
      (assetId, x, y) => scene.textures.getPixelAlpha(x, y, assets[assetId].key) > 0);
    const type = mode.value;
    const id = type === BY_PIECE ? hit?.id : hit?.group;
    if (state.select(type, id)) {
      const { dx, dy } = state.getSelectionOffset();
      drag = { id: pointer.id, x: point.x, y: point.y, dx, dy };
    }
    render();
  }

  function pointerMove(pointer) {
    if (!drag || pointer.id !== drag.id) return;
    if (drag.pan) {
      camera.setScroll(camera.clampX(drag.scrollX - (pointer.x - drag.x)),
        camera.clampY(drag.scrollY - (pointer.y - drag.y)));
      return;
    }
    const point = camera.getWorldPoint(pointer.x, pointer.y);
    const { dx, dy } = state.getSelectionOffset();
    state.move(Math.round(point.x - drag.x) + drag.dx - dx, Math.round(point.y - drag.y) + drag.dy - dy);
    render();
  }

  function pointerUp(pointer) {
    if (drag?.id === pointer.id) drag = null;
  }

  for (const [event, handler] of [
    ['pointerdown', pointerDown], ['pointermove', pointerMove],
    ['pointerup', pointerUp], ['pointerupoutside', pointerUp],
  ]) {
    scene.input.on(event, handler);
    removals.push(() => scene.input.off(event, handler));
  }

  on(win, 'keydown', (event) => {
    if (event.key === 'Escape') {
      state.select(null);
      drag = null;
      render();
      return;
    }
    if (panel.contains(doc.activeElement)) return;
    if (event.code === 'Space') {
      event.preventDefault();
      spaceDown = true;
    }
    const direction = DIRECTIONS.get(event.key);
    if (direction && state.getSelection() && !drag) {
      event.preventDefault();
      const step = event.shiftKey ? 8 : 1;
      state.move(direction[0] * step, direction[1] * step);
      render();
    }
  });
  on(win, 'keyup', (event) => { if (event.code === 'Space') spaceDown = false; });
  on(win, 'blur', () => { drag = null; spaceDown = false; });
  on(mode, 'change', () => { drag = null; state.select(null); options(); render(); focusCanvas(); });
  on(target, 'change', () => { drag = null; state.select(mode.value, target.value); render(); focusCanvas(); });
  on(visibility, 'click', () => { state.toggleVisibility(); render(); focusCanvas(); });
  on(get('reset'), 'click', () => {
    pendingImport++;
    drag = null;
    state.reset();
    render();
    status.textContent = 'Layout base restaurado.';
    focusCanvas();
  });
  on(guides, 'change', () => {
    guideInk.setVisible(guides.checked);
    status.textContent = '';
    render();
    focusCanvas();
  });
  on(get('export'), 'click', () => {
    const url = win.URL.createObjectURL(new win.Blob([JSON.stringify(state.exportLayout(), null, 2) + '\n'],
      { type: 'application/json' }));
    const link = doc.createElement('a');
    link.href = url;
    link.download = FILE_NAME;
    panel.append(link);
    link.click();
    link.remove();
    // Let the browser start the download before releasing the object URL.
    downloads.set(url, win.setTimeout(() => {
      downloads.delete(url);
      win.URL.revokeObjectURL(url);
    }, 1000));
    status.textContent = `Exportado: ${FILE_NAME}`;
    focusCanvas();
  });
  on(get('import'), 'click', () => file.click());
  on(file, 'change', async () => {
    const selected = file.files[0];
    file.value = '';
    if (!selected) return;
    const request = ++pendingImport;
    try {
      if (selected.size > 1024 * 1024) throw new Error('Archivo demasiado grande.');
      const contents = await selected.text();
      if (destroyed || request !== pendingImport) return;
      state.importLayout(JSON.parse(contents));
      drag = null;
      render();
      status.textContent = 'Layout importado.';
    } catch {
      if (destroyed || request !== pendingImport) return;
      status.textContent = 'No se importó: elegí un JSON compatible con este layout DJ.';
    }
    focusCanvas();
  });

  options();
  render();

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    scene.events.off('shutdown', destroy);
    removals.forEach((remove) => remove());
    for (const [url, timer] of downloads) {
      win.clearTimeout(timer);
      win.URL.revokeObjectURL(url);
    }
    downloads.clear();
    panel.remove();
    if (guideInk.scene) guideInk.destroy();
    if (selectionInk.scene) selectionInk.destroy();
    if (previousTabIndex === null) canvas.removeAttribute('tabindex');
    else canvas.setAttribute('tabindex', previousTabIndex);
  }
  scene.events.once('shutdown', destroy);
  return { destroy };
}
