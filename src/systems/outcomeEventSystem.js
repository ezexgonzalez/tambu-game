export function createOutcomeEventSystem({ handlers = {} } = {}) {
  let activeEvent = null;
  let activeRequest = null;

  function start(request) {
    const handler = handlers[request?.type];
    if (activeEvent || typeof handler !== 'function') return false;

    const event = handler(request);
    if (!event?.update) return false;

    activeEvent = event;
    activeRequest = request;
    return true;
  }

  function update() {
    if (!activeEvent) return false;

    const event = activeEvent;
    if (event.update() === false && activeEvent === event) {
      event.destroy?.();
      activeEvent = null;
      activeRequest = null;
    }
    return true;
  }

  function stop() {
    activeEvent?.destroy?.();
    activeEvent = null;
    activeRequest = null;
  }

  return {
    start,
    update,
    stop,
    isActive: () => activeEvent !== null,
    getActiveType: () => activeRequest?.type ?? null,
  };
}
