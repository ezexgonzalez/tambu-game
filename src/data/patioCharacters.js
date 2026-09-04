export const patioWomen = [
  {
    id: 'sofi',
    name: 'Sofi',
    x: 400,
    y: 690,
    palette: 7,
    intro: 'Che, ¿vos sos amigo de los chicos de allá?',
    answers: [
      'Sí, lamentablemente.',
      'Sí, aunque algunos tendrían que estar presos.',
      'Sí. Soy Tambu.',
      'Más o menos, vine por la comida.',
    ],
    reactions: [
      'JAJA. Bueno, por lo menos sos sincero.',
      '¿Tan mal están? Ahora quiero saber.',
      'Ah, ¿vos sos Tambu?',
      'Banco venir por prioridades claras.',
    ],
  },
  {
    id: 'mili',
    name: 'Mili',
    x: 920,
    y: 350,
    palette: 8,
    intro: '¿Vos sos el que llegó recién? Tenés cara de estar pensando demasiado.',
    answers: [
      'Puede ser.',
      'Estoy viendo si esta fiesta zafa.',
      '¿Y vos siempre arrancás interrogando?',
      'No pienso tanto como parece.',
    ],
    reactions: [
      'Mmm. Respuesta sospechosa.',
      '¿Y? ¿Zafa o todavía no?',
      'Sí. ¿Te molesta?',
      'Eso lo vamos a comprobar.',
    ],
  },
  {
    id: 'cami',
    name: 'Cami',
    x: 1235,
    y: 635,
    palette: 9,
    intro: '¿Necesitás algo o estabas dando vueltas nomás?',
    answers: [
      'Estoy explorando.',
      'Buscaba una conversación decente.',
      'Me descubriste.',
      'Todavía no decidí.',
    ],
    reactions: [
      '¿Explorando? Qué misterioso.',
      'Qué presión. Espero estar a la altura.',
      'Por lo menos lo admitís.',
      'Bueno, avisame cuando decidas.',
    ],
  },
];

export const patioFriends = [
  { name: 'Eze', x: 1215, y: 470, palette: 1 },
  { name: 'Pitity', x: 1270, y: 500, palette: 2 },
  { name: 'Uriel', x: 320, y: 355, palette: 3 },
  { name: 'Santy', x: 380, y: 390, palette: 4 },
  { name: 'Thiago', x: 420, y: 800, palette: 5 },
  { name: 'Tobi', x: 470, y: 835, palette: 6 },
];

export const fillerGroups = [
  // Zona DJ / baile, siempre a la izquierda de la piscina.
  [170, 400, 10, 'dance'], [215, 420, 11, 'dance'], [260, 405, 12, 'dance'],
  [390, 470, 13, 'dance'], [430, 455, 14, 'dance'], [465, 485, 15, 'dance'],

  // Deck / parte alta del patio.
  [545, 300, 16, 'chat'], [590, 305, 17, 'chat'], [650, 320, 18, 'drink'],
  [700, 325, 19, 'chat'], [745, 315, 20, 'chat'], [825, 300, 21, 'phone'],
  [870, 360, 42, 'drink'], [915, 365, 43, 'chat'], [1010, 370, 44, 'chat'],
  [1060, 365, 47, 'drink'],

  // Barra y sector derecho superior.
  [1165, 390, 22, 'drink'], [1215, 400, 23, 'drink'], [1375, 390, 24, 'chat'],
  [1425, 410, 25, 'chat'], [1510, 430, 26, 'drink'],

  // Lateral izquierdo de la piscina.
  [450, 560, 45, 'phone'], [430, 610, 46, 'drink'], [470, 670, 48, 'chat'],

  // Lateral derecho de la piscina.
  [1190, 560, 40, 'chat'], [1235, 585, 41, 'chat'], [1290, 650, 49, 'drink'],
  [1340, 675, 50, 'chat'],

  // Debajo de la piscina: zona social amplia y segura.
  [540, 800, 27, 'sit'], [590, 820, 28, 'chat'], [640, 810, 29, 'chat'],
  [900, 820, 30, 'kiss'], [930, 820, 31, 'kiss'], [1040, 800, 32, 'drink'],

  // Sector inferior derecho sin invadir el acceso.
  [1280, 790, 33, 'chat'], [1330, 815, 34, 'chat'], [1380, 760, 35, 'phone'],
  [1590, 700, 36, 'dance'], [1620, 745, 37, 'dance'],
];
