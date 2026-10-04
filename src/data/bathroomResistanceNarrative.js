// Approved copy: docs/BATHROOM_RESISTANCE_2_DIRECTION.md. No gameplay data here.
const reaction = (speaker, expression, text) => Object.freeze({ speaker, expression, text });
const knock = (text) => Object.freeze({ speaker: null, expression: null, text });

export function getBathroomResistanceNarrative({ attemptNumber = 1, previousResults = [] } = {}) {
  // Resolve once at event creation: subsequent settlement cannot change these branches.
  const previous = [...previousResults];
  let anticipation;
  let hits;
  let resolution;
  if (attemptNumber === 1) {
    anticipation = [knock('PUM PUM PUM'), reaction('pitity', 'talk', '¿TAMBU?')];
    hits = [
      knock('PUM'), reaction('pitity', 'talk', '¿ESTÁS AHÍ?'), knock('PUM PUM'),
      reaction('pitity', 'angry', 'ABRÍ, BOLUDO.'), knock('PUM PUM PUM'),
      reaction('pitity', 'shout', '¡DALE, TENGO QUE MEAR!'), knock('PUM PUM PUM'),
    ];
    resolution = {
      success: reaction('pitity', 'angry', 'BUENO. CAGATE.'),
      failure: reaction('pitity', 'shout', '¡TE DIJE QUE ABRAS!'),
    };
  } else if (attemptNumber === 2) {
    anticipation = [reaction('tobi', 'talk', 'NO ME JODAS...'), reaction('uriel', 'talk', '¿OTRA VEZ?')];
    hits = [
      reaction('tobi', 'angry', 'ABRÍ.'), reaction('uriel', 'talk', 'ESTÁ AHÍ ADENTRO, ¿NO?'),
      knock('PUM PUM'), reaction('tobi', 'shout', '¡TAMBU, ABRÍ!'),
      reaction('uriel', 'angry', previous[0] === 'secured'
        ? 'LA PRIMERA TE SALIÓ. ESTA NO.' : '¿NO APRENDISTE NADA?'),
      reaction('tobi', 'shout', '¡DALE, PELOTUDO!'), knock('PUM PUM PUM'),
    ];
    resolution = {
      success: reaction('tobi', 'angry', 'NO PUEDE SER.'),
      failure: reaction('uriel', 'talk', 'Y... ERA OBVIO.'),
    };
  } else if (attemptNumber === 3) {
    const secured = previous.filter((result) => result === 'secured').length;
    const memory = secured === 2
      ? reaction('eze', 'angry', 'DOS VECES TE SALIÓ. ESTA NO.')
      : secured === 1
        ? reaction('eze', 'talk', 'UNA TE SALIÓ. UNA TE LA CAGAMOS.')
        : reaction('eze', 'talk', 'TERCERA VEZ Y TODAVÍA INSISTÍS.');
    anticipation = [reaction('santy', 'talk', 'CHE...'), reaction('thiago', 'angry', 'NO. OTRA VEZ NO.')];
    hits = [
      reaction('santy', 'shout', '¡TAMBU!'), reaction('thiago', 'angry', 'ABRÍ LA PUERTA.'),
      memory, reaction('santy', 'shout', '¡ABRÍ, HIJO DE PUTA!'),
      reaction('thiago', 'shout', '¡TENGO QUE MEAR!'),
      reaction('eze', 'angry', 'YA ESTÁ. TIREN LA PUERTA.'), knock('PUM PUM PUM'),
    ];
    resolution = {
      success: reaction('eze', 'talk', 'NAH. DEJALO. YA ESTÁ.'),
      failure: reaction('santy', 'shout', '¡TE AGARRAMOS, GIL!'),
    };
  } else {
    throw new Error(`Unknown bathroom narrative attempt: ${attemptNumber}`);
  }
  return Object.freeze({
    attemptNumber,
    anticipation: Object.freeze(anticipation),
    hits: Object.freeze(hits),
    resolution: Object.freeze(resolution),
  });
}
