import { CAMI_COUNCIL_CONFIG } from '../councilAdvice.js';

export const CAMI_CONVERSATION = {
  initialBeat: 'beat-1',
  beats: [
    {
      id: 'beat-1',
      prompt: '¿Necesitás algo o estabas dando vueltas hasta que alguien te hable?',
      nextBeat: 'beat-2',
      choices: [
        {
          id: 'just-walking', text: 'Estaba dando una vuelta nomás.', intent: 'friendly-literal',
          effects: { attraction: 2, trust: 5, intensity: 0 },
          emits: ['cami_sees_tambu_as_friendly', 'tambu_played_safe', 'cami_found_tambu_literal'],
          reaction: [
            { speaker: 'Cami', text: 'Ah, explorador.' },
            { speaker: 'Tambu', text: 'Exactamente.' },
            { speaker: 'Cami', text: 'Qué emocionante.' },
          ],
        },
        {
          id: 'waited-for-you', text: 'Estaba esperando que me hablaras vos.', intent: 'playful-comeback',
          effects: { attraction: 6, trust: 4, intensity: 2 },
          emits: ['cami_enjoyed_comeback', 'cami_started_playful_dynamic', 'tambu_built_chemistry'],
          reaction: [
            { speaker: 'Cami', text: 'Ah, mirá qué cómodo.' },
            { speaker: 'Tambu', text: 'Funcionó.' },
            { speaker: 'Cami', text: 'De pedo.' },
          ],
        },
        {
          id: 'sorry', text: 'No, nada. Perdón.', intent: 'missed-irony',
          effects: { attraction: -3, trust: 1, intensity: -1 },
          emits: ['tambu_missed_irony', 'cami_had_to_explain_joke'],
          reaction: [
            { speaker: 'Cami', text: '¿Perdón de qué?' },
            { speaker: 'Tambu', text: 'Nada, pensé que te molestaba.' },
            { speaker: 'Cami', text: 'Tambu, te estaba jodiendo.' },
          ],
        },
        {
          id: 'security', text: 'Sí. Vine a supervisar que no hagas ninguna pelotudez.', intent: 'unfiltered-security-bit',
          effects: { attraction: 6, trust: 2, intensity: 5 },
          emits: ['cami_enjoyed_banter', 'cami_enjoyed_tambu_boldness', 'tambu_showed_initiative'],
          reaction: [
            { speaker: 'Cami', text: 'Ah bueno, llegó seguridad.' },
            { speaker: 'Tambu', text: 'Estoy de servicio.' },
            { speaker: 'Cami', text: 'Me quedo tranquilísima.' },
          ],
        },
      ],
    },
    {
      id: 'beat-2',
      prompt: 'Igual tenés cara de que practicás las respuestas antes de venir.',
      promptVariants: [
        { when: { allChoices: ['beat-1:just-walking'] }, prompt: 'Ah, explorador...\n\nIgual tenés cara de que practicás las respuestas antes de venir.' },
        { when: { allChoices: ['beat-1:waited-for-you'] }, prompt: 'Bueno, cómodo...\n\nIgual tenés cara de que practicás las respuestas antes de venir.' },
        { when: { allChoices: ['beat-1:sorry'] }, prompt: 'Igual te digo algo...\n\nTenés cara de que practicás las respuestas antes de venir.' },
        { when: { allChoices: ['beat-1:security'] }, prompt: 'Bueno, señor seguridad...\n\nIgual tenés cara de que practicás las respuestas antes de venir.' },
      ],
      nextBeat: 'beat-3',
      choices: [
        {
          id: 'spontaneous', text: 'No, para nada. Soy bastante espontáneo.', intent: 'missed-irony',
          effects: { attraction: -4, trust: 0, intensity: -1 },
          emits: ['tambu_missed_irony', 'cami_had_to_explain_joke', 'cami_found_tambu_literal'],
          reaction: [
            { speaker: 'Cami', text: 'Era un chiste.' },
            { speaker: 'Tambu', text: 'Ya sé.' },
            { speaker: 'Cami', text: 'Mmm... sí, se notó.' },
          ],
        },
        {
          id: 'maybe-a-little', text: 'Puede ser un poco.', intent: 'friendly-self-awareness',
          effects: { attraction: 2, trust: 4, intensity: 1 },
          emits: ['cami_sees_tambu_as_friendly', 'cami_enjoyed_light_banter', 'tambu_played_safe'],
          reaction: [
            { speaker: 'Cami', text: 'Lo sabía.' },
            { speaker: 'Tambu', text: 'No te emociones.' },
            { speaker: 'Cami', text: 'Ya estoy avisándole a todos.' },
          ],
        },
        {
          id: 'rehearsed-all-week', text: 'Sí. Esa respuesta la ensayé toda la semana.', intent: 'self-irony',
          effects: { attraction: 6, trust: 4, intensity: 2 },
          emits: ['cami_enjoyed_self_irony', 'cami_requested_more', 'cami_enjoyed_banter', 'tambu_built_chemistry'],
          reaction: [
            { speaker: 'Cami', text: 'Qué dedicación.' },
            { speaker: 'Tambu', text: 'Tengo otras tres por si esta fallaba.' },
            { speaker: 'Cami', text: 'Ahora quiero escuchar las peores.' },
          ],
        },
        {
          id: 'excel', text: 'Obvio. Tengo un Excel con respuestas para cada mina.', intent: 'unfiltered-absurdity',
          effects: { attraction: 7, trust: 2, intensity: 5 },
          emits: ['cami_enjoyed_absurdity', 'cami_enjoyed_banter', 'tambu_showed_initiative'],
          reaction: [
            { speaker: 'Cami', text: 'JAJAJA sos un pelotudo.' },
            { speaker: 'Tambu', text: 'Está ordenado por probabilidad de éxito.' },
            { speaker: 'Cami', text: 'Mostrámelo.' },
            { speaker: 'Tambu', text: 'Información confidencial.' },
          ],
          variants: [
            {
              id: 'already-playing-a-character', when: { allChoices: ['beat-1:security'] },
              effects: { attraction: -3, trust: -1, intensity: 2 },
              emits: ['cami_noticed_tambu_character', 'cami_warned_about_overplay'],
              reaction: [
                { speaker: 'Cami', text: 'JAJA, sí, ya entendí el personaje.' },
                { speaker: 'Tambu', text: '¿Qué personaje?' },
                { speaker: 'Cami', text: 'El tuyo.' },
                { speaker: 'Tambu', text: 'Estoy siendo yo.' },
                { speaker: 'Cami', text: 'Eso es peor.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'beat-3',
      prompt: 'Igual sos bastante más normal de lo que parecías de lejos.',
      promptVariants: [
        {
          when: { allChoices: ['beat-2:excel'], allSignals: ['cami_noticed_tambu_character'] },
          prompt: 'Igual... fuera del personaje, sos bastante más normal de lo que parecías de lejos.',
        },
        { when: { allChoices: ['beat-2:spontaneous'] }, prompt: 'Bueno... cuando no me explicás que sos espontáneo, sos bastante más normal de lo que parecías de lejos.' },
        { when: { allChoices: ['beat-2:maybe-a-little'] }, prompt: 'Igual, fuera de joda, sos bastante más normal de lo que parecías de lejos.' },
        { when: { allChoices: ['beat-2:rehearsed-all-week'] }, prompt: 'Igual, para alguien que ensaya respuestas toda la semana, sos bastante más normal de lo que parecías de lejos.' },
        { when: { allChoices: ['beat-2:excel'] }, prompt: 'Igual, señor Excel, sos bastante más normal de lo que parecías de lejos.' },
      ],
      nextBeat: 'beat-4',
      choices: [
        {
          id: 'disappointed-for-good', text: 'Gracias. Vos también decepcionaste para bien.', intent: 'playful-comeback',
          effects: { attraction: 7, trust: 3, intensity: 3 },
          emits: ['cami_enjoyed_comeback', 'cami_returned_banter', 'cami_enjoyed_banter', 'tambu_built_chemistry'],
          reaction: [
            { speaker: 'Cami', text: '¿Decepcioné para bien?' },
            { speaker: 'Tambu', text: 'Sí.' },
            { speaker: 'Cami', text: 'Qué hijo de puta.' },
            { text: 'Cami se ríe.' },
          ],
        },
        {
          id: 'thanks-i-guess', text: 'Gracias, supongo.', intent: 'friendly-acceptance',
          effects: { attraction: 2, trust: 5, intensity: 0 },
          emits: ['cami_sees_tambu_as_friendly', 'cami_comfortable_with_tambu', 'tambu_played_safe'],
          reaction: [
            { speaker: 'Cami', text: 'Era un cumplido.' },
            { speaker: 'Tambu', text: 'Uno bastante particular.' },
            { speaker: 'Cami', text: 'Aceptalo y listo.' },
          ],
        },
        {
          id: 'what-did-i-look-like', text: '¿Qué parecía de lejos?', intent: 'missed-irony',
          effects: { attraction: -4, trust: -1, intensity: 0 },
          emits: ['tambu_missed_irony', 'cami_had_to_explain_joke', 'cami_disliked_overanalysis'],
          reaction: [
            { speaker: 'Cami', text: 'Ay no.' },
            { speaker: 'Tambu', text: '¿Qué?' },
            { speaker: 'Cami', text: 'No me hagas explicar el chiste.' },
          ],
        },
        {
          id: 'prettier-up-close', text: 'Vos sos bastante más linda de cerca, así que estamos a mano.', intent: 'unfiltered-direct-flirt',
          effects: { attraction: 6, trust: 2, intensity: 6 },
          emits: ['tambu_showed_romantic_intent', 'cami_received_direct_flirt'],
          reaction: [
            { speaker: 'Cami', text: 'Ah bueno.' },
            { speaker: 'Tambu', text: '¿Qué?' },
            { speaker: 'Cami', text: 'Nada... seguí.' },
          ],
          variants: [
            {
              id: 'overplay-character', when: { anySignals: ['cami_warned_about_overplay', 'cami_noticed_tambu_character'] },
              effects: { attraction: -7, trust: -3, intensity: 3 },
              emits: ['cami_called_tambu_chamuyero', 'cami_disliked_overplay', 'cami_warned_about_overplay'],
              reaction: [
                { speaker: 'Cami', text: 'Ah, apareció el chamuyero.' },
                { speaker: 'Tambu', text: 'Estaba tardando.' },
                { speaker: 'Cami', text: 'Se notaba.' },
              ],
            },
            {
              id: 'overplay-intensity', when: { stats: { intensity: { gte: 12 } } },
              effects: { attraction: -7, trust: -3, intensity: 3 },
              emits: ['cami_called_tambu_chamuyero', 'cami_disliked_overplay', 'cami_warned_about_overplay'],
              reaction: [
                { speaker: 'Cami', text: 'Ah, apareció el chamuyero.' },
                { speaker: 'Tambu', text: 'Estaba tardando.' },
                { speaker: 'Cami', text: 'Se notaba.' },
              ],
            },
            {
              id: 'positive-flirt', when: {},
              emits: ['npc_returned_flirt', 'cami_showed_interest', 'cami_enjoyed_direct_flirt'],
            },
          ],
        },
      ],
    },
    {
      id: 'beat-4',
      prompt: 'Igual... pensé que me ibas a caer peor.',
      promptVariants: [
        {
          when: { allChoices: ['beat-3:prettier-up-close'], anySignals: ['cami_disliked_overplay', 'cami_warned_about_overplay'] },
          prompt: 'Bueno, chamuyero...\n\nIgual... pensé que me ibas a caer peor.',
        },
        { when: { allChoices: ['beat-3:disappointed-for-good'] }, prompt: 'Sos un hijo de puta.\n\nIgual... pensé que me ibas a caer peor.' },
        { when: { allChoices: ['beat-3:thanks-i-guess'] }, prompt: 'Bueno, aceptaste el cumplido.\n\nIgual... pensé que me ibas a caer peor.' },
        { when: { allChoices: ['beat-3:what-did-i-look-like'] }, prompt: 'Ay no, no te voy a explicar otra cosa.\n\nIgual... pensé que me ibas a caer peor.' },
        { when: { allChoices: ['beat-3:prettier-up-close'] }, prompt: 'Ah bueno...\n\nIgual... pensé que me ibas a caer peor.' },
      ],
      choices: [
        {
          id: 'why-did-you-think-that', text: '¿Por qué pensabas eso?', intent: 'overanalysis',
          effects: { attraction: -3, trust: 0, intensity: 1 },
          emits: ['cami_disliked_overanalysis', 'tambu_missed_tone'],
          reaction: [
            { speaker: 'Cami', text: 'No sé, Tambu.' },
            { speaker: 'Tambu', text: 'Algo habrás pensado.' },
            { speaker: 'Cami', text: 'No arruinemos el momento interrogándome.' },
          ],
        },
        {
          id: 'give-me-ten-minutes', text: 'Dame diez minutos más.', intent: 'self-irony',
          effects: { attraction: 6, trust: 4, intensity: 3 },
          emits: ['cami_enjoyed_self_irony', 'cami_enjoyed_banter', 'cami_wants_conversation_to_continue', 'tambu_built_chemistry'],
          reaction: [
            { speaker: 'Cami', text: 'JAJA.' },
            { speaker: 'Tambu', text: 'Todavía puedo remontar para abajo.' },
            { speaker: 'Cami', text: 'Confío en vos.' },
          ],
        },
        {
          id: 'good-enough', text: 'Bueno, me alcanza.', intent: 'friendly-acceptance',
          effects: { attraction: 2, trust: 6, intensity: 0 },
          emits: ['cami_sees_tambu_as_friendly', 'cami_friendzone_energy', 'tambu_played_safe'],
          reaction: [
            { speaker: 'Cami', text: 'Qué conformista.' },
            { speaker: 'Tambu', text: 'Sé elegir mis victorias.' },
            { speaker: 'Cami', text: 'Está bien.' },
          ],
        },
        {
          id: 'make-you-like-me-less', text: 'Entonces estamos a tiempo de que te caiga muchísimo peor.', intent: 'unfiltered-final-push',
          effects: { attraction: 6, trust: 1, intensity: 7 },
          emits: ['tambu_showed_romantic_intent', 'cami_final_push'],
          reaction: [
            { speaker: 'Cami', text: '¿Eso era una amenaza?' },
            { speaker: 'Tambu', text: 'Una propuesta.' },
          ],
          variants: [
            {
              id: 'overplay-signal', when: { anySignals: ['cami_disliked_overplay', 'cami_warned_about_overplay'] },
              effects: { attraction: -8, trust: -4, intensity: 4 },
              emits: ['cami_shut_down_overplay', 'cami_disliked_overplay'],
              reaction: [{ speaker: 'Cami', text: 'Sí, ya estás bastante cerca.' }],
            },
            {
              id: 'overplay-intensity', when: { stats: { intensity: { gte: 14 } } },
              effects: { attraction: -8, trust: -4, intensity: 4 },
              emits: ['cami_shut_down_overplay', 'cami_disliked_overplay'],
              reaction: [{ speaker: 'Cami', text: 'Sí, ya estás bastante cerca.' }],
            },
            {
              id: 'chemistry',
              when: {
                stats: { attraction: { gte: 14 }, trust: { gte: 8 }, intensity: { lte: 18 } },
                anySignals: ['cami_showed_interest', 'cami_returned_banter', 'cami_enjoyed_comeback'],
              },
              effects: { attraction: 3, trust: 2, intensity: -1 },
              emits: ['npc_returned_flirt', 'cami_invited_escalation', 'cami_showed_strong_interest'],
              reaction: [
                { speaker: 'Cami', text: 'Ah...' },
                { speaker: 'Cami', text: 'Bueno. Probá.' },
              ],
            },
            {
              id: 'friendship',
              when: { anySituations: ['friendzone_risk', 'comfortable_but_low_romantic_intent'] },
              effects: { attraction: -3, trust: 0, intensity: -2 },
              emits: ['cami_laughed_off_escalation', 'cami_friendzone_energy'],
              reaction: [{ speaker: 'Cami', text: 'Jajaja sos un idiota.' }],
            },
          ],
        },
      ],
    },
  ],
  council: CAMI_COUNCIL_CONFIG,
  outcomeRules: {
    ordered: [
      { outcome: 'rejection', when: { allSignals: ['cami_shut_down_overplay'] } },
      { outcome: 'rejection', when: { stats: { intensity: { gte: 22 } } } },
      {
        outcome: 'rejection',
        when: { allSignals: ['cami_disliked_overplay'], stats: { intensity: { gte: 14 } } },
      },
      {
        outcome: 'bathroom',
        when: {
          allSignals: ['cami_invited_escalation'],
          stats: { attraction: { gte: 18 }, trust: { gte: 11 }, intensity: { gte: 7, lte: 18 } },
        },
      },
      {
        outcome: 'bathroom',
        when: {
          allSignals: ['npc_returned_flirt', 'tambu_showed_romantic_intent'],
          anySignals: ['tambu_built_chemistry', 'cami_showed_interest'],
          stats: { attraction: { gte: 18 }, trust: { gte: 11 }, intensity: { gte: 7, lte: 18 } },
        },
      },
      {
        outcome: 'friendzone',
        when: { stats: { trust: { gte: 16 }, attraction: { lt: 13 }, intensity: { lte: 5 } } },
      },
      {
        outcome: 'instagram',
        when: { stats: { attraction: { gte: 10 }, trust: { gte: 7 } } },
      },
    ],
    fallback: 'rejection',
  },
  outcomes: {
    bathroom: {
      id: 'bathroom', icon: '🚻', label: 'BAÑO',
      lines: ['Cami y Tambu se alejaron juntos de la fiesta.'],
      closingSequence: [
        { speaker: 'Cami', text: 'Che.' },
        { speaker: 'Tambu', text: '¿Qué?' },
        { speaker: 'Cami', text: '¿Ese baño se puede cerrar?' },
        { speaker: 'Tambu', text: 'Sí.' },
        { speaker: 'Cami', text: 'Bueno.' },
        { speaker: 'Tambu', text: '¿Bueno qué?' },
        { speaker: 'Cami', text: 'No me hagas explicarte otro chiste. Vení.' },
      ],
      event: {
        type: 'bathroom', resultLabel: 'BAÑO CONSEGUIDO',
        resultText: 'Cami y Tambu entraron juntos al baño.',
      },
      reward: { points: 500, lives: 0 },
    },
    instagram: {
      id: 'instagram', icon: '📱', label: 'INSTAGRAM',
      lines: ['Cami: “Bueno, pasame tu Instagram.”\nTambu: “¿Eso fue un cumplido?”\nCami: “No arruines el momento.”'],
      reward: { points: 250, lives: 0 },
    },
    friendzone: {
      id: 'friendzone', icon: '💀', label: 'FRIENDZONE',
      lines: ['Cami: “Sos bastante divertido, Tambu.”\nTambu: “Ese “bastante” me preocupa.”\nCami: “Hacés bien.”'],
      reward: { points: 75, lives: 0 },
    },
    rejection: {
      id: 'rejection', icon: '👋', label: 'RECHAZO',
      lines: ['Cami: “Bueno... voy a volver con las chicas.”\nTambu: “Perfecto.”\nCami: “Sí. Perfecto.”'],
      reward: { points: 0, lives: -1 },
    },
  },
};
