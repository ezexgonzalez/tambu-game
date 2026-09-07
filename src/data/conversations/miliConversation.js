import { MILI_COUNCIL_CONFIG } from '../councilAdvice.js';

export const MILI_CONVERSATION = {
  initialBeat: 'beat-1',
  beats: [
    {
      id: 'beat-1',
      prompt: 'Che, agarrame esto un segundo que se me está cayendo todo.',
      nextBeat: 'beat-2',
      choices: [
        {
          id: 'drink-trust',
          text: '¿Siempre confiás bebidas a desconocidos?',
          intent: 'playful-curiosity',
          effects: { attraction: 5, trust: 4, intensity: 2 },
          emits: ['mili_enjoyed_playful_pushback', 'mili_trusted_drink_to_tambu'],
          reaction: [
            { speaker: 'Mili', text: 'No. Pero tenés cara de que lo vas a devolver.' },
            { speaker: 'Tambu', text: 'Excelente sistema de seguridad.' },
            { speaker: 'Mili', text: 'Hasta ahora funciona.' },
          ],
        },
        {
          id: 'help-friendly',
          text: 'Dale.',
          intent: 'friendly-help',
          effects: { attraction: 2, trust: 6, intensity: 0 },
          emits: ['mili_sees_tambu_as_friendly', 'tambu_played_safe', 'mili_called_tambu_educated'],
          reaction: [
            { speaker: 'Mili', text: 'Gracias.' },
            { text: 'Mili acomoda el otro vaso.' },
            { speaker: 'Mili', text: 'Mirá vos, educado encima.' },
            { speaker: 'Tambu', text: 'A veces me pasa.' },
            { speaker: 'Mili', text: 'Bueno, tampoco te agrandes.' },
          ],
        },
        {
          id: 'not-your-waiter',
          text: 'No soy tu mozo, mami.',
          intent: 'rude-joke',
          effects: { attraction: -2, trust: -3, intensity: 4 },
          emits: ['mili_disliked_rudeness', 'mili_called_tambu_tempered'],
          reaction: [
            { speaker: 'Mili', text: 'Uh, bueno. Era un vaso nomás.' },
            { text: 'Mili le saca el vaso.' },
            { speaker: 'Mili', text: 'Qué carácter.' },
          ],
        },
        {
          id: 'claim-drink',
          text: 'Listo. Ahora es mío.',
          intent: 'unfiltered-playful',
          effects: { attraction: 6, trust: 2, intensity: 5 },
          emits: ['mili_enjoyed_tambu_boldness', 'mili_enjoyed_playful_pushback', 'mili_laughed_at_drink_claim'],
          reaction: [
            { speaker: 'Mili', text: 'JAJA, devolvémelo.' },
            { speaker: 'Tambu', text: 'Ya generé apego.' },
            { speaker: 'Mili', text: 'Fueron cuatro segundos.' },
            { speaker: 'Tambu', text: 'Intensos.' },
          ],
        },
      ],
    },
    {
      id: 'beat-2',
      prompt: 'Esta fiesta está rara. No sé si está buenísima o si dentro de veinte minutos se cagan todos a piñas.',
      nextBeat: 'beat-3',
      choices: [
        {
          id: 'both-can-happen',
          text: 'Las dos cosas pueden pasar.',
          intent: 'friendly-humor',
          effects: { attraction: 2, trust: 5, intensity: 1 },
          emits: ['mili_sees_tambu_as_friendly', 'mili_shared_party_vibe', 'tambu_played_safe', 'mili_enjoyed_party_agreement'],
          reaction: [
            { speaker: 'Mili', text: 'Ese sería el mejor escenario.' },
            { speaker: 'Tambu', text: 'Fiesta completa.' },
            { speaker: 'Mili', text: 'Exactamente.' },
          ],
        },
        {
          id: 'thinking-of-leaving',
          text: 'La verdad estoy viendo cuándo me puedo ir.',
          intent: 'energy-killer',
          effects: { attraction: -4, trust: -2, intensity: 0 },
          emits: ['mili_energy_dropped', 'mili_declined_to_hold_tambu'],
          reaction: [
            { speaker: 'Mili', text: 'Ah.' },
            { text: 'Pausa.' },
            { speaker: 'Mili', text: 'Bueno... tampoco te voy a retener.' },
          ],
        },
        {
          id: 'pool-accident',
          text: 'Yo estoy apostando por alguien cayéndose a la pileta primero.',
          intent: 'shared-observation',
          effects: { attraction: 5, trust: 4, intensity: 2 },
          emits: ['mili_enjoyed_shared_humor', 'tambu_built_chemistry', 'mili_agreed_on_pool_accident'],
          reaction: [
            { speaker: 'Mili', text: '¿Quién?' },
            { speaker: 'Tambu', text: 'El de camisa blanca. Tiene energía de accidente.' },
            { speaker: 'Mili', text: 'JAJA, sí. Yo estaba pensando exactamente lo mismo.' },
          ],
        },
        {
          id: 'accelerate-chaos',
          text: 'Si querés puedo acelerar cualquiera de las dos.',
          intent: 'unfiltered-chaos',
          effects: { attraction: 6, trust: 2, intensity: 5 },
          emits: ['mili_enjoyed_tambu_boldness', 'tambu_showed_initiative', 'mili_played_along_with_chaos'],
          reaction: [
            { speaker: 'Mili', text: 'Ah bueno. ¿Vos sos parte del problema?' },
            { speaker: 'Tambu', text: 'Puedo colaborar.' },
            { speaker: 'Mili', text: 'Me sirve saberlo.' },
          ],
          variants: [
            {
              id: 'already-accelerated',
              when: { allChoices: ['beat-1:claim-drink'] },
              effects: { attraction: -2, trust: -1, intensity: 2 },
              emits: ['mili_warned_tambu_to_slow_down'],
              reaction: [
                { speaker: 'Mili', text: 'Pará, vos viniste acelerado de fábrica.' },
                { speaker: 'Tambu', text: 'Estoy entrando en calor.' },
                { speaker: 'Mili', text: 'Bajá medio cambio por lo menos.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'beat-3',
      prompt: 'Mirá esos dos. Están bailando horrible pero con una confianza espectacular.\n\nEso es mucho más importante que bailar bien.',
      nextBeat: 'beat-4',
      choices: [
        {
          id: 'never-dance',
          text: 'Yo no bailo ni en pedo.',
          intent: 'passive-incompatibility',
          effects: { attraction: -4, trust: 0, intensity: -1 },
          emits: ['mili_disliked_passivity', 'mili_called_dancing_boring'],
          reaction: [
            { speaker: 'Mili', text: '¿Nunca?' },
            { speaker: 'Tambu', text: 'No.' },
            { speaker: 'Mili', text: 'Uh... qué embole.' },
          ],
        },
        {
          id: 'prove-it',
          text: 'Bueno, demostralo.',
          intent: 'confident-challenge',
          effects: { attraction: 7, trust: 3, intensity: 4 },
          emits: [
            'mili_returned_challenge',
            'npc_returned_flirt',
            'tambu_showed_initiative',
            'tambu_showed_romantic_intent',
          ],
          reaction: [
            { speaker: 'Mili', text: '¿Qué cosa?' },
            { speaker: 'Tambu', text: 'Esa confianza espectacular.' },
            { speaker: 'Mili', text: 'Ah... ¿me estás desafiando?' },
            { speaker: 'Tambu', text: 'Puede ser.' },
            { speaker: 'Mili', text: 'Cuidado con lo que pedís.' },
          ],
        },
        {
          id: 'confident-embarrassment',
          text: 'Banco. Si vas a hacer papelones, hacelos convencido.',
          intent: 'friendly-agreement',
          effects: { attraction: 3, trust: 5, intensity: 1 },
          emits: ['mili_sees_tambu_as_friendly', 'mili_shared_party_vibe', 'tambu_played_safe', 'mili_framed_party_companions'],
          reaction: [
            { speaker: 'Mili', text: 'Exactamente.' },
            { speaker: 'Tambu', text: 'La dignidad vuelve mañana.' },
            { speaker: 'Mili', text: 'A veces.' },
          ],
        },
        {
          id: 'you-cant-dance',
          text: 'Eso decís porque vos tampoco sabés bailar.',
          intent: 'unfiltered-tease',
          effects: { attraction: 6, trust: 1, intensity: 6 },
          emits: [
            'mili_enjoyed_playful_pushback',
            'mili_returned_challenge',
            'npc_returned_flirt',
            'tambu_showed_romantic_intent',
            'mili_played_along_with_dance_tease',
          ],
          reaction: [
            { speaker: 'Mili', text: '¿Perdón?' },
            { speaker: 'Tambu', text: 'Lo dije clarísimo.' },
            { speaker: 'Mili', text: 'Mirá que después te hago comprobarlo.' },
            { speaker: 'Tambu', text: 'Me regalé solo.' },
          ],
          variants: [
            {
              id: 'too-much-teasing-intensity',
              when: { stats: { intensity: { gte: 12 } } },
              effects: { attraction: -6, trust: -3, intensity: 2 },
              emits: ['mili_disliked_overplay', 'mili_warned_tambu_to_slow_down'],
              reaction: [
                { speaker: 'Mili', text: 'Che, ¿vos solamente sabés bardear?' },
                { speaker: 'Tambu', text: 'Tengo otras funciones.' },
                { speaker: 'Mili', text: 'Todavía no aparecieron.' },
              ],
            },
            {
              id: 'too-much-teasing-warning',
              when: { allSignals: ['mili_warned_tambu_to_slow_down'] },
              effects: { attraction: -6, trust: -3, intensity: 2 },
              emits: ['mili_disliked_overplay', 'mili_warned_tambu_to_slow_down'],
              reaction: [
                { speaker: 'Mili', text: 'Che, ¿vos solamente sabés bardear?' },
                { speaker: 'Tambu', text: 'Tengo otras funciones.' },
                { speaker: 'Mili', text: 'Todavía no aparecieron.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'beat-4',
      prompt: 'Igual para ser un tipo al que le encajé un vaso porque sí, resultaste bastante entretenido.',
      choices: [
        {
          id: 'not-bad-either',
          text: 'Vos tampoco estuviste tan mal.',
          intent: 'relaxed-flirt',
          effects: { attraction: 6, trust: 4, intensity: 3 },
          emits: ['mili_received_relaxed_flirt', 'tambu_showed_romantic_intent', 'tambu_was_clear'],
          reaction: [
            { speaker: 'Mili', text: 'Uh, gracias por tanto.' },
            { speaker: 'Tambu', text: 'No quería emocionarte.' },
            { speaker: 'Mili', text: 'Menos mal.' },
          ],
        },
        {
          id: 'happens-with-women',
          text: 'Sí, me pasa bastante con las minas.',
          intent: 'ego-flex',
          effects: { attraction: -5, trust: -4, intensity: 4 },
          emits: ['mili_disliked_ego'],
          reaction: [
            { speaker: 'Mili', text: 'Ah...' },
            { speaker: 'Mili', text: 'Qué suerte que tenés entonces.' },
            { speaker: 'Tambu', text: 'No lo dije así.' },
            { speaker: 'Mili', text: 'Lo dijiste bastante así.' },
          ],
        },
        {
          id: 'earn-your-name',
          text: 'Entonces me gané saber tu nombre por lo menos.',
          intent: 'friendly-connection',
          effects: { attraction: 2, trust: 7, intensity: 1 },
          emits: ['mili_exchanged_names', 'mili_sees_tambu_as_friendly', 'tambu_played_safe'],
          reaction: [
            { speaker: 'Mili', text: 'Mili.' },
            { speaker: 'Tambu', text: 'Tambu.' },
            { speaker: 'Mili', text: '¿Tambu?' },
            { speaker: 'Tambu', text: 'Sí.' },
            { speaker: 'Mili', text: 'Bueno... raro.' },
            { speaker: 'Tambu', text: 'Gracias.' },
          ],
        },
        {
          id: 'best-material',
          text: 'Y todavía no viste mi mejor material.',
          intent: 'unfiltered-confidence',
          effects: { attraction: 5, trust: 1, intensity: 7 },
          reaction: [
            { speaker: 'Mili', text: '¿Ah sí?' },
            { speaker: 'Tambu', text: 'Sí.' },
            { speaker: 'Mili', text: 'Bueno. No vendas humo ahora.' },
          ],
          variants: [
            {
              id: 'overplayed-intensity',
              when: { stats: { intensity: { gte: 14 } } },
              effects: { attraction: -8, trust: -4, intensity: 4 },
              emits: ['mili_rejected_overplay', 'tambu_overplayed'],
              reaction: [
                { speaker: 'Mili', text: 'Pará, campeón.' },
                { speaker: 'Tambu', text: '¿Qué?' },
                { speaker: 'Mili', text: 'Hace media hora que estás vendiendo humo.' },
              ],
            },
            {
              id: 'overplayed-warning',
              when: { allSignals: ['mili_warned_tambu_to_slow_down', 'mili_disliked_overplay'] },
              effects: { attraction: -8, trust: -4, intensity: 4 },
              emits: ['mili_rejected_overplay', 'tambu_overplayed'],
              reaction: [
                { speaker: 'Mili', text: 'Pará, campeón.' },
                { speaker: 'Tambu', text: '¿Qué?' },
                { speaker: 'Mili', text: 'Hace media hora que estás vendiendo humo.' },
              ],
            },
            {
              id: 'chemistry',
              when: {
                stats: { attraction: { gte: 14 }, trust: { gte: 8 }, intensity: { lte: 13 } },
                anySignals: [
                  'mili_returned_challenge',
                  'mili_enjoyed_playful_pushback',
                  'tambu_built_chemistry',
                ],
              },
              effects: { attraction: 3, trust: 2, intensity: -1 },
              emits: [
                'mili_played_along_with_best_material',
                'npc_returned_flirt',
                'tambu_showed_romantic_intent',
              ],
              reaction: [
                { speaker: 'Mili', text: '¿Ah sí?' },
                { speaker: 'Tambu', text: 'Sí.' },
                { speaker: 'Mili', text: 'Bueno... mostrámelo entonces.' },
              ],
            },
            {
              id: 'friendship',
              when: { anySituations: ['friendzone_risk', 'comfortable_but_low_romantic_intent'] },
              effects: { attraction: -3, trust: 0, intensity: -2 },
              emits: ['mili_saw_tambu_as_friend'],
              reaction: [
                { speaker: 'Mili', text: 'Jajaja, sos un boludo.' },
                { speaker: 'Tambu', text: 'Eso no responde la pregunta.' },
                { speaker: 'Mili', text: 'Porque no había pregunta.' },
              ],
            },
          ],
        },
      ],
    },
  ],
  council: MILI_COUNCIL_CONFIG,
  outcomeRules: {
    ordered: [
      { outcome: 'rejection', when: { allSignals: ['mili_rejected_overplay'] } },
      { outcome: 'rejection', when: { stats: { intensity: { gte: 22 } } } },
      { outcome: 'rejection', when: { allSignals: ['mili_disliked_ego', 'mili_disliked_rudeness'] } },
      { outcome: 'rejection', when: { allSignals: ['mili_disliked_ego', 'mili_energy_dropped'] } },
      { outcome: 'rejection', when: { allSignals: ['mili_disliked_ego', 'mili_disliked_passivity'] } },
      {
        outcome: 'bathroom',
        when: {
          anySignals: [
            'mili_returned_challenge',
            'mili_enjoyed_playful_pushback',
            'tambu_built_chemistry',
            'mili_played_along_with_best_material',
          ],
          stats: { attraction: { gte: 18 }, trust: { gte: 8 }, intensity: { gte: 7, lte: 19 } },
        },
      },
      {
        outcome: 'friendzone',
        when: { stats: { trust: { gte: 15 }, attraction: { lt: 18 }, intensity: { lte: 10 } } },
      },
      {
        outcome: 'instagram',
        when: { stats: { attraction: { gte: 8 }, trust: { gte: 4 }, intensity: { lte: 20 } } },
      },
    ],
    fallback: 'rejection',
  },
  outcomes: {
    bathroom: {
      id: 'bathroom', icon: '🚻', label: 'BAÑO',
      lines: ['Mili y Tambu se alejaron juntos de la fiesta.'],
      closingSequence: [
        { speaker: 'Mili', text: 'Che.' },
        { speaker: 'Tambu', text: '¿Qué?' },
        { speaker: 'Mili', text: '¿Ese baño tiene llave?' },
        { speaker: 'Tambu', text: 'Sí.' },
        { speaker: 'Mili', text: 'Bueno. Vení.' },
        { speaker: 'Tambu', text: '¿Así nomás?' },
        { speaker: 'Mili', text: 'No la compliques ahora.' },
      ],
      event: {
        type: 'bathroom',
        resultLabel: 'BAÑO CONSEGUIDO',
        resultText: 'Mili y Tambu entraron juntos al baño.',
      },
      reward: { points: 500, lives: 0 },
    },
    instagram: {
      id: 'instagram', icon: '📱', label: 'INSTAGRAM',
      lines: ['"Pasame tu Instagram."'], reward: { points: 250, lives: 0 },
    },
    friendzone: {
      id: 'friendzone', icon: '💀', label: 'FRIENDZONE',
      lines: ['"Sos copado, Tambu. Vení, vamos con los demás."'], reward: { points: 75, lives: 0 },
    },
    rejection: {
      id: 'rejection', icon: '👋', label: 'RECHAZO',
      lines: ['"Bueno... voy a buscar a mis amigas."'], reward: { points: 0, lives: -1 },
    },
  },
};
