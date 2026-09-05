import { COUNCIL_CONFIG } from '../councilAdvice.js';

export const SOFI_CONVERSATION = {
  rounds: [
    {
      line: 'Che, ¿vos sos amigo de los chicos de allá?',
      answers: [
        {
          text: 'Sí, lamentablemente.',
          reaction: 'JAJA. Bueno, por lo menos sos sincero.',
          effects: { attraction: 4, trust: 5, intensity: 0 },
        },
        {
          text: 'Sí, aunque algunos tendrían que estar presos.',
          reaction: '¿Tan mal están? Ahora quiero saber.',
          effects: { attraction: 6, trust: 4, intensity: 1 },
        },
        {
          text: 'Sí. Soy Tambu.',
          reaction: 'Ah, ¿vos sos Tambu?',
          effects: { attraction: 1, trust: 6, intensity: 0 },
        },
        {
          text: 'Más o menos, vine por la comida.',
          reaction: 'Banco venir por prioridades claras.',
          effects: { attraction: 3, trust: 3, intensity: 0 },
        },
      ],
    },
    {
      line: 'Sos bastante tranquilo para estar con ese grupo. ¿Siempre sos así?',
      answers: [
        {
          text: 'Hasta que agarro confianza.',
          reaction: 'Ah... entonces todavía estás en modo prueba.',
          effects: { attraction: 5, trust: 7, intensity: 1 },
        },
        {
          text: 'Con vos puedo hacer una excepción.',
          reaction: 'Mirá vos. No tardaste mucho.',
          effects: { attraction: 8, trust: 1, intensity: 6 },
        },
        {
          text: 'Sí, prefiero escuchar antes que hablar.',
          reaction: 'Eso es raro acá. Todos quieren hablar al mismo tiempo.',
          effects: { attraction: 0, trust: 9, intensity: 0 },
        },
        {
          text: 'Depende de quién tenga adelante.',
          reaction: '¿Y qué tenés adelante ahora?',
          effects: { attraction: 6, trust: 3, intensity: 3 },
        },
      ],
    },
    {
      line: 'Bueno... ¿vas a seguir dando vueltas o me vas a decir por qué viniste?',
      answers: [
        {
          text: 'Quería hablar con vos. Me caíste bien.',
          reaction: 'Eso fue sorprendentemente normal.',
          effects: { attraction: 5, trust: 6, intensity: 4 },
        },
        {
          text: 'Quería pedirte el Instagram antes de que me arrepienta.',
          reaction: '¿Siempre necesitás tanta preparación para pedir un Instagram?',
          effects: { attraction: 8, trust: 2, intensity: 8 },
        },
        {
          text: 'Nada, charlar. Si pinta seguir hablando, seguimos.',
          reaction: 'Bueno. Sos tranquilo de verdad entonces.',
          effects: { attraction: 2, trust: 8, intensity: 1 },
        },
        {
          text: 'Porque sos la más linda de la fiesta y no me iba a ir sin intentar algo.',
          reaction: 'Ah... ok. Fuimos de cero a cien bastante rápido.',
          effects: { attraction: 7, trust: -2, intensity: 14 },
        },
      ],
    },
  ],
  council: COUNCIL_CONFIG,
  outcomeRules: {
    ordered: [
      { outcome: 'rejection', when: { intensity: { gte: 22 } } },
      {
        outcome: 'date',
        when: {
          attraction: { gte: 16 },
          trust: { gte: 13 },
          intensity: { gte: 4, lte: 16 },
        },
      },
      {
        outcome: 'friendzone',
        when: { trust: { gte: 18 }, attraction: { lt: 10 } },
      },
      {
        outcome: 'instagram',
        when: { attraction: { gte: 10 }, trust: { gte: 7 } },
      },
    ],
    fallback: 'rejection',
  },
  outcomes: {
    date: {
      id: 'date',
      icon: '❤️',
      label: 'CITA',
      lines: [
        'Sofi sonríe.',
        '"Bueno, Tambu. Otro día podemos seguir esta charla con menos gente alrededor."',
      ],
      reward: { points: 500, lives: 0 },
    },
    instagram: {
      id: 'instagram',
      icon: '📱',
      label: 'INSTAGRAM',
      lines: ['"Pasame tu Instagram. Después vemos."'],
      reward: { points: 250, lives: 0 },
    },
    friendzone: {
      id: 'friendzone',
      icon: '💀',
      label: 'FRIENDZONE',
      lines: ['"Sos re buena onda, Tambu. Me caíste muy bien."'],
      reward: { points: 75, lives: 0 },
    },
    rejection: {
      id: 'rejection',
      icon: '👋',
      label: 'RECHAZO',
      lines: ['"Jajá... bueno. Voy a buscar a una amiga."'],
      reward: { points: 0, lives: -1 },
    },
  },
};
