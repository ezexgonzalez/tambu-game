export const patioWomen = [
  {
    id: 'sofi',
    name: 'Sofi',
    x: 420,
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
    x: 980,
    y: 360,
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
    x: 1285,
    y: 645,
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
  { name: 'Eze', x: 1135, y: 520, palette: 1 },
  { name: 'Pitity', x: 1195, y: 545, palette: 2 },
  { name: 'Uriel', x: 305, y: 360, palette: 3 },
  { name: 'Santy', x: 355, y: 395, palette: 4 },
  { name: 'Thiago', x: 235, y: 610, palette: 5 },
  { name: 'Tobi', x: 300, y: 640, palette: 6 },
];

export const fillerGroups = [
  // Cerca del DJ
  [170, 400, 10, 'dance'], [215, 420, 11, 'dance'], [260, 405, 12, 'dance'],
  [390, 470, 13, 'dance'], [435, 455, 14, 'dance'], [475, 480, 15, 'dance'],
  // Casa / deck
  [545, 240, 16, 'chat'], [590, 245, 17, 'chat'], [650, 300, 18, 'drink'],
  [700, 315, 19, 'chat'], [745, 310, 20, 'chat'], [825, 265, 21, 'phone'],
  // Barra
  [1170, 345, 22, 'drink'], [1225, 365, 23, 'drink'], [1375, 365, 24, 'chat'],
  [1420, 375, 25, 'chat'], [1490, 425, 26, 'drink'],
  // Piscina
  [520, 750, 27, 'sit'], [590, 770, 28, 'chat'], [640, 765, 29, 'chat'],
  [930, 760, 30, 'kiss'], [958, 760, 31, 'kiss'], [1030, 730, 32, 'drink'],
  // Sector derecho / entrada
  [1260, 790, 33, 'chat'], [1310, 800, 34, 'chat'], [1450, 720, 35, 'phone'],
  [1510, 650, 36, 'dance'], [1550, 675, 37, 'dance'],
  // Relleno general
  [750, 610, 38, 'dance'], [795, 625, 39, 'dance'], [1090, 650, 40, 'chat'],
  [1140, 675, 41, 'chat'], [1080, 280, 42, 'drink'], [875, 330, 43, 'chat'],
  [910, 315, 44, 'chat'], [420, 610, 45, 'phone'], [350, 760, 46, 'drink'],
];
