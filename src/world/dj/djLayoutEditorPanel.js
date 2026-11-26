export function createDjEditorPanel(doc, container) {
  const panel = doc.createElement('aside');
  panel.id = 'dj-layout-editor';
  panel.setAttribute('aria-label', 'Editor de composición DJ');
  panel.innerHTML = `
    <style>
      #dj-layout-editor {
        position: absolute; z-index: 3; top: 10px; right: 10px; width: min(312px, 35%);
        max-height: calc(100% - 20px); overflow: auto; padding: 9px;
        background: #10151f; color: #f4f4ef; border: 1px solid #46566b;
        font: 13px/1.35 system-ui, sans-serif; color-scheme: dark;
      }
      #dj-layout-editor [hidden] { display: none !important; }
      #dj-layout-editor button, #dj-layout-editor select, #dj-layout-editor input { font: inherit; }
      #dj-layout-editor button { cursor: pointer; }
      #dj-layout-editor button:disabled { cursor: default; }
      #dj-layout-editor header, #dj-layout-editor nav, #dj-layout-editor .dj-row {
        display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-bottom: 5px;
      }
      #dj-layout-editor header { justify-content: space-between; margin-bottom: 0; }
      #dj-layout-editor nav { margin-top: 6px; }
      #dj-layout-editor:has([data-body][hidden]) { width: auto; }
      #dj-layout-editor [data-library-tab] { font-weight: 700; padding: 5px 9px; background: #283a4a; color: white; }
      #dj-layout-editor nav [aria-pressed="true"] { border-color: #ffdd87; }
      #dj-layout-editor label { display: flex; align-items: center; gap: 6px; min-width: 0; }
      #dj-layout-editor select[data-target], #dj-layout-editor input[type="search"] { width: 100%; margin: 4px 0; }
      #dj-layout-editor output, #dj-layout-editor small { display: block; overflow-wrap: anywhere; }
      #dj-layout-editor small { color: #c5cfdc; }
      #dj-layout-editor footer { border-top: 1px solid #46566b; margin-top: 6px; padding-top: 5px; }
      #dj-layout-editor [data-results], #dj-layout-editor [data-instance-results] {
        display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px; max-height: min(285px, 42vh); overflow: auto; padding: 2px; margin-top: 4px;
      }
      #dj-layout-editor [data-instance-results] { max-height: 170px; }
      #dj-layout-editor :is([data-results], [data-instance-results]) button {
        display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; gap: 2px; min-width: 0; padding: 4px 2px;
        background: #192330; color: #f4f4ef; border: 1px solid #46566b;
        font-size: 11px; line-height: 1.15; overflow-wrap: anywhere;
      }
      #dj-layout-editor [data-results] button:disabled { opacity: 0.6; }
      #dj-layout-editor :is([data-results], [data-instance-results]) [aria-pressed="true"] { border-color: #ffdd87; color: #ffdd87; }
      #dj-layout-editor img { image-rendering: pixelated; }
      #dj-layout-editor .dj-preview-single { display: block; width: 100%; object-fit: contain; }
      #dj-layout-editor .dj-preview-stage { display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; width: 100%; }
      #dj-layout-editor button :is(.dj-preview-single, .dj-preview-stage) { align-self: center; justify-self: stretch; min-width: 0; }
      #dj-layout-editor .dj-preview-frame { position: relative; display: block; overflow: hidden; }
      #dj-layout-editor .dj-preview-frame img { position: absolute; display: block; max-width: none; }
      #dj-layout-editor [data-inspector] { border: 1px solid #46566b; padding: 4px; margin-bottom: 6px; text-align: center; }
      #dj-layout-editor summary { cursor: pointer; margin-bottom: 4px; }
    </style>
    <header><strong>Composición DJ</strong><button type="button" data-collapse aria-expanded="true">Plegar</button></header>
    <div data-body>
      <nav aria-label="Modos del editor">
        <button type="button" data-library-tab>Agregar objetos</button>
        <button type="button" data-edit-tab>Edición</button>
      </nav>
      <output data-status aria-live="polite"></output>
      <div data-inspector hidden></div>
      <section data-edit aria-label="Edición" hidden>
        <label>Seleccionar <select data-mode><option value="group">Grupo</option><option value="object">Pieza</option></select></label>
        <input type="search" placeholder="Buscar por ID o nombre" aria-label="Buscar piezas" data-piece-search hidden>
        <select data-target aria-label="Grupo o pieza"></select>
        <details data-instances hidden>
          <summary>Elegir pieza por imagen</summary><div data-instance-results></div>
        </details>
        <div class="dj-row">
          <button type="button" data-visibility>Ocultar</button><button type="button" data-duplicate>Duplicar</button>
          <button type="button" data-delete>Eliminar</button>
        </div>
        <label data-membership-row hidden>Grupo de la pieza <select data-membership></select></label>
        <small data-depth>Profundidad: automática</small>
        <div class="dj-row">
          <button type="button" data-forward>Adelante</button><button type="button" data-backward>Atrás</button>
          <button type="button" data-auto>Restablecer auto</button>
          <button type="button" data-perimeter-align hidden>Alinear borde inferior</button>
        </div>
      </section>
      <section data-library aria-label="Biblioteca">
        <input type="search" placeholder="Buscar por nombre o ID" aria-label="Buscar assets" data-asset-search>
        <div class="dj-row">
          <select data-family aria-label="Categoría"></select>
          <label><input type="checkbox" data-components> Ver componentes</label>
        </div>
        <label>Agregar al grupo <select data-add-group></select></label>
        <small>Elegí una tarjeta y después hacé clic en el patio.</small>
        <div data-results></div>
      </section>
      <small data-position>Sin selección</small>
      <footer>
        <div class="dj-row">
          <button type="button" data-undo>Deshacer</button><button type="button" data-redo>Rehacer</button>
          <button type="button" data-reset>Restaurar versión guardada</button>
        </div>
        <label><input type="checkbox" data-guides> Guías y avisos de solapes</label>
        <small data-warnings></small>
        <div class="dj-row"><button type="button" data-export>Exportar JSON</button><button type="button" data-import>Importar JSON</button></div>
        <input hidden type="file" accept=".json,application/json" data-file>
        <small>Arrastrar · Flechas: 1 px · Shift: 8 px · Esc: cancelar · Espacio + arrastre: cámara</small>
      </footer>
    </div>
  `;
  container.append(panel);
  return panel;
}
