export const DIALOGUE_CHARACTER_MS = 28;

export function normalizeDialogueSequence({ reaction, bridge }, defaultSpeaker) {
  return [reaction, bridge]
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .filter((entry) => entry != null)
    .map((entry) => (
      typeof entry === 'string'
        ? { speaker: defaultSpeaker, text: entry }
        : { ...entry }
    ));
}

// Driven by the scene update: no timers or callbacks survive a closed panel.
export function createDialoguePresentation(sequence, characterMs = DIALOGUE_CHARACTER_MS) {
  let index = 0;
  let elapsed = 0;
  let characters = Array.from(sequence[0]?.text ?? '');

  function isComplete() {
    return elapsed >= characters.length * characterMs;
  }

  function complete() {
    elapsed = characters.length * characterMs;
  }

  return {
    update(delta) {
      elapsed = Math.min(elapsed + Math.max(0, delta), characters.length * characterMs);
    },
    complete,
    isComplete,
    current() {
      return {
        entry: sequence[index],
        text: characters.slice(0, Math.floor(elapsed / characterMs)).join(''),
        complete: isComplete(),
      };
    },
    advance() {
      if (!isComplete()) {
        complete();
        return 'revealed';
      }
      if (index >= sequence.length - 1) return 'finished';
      index += 1;
      elapsed = 0;
      characters = Array.from(sequence[index].text);
      return 'next';
    },
  };
}
