import workingLayout from './layouts/dj-direction-working-layout-v1.json' with { type: 'json' };
import { getDjPerimeterAlignment } from './djPerimeterAlignment.js';
import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';
import { djAssetLibrary, filterDjAssetLibrary, DJ_CATALOG_FAMILIES } from './djEnvironmentCatalog.js';
import { createDjEnvironmentComposition } from './djEnvironmentPreview.js';
import { createDjLayoutEditorState, DJ_LAYOUT_GROUPS, djPlacementBounds, pickDjLayoutObject } from './djLayoutEditorState.js';
import { drawDjLayoutGuides, getDjLayoutWarnings } from './djLayoutEditorGuides.js';
import { createDjThumbnail } from './djLayoutThumbnails.js';
import { createDjEditorPanel } from './djLayoutEditorPanel.js';

const DIRECTIONS = new Map([
  ['ArrowLeft', [-1, 0]], ['ArrowUp', [0, -1]], ['ArrowRight', [1, 0]], ['ArrowDown', [0, 1]],
]);
const FILE_NAME = 'tambu-dj-layout-v2.json';
const GUIDE_DEPTH = 7000;
const BY_PIECE = 'object';
const GROUP_OPTIONS = Object.entries(DJ_LAYOUT_GROUPS);

export function createDjLayoutEditor(scene, { checkpoint = workingLayout } = {}) {
  const state = createDjLayoutEditorState(checkpoint);
  const renderer = createDjEnvironmentComposition(scene);
  const canvas = scene.sys.game.canvas;
  const doc = canvas.ownerDocument, win = doc.defaultView;
  const previousTabIndex = canvas.getAttribute('tabindex');
  canvas.tabIndex = 0;
  const camera = scene.cameras.main;
  // Native 1× camera; pan to inspect the full height of the DJ area.
  camera.setScroll(0, camera.clampY(145));

  const panel = createDjEditorPanel(doc, canvas.parentElement);
  const get = (name) => panel.querySelector(`[data-${name}]`);
  const mode = get('mode'), target = get('target'), position = get('position');
  const visibility = get('visibility'), status = get('status'), file = get('file');
  const guides = get('guides'), pieceSearch = get('piece-search'), membership = get('membership');
  const assetSearch = get('asset-search'), family = get('family'), addGroup = get('add-group');
  const components = get('components'), results = get('results');
  const instances = get('instances'), instanceResults = get('instance-results'), inspector = get('inspector');
  const library = djAssetLibrary();
  const libraryBySource = new Map(library.map((entry) => [entry.source, entry]));
  const guideInk = scene.add.graphics().setDepth(GUIDE_DEPTH);
  const selectionInk = scene.add.graphics().setDepth(GUIDE_DEPTH + 1);
  drawDjLayoutGuides(guideInk);
  guideInk.setVisible(false);

  const removals = [], downloads = new Map();
  const focusCanvas = () => canvas.focus({ preventScroll: true });
  let placements, drag = null, spaceDown = false, destroyed = false, pendingImport = 0, armed = null;
  let lastChoices = '', lastCards = '', lastInspector = '', lastRenderedPlacements, showLibrary;

  function on(target, name, handler) {
    target.addEventListener(name, handler);
    removals.push(() => target.removeEventListener(name, handler));
  }

  function options(select, choices) {
    select.replaceChildren(...choices.map(([id, label]) => {
      const option = doc.createElement('option');
      option.value = id;
      option.textContent = label;
      return option;
    }));
  }

  function tabs(libraryOpen) {
    if (libraryOpen !== showLibrary) panel.scrollTop = 0;
    showLibrary = libraryOpen;
    get('edit').hidden = showLibrary;
    get('library').hidden = !showLibrary;
    get('edit-tab').setAttribute('aria-pressed', String(!showLibrary));
    get('library-tab').setAttribute('aria-pressed', String(showLibrary));
    renderInspector();
  }

  function renderInspector() {
    const instance = state.getSelectedInstance();
    const choice = showLibrary ? libraryBySource.get(armed) : instance;
    const source = choice?.source;
    const name = choice && (libraryBySource.get(source)?.label
      ?? assets[placements.find((item) => item.id === instance.id).assetId].label);
    const caption = choice && (showLibrary ? name : `${name} · ${instance.id}`);
    const signature = JSON.stringify([source, caption]);
    inspector.hidden = !choice;
    if (signature !== lastInspector) {
      lastInspector = signature;
      if (!choice) inspector.replaceChildren();
      else {
        const label = doc.createElement('small');
        label.textContent = caption;
        inspector.replaceChildren(createDjThumbnail(doc, { source }, 116), label);
      }
    }
  }

  function renderLibrary() {
    const entries = filterDjAssetLibrary(library, family.value, assetSearch.value, components.checked);
    const scrollTop = results.scrollTop;
    results.replaceChildren(...entries.map((entry) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.setAttribute('data-source', entry.source);
      button.setAttribute('aria-pressed', String(entry.source === armed));
      button.disabled = !entry.placeable;
      button.title = `${entry.label} · ${entry.id}${entry.placeable ? '' : ' · necesita soporte'}`;
      const label = doc.createElement('span');
      label.textContent = entry.label;
      const id = doc.createElement('span');
      id.textContent = entry.recipe ? 'Conjunto' : entry.placeable ? 'Pieza' : 'Componente';
      button.append(createDjThumbnail(doc, entry), label, id);
      return button;
    }));
    if (!entries.length) results.textContent = 'Sin resultados.';
    results.scrollTop = scrollTop;
    renderInspector();
  }

  function syncSelectionList(selection) {
    if (selection) mode.value = selection.type;
    const byPiece = mode.value === BY_PIECE;
    pieceSearch.hidden = !byPiece;
    const query = pieceSearch.value.trim().toLowerCase();
    const cards = byPiece ? state.getEditableObjects()
      .map((item) => ({ ...item, label: libraryBySource.get(item.source)?.label ?? assets[item.assetId].label ?? item.assetId }))
      .filter(({ id, label, group }) => id === selection?.id
        || `${label} ${id} ${DJ_LAYOUT_GROUPS[group]}`.toLowerCase().includes(query)) : [];
    const choices = byPiece ? cards.map(({ id, label }) => [id, `${label} · ${id}`]) : GROUP_OPTIONS;
    instances.hidden = !byPiece;
    if (byPiece && instances.open) {
      const signature = JSON.stringify([cards, selection?.id]);
      if (signature !== lastCards) {
        lastCards = signature;
        const scrollTop = instanceResults.scrollTop;
        instanceResults.replaceChildren(...cards.map(({ id, source, label, group }) => {
          const button = doc.createElement('button');
          button.type = 'button';
          button.setAttribute('data-instance', id);
          button.setAttribute('aria-pressed', String(id === selection?.id));
          const title = doc.createElement('span');
          title.textContent = label;
          const detail = doc.createElement('small');
          detail.textContent = `${id} · ${DJ_LAYOUT_GROUPS[group]}`;
          button.append(createDjThumbnail(doc, { source }, 64), title, detail);
          return button;
        }));
        if (!cards.length) instanceResults.textContent = 'Sin piezas que coincidan.';
        instanceResults.scrollTop = scrollTop;
      }
    }
    const signature = JSON.stringify(choices);
    if (signature !== lastChoices) {
      options(target, [['', '—'], ...choices]);
      lastChoices = signature;
    }
    target.value = selection?.id ?? '';
  }

  function render() {
    placements = state.getPlacements();
    if (placements !== lastRenderedPlacements) {
      renderer.sync(placements);
      lastRenderedPlacements = placements;
    }
    const selection = state.getSelection();
    const instance = state.getSelectedInstance();
    syncSelectionList(selection);
    renderInspector();
    visibility.disabled = !selection;
    visibility.textContent = state.isSelectionVisible() ? 'Ocultar' : 'Mostrar';
    get('undo').disabled = !state.canUndo();
    get('redo').disabled = !state.canRedo();
    const offset = instance?.depthOffset ?? 0;
    for (const action of ['duplicate', 'delete', 'forward', 'backward']) get(action).disabled = !instance;
    get('auto').disabled = !offset;
    get('membership-row').hidden = !instance;
    if (instance) membership.value = instance.group;
    selectionInk.clear();
    const selected = placements.filter(state.isSelected);
    if (selected.length) {
      const bounds = selected.map((item) => djPlacementBounds(item));
      const left = Math.min(...bounds.map((r) => r.x)), top = Math.min(...bounds.map((r) => r.y));
      const right = Math.max(...bounds.map((r) => r.x + r.width)), bottom = Math.max(...bounds.map((r) => r.y + r.height));
      selectionInk.lineStyle(1, 0xffdd87, 0.95).strokeRect(left, top, right - left, bottom - top);
      position.textContent = `Mundo: ${instance?.x ?? left}, ${instance?.y ?? top}${instance ? ` · ${instance.id}` : ''}`;
    } else {
      position.textContent = selection ? 'Grupo vacío' : 'Sin selección';
    }
    const root = instance && selected.find(({ id }) => id === instance.id);
    get('perimeter-align').hidden = !root || !assets[root.assetId].perimeter?.lowerEdge;
    get('depth').textContent = root
      ? `Profundidad: ${offset ? `${offset > 0 ? '+' : ''}${root.depthRule === 'ground' ? offset / 100 : offset}` : 'automática'} · ${root.depth.toFixed(2)}`
      : 'Profundidad: elegí una pieza';
    const warnings = guides.checked || placements.some((item) => item.depthOffset)
      ? getDjLayoutWarnings(placements) : [];
    get('warnings').textContent = guides.checked
      ? warnings.join(' · ') || 'Sin solapes detectados por las guías.'
      : warnings.filter((warning) => warning.startsWith('Profundidad manual')).join(' · ');
  }

  function finishDrag() {
    drag = null;
    state.endMove();
  }

  function stopPlacing() {
    if (armed) {
      armed = null;
      renderLibrary();
      status.textContent = '';
    }
  }

  function pointerDown(pointer) {
    const targetNode = pointer.event?.target;
    if (pointer.button !== 0 || drag || (targetNode?.nodeType && panel.contains(targetNode))) return;
    focusCanvas();
    if (spaceDown) {
      drag = { id: pointer.id, pan: true, x: pointer.x, y: pointer.y,
        scrollX: camera.scrollX, scrollY: camera.scrollY };
      return;
    }
    const point = camera.getWorldPoint(pointer.x, pointer.y);
    if (armed) {
      const id = state.add(armed, addGroup.value, point.x, point.y);
      stopPlacing();
      if (id) {
        tabs(false);
        status.textContent = `Agregado: ${id}`;
      } else {
        status.textContent = 'No se pudo agregar la pieza (revisá el límite del layout).';
      }
      render();
      return;
    }
    const hit = pickDjLayoutObject(placements, point.x, point.y,
      (assetId, x, y) => scene.textures.getPixelAlpha(x, y, assets[assetId].key) > 0);
    const type = mode.value;
    const id = type === BY_PIECE ? hit?.id : hit?.group;
    if (state.select(type, id)) {
      if (showLibrary) tabs(false);
      state.beginMove();
      drag = { id: pointer.id, x: point.x, y: point.y, dx: 0, dy: 0 };
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
    const [dx, dy] = state.move(Math.round(point.x - drag.x) - drag.dx, Math.round(point.y - drag.y) - drag.dy);
    drag.dx += dx;
    drag.dy += dy;
    render();
  }

  function pointerUp(pointer) {
    if (drag?.id === pointer.id) {
      finishDrag();
      render();
    }
  }

  function command(action) {
    finishDrag();
    stopPlacing();
    action();
    render();
    focusCanvas();
  }

  for (const [event, handler] of [
    ['pointerdown', pointerDown], ['pointermove', pointerMove],
    ['pointerup', pointerUp], ['pointerupoutside', pointerUp],
  ]) {
    scene.input.on(event, handler);
    removals.push(() => scene.input.off(event, handler));
  }

  on(win, 'keydown', (event) => {
    const focused = doc.activeElement;
    if (panel.contains(focused) || focused?.isContentEditable
      || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(focused?.tagName)) return;
    if (event.key === 'Escape') {
      if (armed) stopPlacing();
      else command(() => state.select(null));
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      const key = event.key?.toLowerCase();
      if (key === 'z' || key === 'y') {
        event.preventDefault();
        command(key === 'y' || event.shiftKey ? state.redo : state.undo);
      }
      return;
    }
    if (event.code === 'Space') {
      event.preventDefault();
      spaceDown = true;
    }
    if (event.key === 'Delete' && state.getSelectedInstance()) {
      event.preventDefault();
      command(state.deleteSelection);
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
  on(win, 'blur', () => { finishDrag(); spaceDown = false; render(); });
  on(mode, 'change', () => command(() => state.select(null)));
  on(target, 'change', () => command(() => state.select(mode.value, target.value)));
  on(pieceSearch, 'input', render);
  on(instances, 'toggle', render);
  on(instanceResults, 'click', (event) => {
    const id = event.target.closest('button[data-instance]')?.getAttribute('data-instance');
    if (id) command(() => state.select(BY_PIECE, id));
  });
  on(membership, 'change', () => command(() => state.changeGroup(membership.value)));

  for (const [name, action] of [
    ['visibility', state.toggleVisibility], ['duplicate', () => {
      const id = state.duplicate();
      status.textContent = id ? `Duplicado: ${id}` : 'No se pudo duplicar (revisá el límite del layout).';
    }],
    ['delete', state.deleteSelection], ['forward', () => state.adjustDepth(1)],
    ['backward', () => state.adjustDepth(-1)], ['auto', () => state.adjustDepth(0)],
    ['undo', state.undo], ['redo', state.redo],
    ['perimeter-align', () => {
      const selected = state.getSelectedInstance();
      const root = state.getPlacements().find((part) => part.id === selected?.id);
      const delta = root && getDjPerimeterAlignment(root, state.getPlacements());
      if (delta) state.move(...delta);
    }],
  ]) on(get(name), 'click', () => command(action));

  on(get('collapse'), 'click', () => {
    const body = get('body'), control = get('collapse');
    body.hidden = !body.hidden;
    control.setAttribute('aria-expanded', String(!body.hidden));
    control.textContent = body.hidden ? 'Abrir' : 'Plegar';
    if (body.hidden) focusCanvas();
  });
  on(get('edit-tab'), 'click', () => { stopPlacing(); tabs(false); });
  on(get('library-tab'), 'click', () => {
    const selection = state.getSelection();
    if (selection?.type === 'group') addGroup.value = selection.id;
    tabs(true);
  });
  on(results, 'click', (event) => {
    const source = event.target.closest('button[data-source]')?.getAttribute('data-source');
    const entry = libraryBySource.get(source);
    if (!entry?.placeable) return;
    armed = source;
    status.textContent = `Clic en el patio para agregar: ${entry.label}. Esc cancela.`;
    renderLibrary();
    focusCanvas();
  });
  on(assetSearch, 'input', renderLibrary);
  on(family, 'change', renderLibrary);
  on(components, 'change', renderLibrary);

  on(get('reset'), 'click', () => command(() => {
    pendingImport++;
    state.reset();
    status.textContent = 'Composición guardada restaurada.';
  }));
  on(guides, 'change', () => {
    guideInk.setVisible(guides.checked);
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
      const data = JSON.parse(contents);
      state.importLayout(data);
      finishDrag();
      stopPlacing();
      render();
      status.textContent = data.version === 1 ? 'Layout V1 importado; ahora se exporta como V2.' : 'Layout V2 importado.';
    } catch {
      if (destroyed || request !== pendingImport) return;
      status.textContent = 'No se importó: elegí un JSON compatible con este layout DJ.';
    }
    focusCanvas();
  });

  options(family, [['', 'Todas las categorías'], ...[...new Set(library.map((entry) => entry.family))]
    .map((id) => [id, DJ_CATALOG_FAMILIES[id] ?? id])]);
  options(addGroup, GROUP_OPTIONS);
  options(membership, GROUP_OPTIONS);
  addGroup.value = 'upper-lounge';
  tabs(true);
  renderLibrary();
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
    renderer.destroy();
    panel.remove();
    if (guideInk.scene) guideInk.destroy();
    if (selectionInk.scene) selectionInk.destroy();
    if (previousTabIndex === null) canvas.removeAttribute('tabindex');
    else canvas.setAttribute('tabindex', previousTabIndex);
  }
  scene.events.once('shutdown', destroy);
  return { destroy };
}
