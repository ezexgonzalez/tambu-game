// Callbacks use only the last choice's emitted signals, never accumulated signals.
function recentAdvice(id, signal, texts, priority = 110, conditions = {}) {
  return {
    id,
    priority,
    when: { latestSignals: [signal], ...conditions },
    lines: texts.map((text, index) => ({ id: `${id}-${index + 1}`, text })),
  };
}

export const COUNCIL_CONFIG = {
  availableFromBeatIndex: 1,
  members: [
    {
      id: 'pitity',
      name: 'PITITY',
      rules: [
        {
          id: 'pitity-optimus',
          priority: 200,
          when: {
            allSituations: ['strong_attraction', 'returned_flirt'],
            allSignals: ['npc_returned_flirt', 'tambu_showed_romantic_intent'],
            historyLength: { gte: 3 },
          },
          lines: [{ id: 'pitity-optimus-line', text: 'Optimus.' }],
        },
        {
          id: 'pitity-hard',
          priority: 80,
          when: { anySituations: ['friendzone_risk', 'too_intense'] },
          lines: [{ id: 'pitity-hard-line', text: 'Y la verdad que está bastante hard.' }],
        },
        {
          id: 'pitity-ez',
          priority: 60,
          when: { anySituations: ['good_balanced_progress', 'returned_flirt'] },
          lines: [{ id: 'pitity-ez-line', text: 'Parece bastante EZ.' }],
        },
        recentAdvice('pitity-mystery', 'sofi_engaged_with_mystery', [
          'Rarillo.', 'Vale...',
        ], 50),
        recentAdvice('pitity-marketing', 'sofi_enjoyed_group_humor', [
          'Marketingillo.', 'Pro.',
        ], 50),
        recentAdvice('pitity-genuine', 'sofi_comfortable_with_genuine_intro', [
          'Vale.', 'Bastante pro.',
        ], 50),
        recentAdvice('pitity-papi', 'sofi_played_along_with_papi', [
          'God.', 'Papiillo.',
        ], 50),
        recentAdvice('pitity-observer', 'sofi_values_tambu_observation', [
          'Rarillo.', 'Está pro.',
        ], 50),
        recentAdvice('pitity-personal', 'sofi_invited_personal_connection', [
          'Amiguillos.', 'Vale.',
        ], 50),
        recentAdvice('pitity-report', 'sofi_amused_by_psychopedagogy', [
          'Hardy Kane.', 'Harly Queen.',
        ], 50),
        recentAdvice('pitity-automatic', 'beat3_genuine', [
          'Pensadillo.', 'Estás intensillo.',
        ], 50),
        recentAdvice('pitity-interest', 'beat3_direct_interest', [
          'God.', 'Bastante pro.',
        ], 50),
        recentAdvice('pitity-vulnerable', 'beat3_vulnerable', [
          'Complicadillo.', 'Pensadillo.',
        ], 50),
        recentAdvice('pitity-diagnosis', 'beat3_diagnosis', [
          'Psicopedagogillo.', 'Vale...',
        ], 50),
      ],
      fallbackLines: [
        { id: 'pitity-neutral-1', text: '¿Y yo qué sé?' },
        { id: 'pitity-neutral-2', text: 'Preguntale a ella.' },
        { id: 'pitity-neutral-3', text: 'Me sacaste para esto.' },
        { id: 'pitity-neutral-4', text: 'Vale.' },
        { id: 'pitity-neutral-5', text: 'Y...' },
      ],
    },
    {
      id: 'eze',
      name: 'EZE',
      rules: [
        {
          id: 'eze-intense',
          priority: 140,
          when: { anySituations: ['too_intense'] },
          lines: [
            { id: 'eze-intense-1', text: 'Ya está boludo, no hagas más.' },
            { id: 'eze-intense-2', text: 'Venía bien, no la cagues ahora.' },
          ],
        },
        {
          id: 'eze-strong-flirt',
          priority: 130,
          when: {
            latestSignals: ['beat3_direct_interest'],
            allSituations: ['strong_attraction', 'returned_flirt', 'good_balanced_progress'],
            allSignals: ['sofi_returned_flirt'],
            historyLength: { eq: 3 },
          },
          lines: [
            { id: 'eze-strong-1', text: 'Na bueno... esta quiere keke.' },
            { id: 'eze-strong-2', text: 'Está pidiendo keke.' },
            { id: 'eze-strong-3', text: 'Te preguntó si pasó la selección y sigue con el juego. Ojo, boludo.' },
          ],
        },
        {
          id: 'eze-papi',
          priority: 110,
          when: { latestSignals: ['sofi_played_along_with_papi'] },
          lines: [{ id: 'eze-papi-line', text: 'Lo de papi funcionó de pedo. No abuses.' }],
        },
        recentAdvice('eze-mystery', 'sofi_engaged_with_mystery', [
          'Boludo, ahora yo también quiero saber qué versión le llegó.',
          'Te preguntó si hay más de una versión. No le mandes el prontuario entero.',
        ]),
        recentAdvice('eze-marketing', 'sofi_enjoyed_group_humor', [
          'Marketing orgánico, tiraste. Menos mal que no le pasaste un presupuesto.',
          'Tu nombre circula, sí. Falta saber qué están contando estos boludos.',
        ]),
        recentAdvice('eze-genuine', 'sofi_comfortable_with_genuine_intro', [
          'Te dijo que todavía tenés tiempo. Te está descansando un poco, boludo.',
          'Todavía ni arrancaron y ya pediste no decepcionarla. No te pongas en examen.',
        ]),
        recentAdvice('eze-observer', 'sofi_values_tambu_observation', [
          'Te compró lo de observar. No hace falta demostrarle toda la carrera ahora.',
          'Se enganchó con cómo sos con los chicos. Por ahora es eso, no armes una película.',
        ]),
        recentAdvice('eze-personal', 'sofi_invited_personal_connection', [
          'Ojo, te preguntó si ella ya dejó de ser una desconocida. Esa pregunta fue por ella.',
          'No sé boludo, lo de si ya la conocés sonó bastante personal.',
        ]),
        recentAdvice('eze-report', 'sofi_amused_by_psychopedagogy', [
          'El informe te lo rechazó al toque. No le mandes un PDF después, boludo.',
          'Le ofreciste diagnosticarla y te siguió hablando. No lo tomes como permiso para atenderla.',
        ]),
        recentAdvice('eze-automatic', 'beat3_genuine', [
          'Te dijo agotador. No conviertas la charla en una evaluación, boludo.',
          'Lo de que agotás a los demás me consta, boludo. Dejala hablar a ella también.',
        ]),
        recentAdvice('eze-interest', 'beat3_direct_interest', [
          'Ese “qué conveniente” te lo devolvió. No sé si ya está, pero entendió la indirecta.',
          'Ahora sí se enteró. El “ah...” puede ser varias cosas, no festejes antes de tiempo.',
        ]),
        recentAdvice('eze-vulnerable', 'beat3_vulnerable', [
          'Estás charlando re lindo, pero no sé si se enteró que te la querés levantar.',
          'Le dijiste que flasheás cosas y viniste a preguntarme qué flashear. Sos tremendo, boludo.',
        ], 110, { noSignals: ['tambu_showed_romantic_intent'] }),
        recentAdvice('eze-vulnerable-after-flirt', 'beat3_vulnerable', [
          'Antes te devolvió el juego. Ahora te estás haciendo la cabeza vos, boludo.',
          'Le hablaste de selección y ahora de flashear cosas. No te armes un juicio solo.',
        ], 110, { allSignals: ['sofi_returned_flirt'] }),
        recentAdvice('eze-diagnosis', 'beat3_diagnosis', [
          'Te pidió el diagnóstico y le tiraste secreto profesional. Le estás haciendo un trámite, boludo.',
          'Te siguió el chiste del diagnóstico. No sé si quiere salir con vos o sacarte la matrícula.',
        ]),
        {
          id: 'eze-returned-flirt',
          priority: 80,
          when: { anySituations: ['returned_flirt'] },
          lines: [
            { id: 'eze-flirt-1', text: 'Esa te la dejó picando.' },
            { id: 'eze-flirt-2', text: 'Ojo que ahí hubo algo.' },
            { id: 'eze-flirt-3', text: 'Te preguntó si pasó la selección, boludo. Te siguió el juego.' },
          ],
        },
        {
          id: 'eze-friendzone',
          priority: 70,
          when: { anySituations: ['friendzone_risk'] },
          lines: [
            { id: 'eze-friend-1', text: 'Mmm... estás medio modo amigo igual.' },
            { id: 'eze-friend-2', text: 'Se ríe y charla, sí. Con nosotros también hace eso, boludo.' },
          ],
        },
        {
          id: 'eze-balanced',
          priority: 50,
          when: { anySituations: ['good_balanced_progress'] },
          lines: [
            { id: 'eze-balanced-1', text: 'Por ahora se están llevando bien. Tampoco inventes una película.' },
            { id: 'eze-balanced-2', text: 'No sé boludo, hay ida y vuelta. No me hagas firmarte nada.' },
          ],
        },
      ],
      fallbackLines: [
        { id: 'eze-neutral-1', text: 'No sé boludo, puede ser. Me pedís que adivine y yo también estoy acá mirando.' },
        { id: 'eze-neutral-2', text: 'Te diría que sí, pero después sale mal y la culpa la tengo yo.' },
      ],
    },
    {
      id: 'tobi',
      name: 'TOBI',
      rules: [
        {
          id: 'tobi-intense',
          priority: 140,
          when: { anySituations: ['too_intense'] },
          lines: [
            { id: 'tobi-intense-1', text: 'Nao, nao... ya está. No digas más nada.' },
            { id: 'tobi-intense-2', text: 'Ya está. Callate la boca un poco.' },
          ],
        },
        recentAdvice('tobi-papi', 'sofi_played_along_with_papi', [
          'Arrancaste diciéndote papi. Ahora bancátela.',
          'Para decirle papi no me preguntaste, cagón.',
        ]),
        recentAdvice('tobi-mystery', 'sofi_engaged_with_mystery', [
          'Te hacés el misterioso y venís a preguntarme a mí. Andá.',
          '¿Ya me viniste a romper las pelotas? Recién arrancaste con el misterio.',
        ]),
        recentAdvice('tobi-marketing', 'sofi_enjoyed_group_humor', [
          '¿Me llamaste para contarme que tenés prensa? Sos pelotudo.',
          'Menos marketing, cagón. Volvé allá.',
        ]),
        recentAdvice('tobi-genuine', 'sofi_comfortable_with_genuine_intro', [
          'Recién arrancaste, cagón. Todavía no decepcionaste a nadie.',
          'Si seguís viniendo acá a preguntar, la vas a decepcionar por abandono.',
        ]),
        recentAdvice('tobi-observer', 'sofi_values_tambu_observation', [
          'Nos dejás cansarnos solos, pero a mí me venís a cansar.',
          'Listo, sobreviviste. Ahora hablá con ella, cagón.',
        ]),
        recentAdvice('tobi-personal', 'sofi_invited_personal_connection', [
          'Te preguntó si ya la conocés. ¿Entonces para qué me preguntás a mí?',
          'No te pidió un documento, cagón. Seguí conociéndola.',
        ]),
        recentAdvice('tobi-selective', 'sofi_returned_flirt', [
          '¿Sos pelotudo? Te la acaba de dejar ahí.',
          'Te preguntó si pasó la selección. ¿Qué estás esperando?',
        ]),
        recentAdvice('tobi-report', 'sofi_amused_by_psychopedagogy', [
          'Te dijo que no al informe. Guardalo y callate la boca con eso.',
          'Nao, nao... no le hagas una consulta médica en la fiesta.',
        ]),
        recentAdvice('tobi-automatic', 'beat3_genuine', [
          'Agotador. Te lo dijo ella, no yo.',
          'Lo automático apagalo un rato. Hablale sin hacerle un estudio.',
        ]),
        recentAdvice('tobi-interest', 'beat3_direct_interest', [
          'Listo, ya se lo dijiste. ¿Entonces para qué preguntás?',
          'Ahora bancá lo que dijiste, cagón.',
        ]),
        recentAdvice('tobi-vulnerable', 'beat3_vulnerable', [
          'Nao, nao... ya estás inventando cualquier cosa. Seguí hablando normal.',
          'Le dijiste que pensás demasiado y viniste a pensar conmigo. Volvé allá.',
        ]),
        recentAdvice('tobi-diagnosis', 'beat3_diagnosis', [
          'El diagnóstico guardátelo, cagón. Hablale de vos.',
          'Secreto profesional, tiraste. ¿La estás levantando o le estás cobrando?',
        ]),
        {
          id: 'tobi-friendzone',
          priority: 75,
          when: { anySituations: ['friendzone_risk'] },
          lines: [
            { id: 'tobi-friend-1', text: '¿Entonces para qué viniste a hablarle? ¿Para hacer otro amigo?' },
            { id: 'tobi-friend-2', text: 'Mucho hablar, cagón. Ni vos te acordás de que te gusta.' },
          ],
        },
        {
          id: 'tobi-obvious',
          priority: 65,
          when: { anySituations: ['returned_flirt', 'good_balanced_progress'] },
          lines: [
            { id: 'tobi-obvious-1', text: '¿Qué estás esperando? Hacelo.' },
            { id: 'tobi-obvious-2', text: 'Te sigue hablando y vos acá. Andá, cagón.' },
          ],
        },
      ],
      fallbackLines: [
        { id: 'tobi-neutral-1', text: '¿Me llamaste por esto? Andá y hacelo.' },
        { id: 'tobi-neutral-2', text: 'Si te quedás acá conmigo, seguro que no pasa nada.' },
      ],
    },
  ],
};

function miliRecentAdvice(id, signal, texts, priority = 160) {
  return recentAdvice(id, signal, Array.isArray(texts) ? texts : [texts], priority);
}

const MILI_COUNCIL_RULES = {
  pitity: [
    miliRecentAdvice('pitity-mili-drink-trust', 'mili_trusted_drink_to_tambu', ['Goood.', 'Bastante pro.', 'Confianzilla.']),
    miliRecentAdvice('pitity-mili-friendly', 'mili_called_tambu_educated', ['Vale.', 'Educadillo.']),
    miliRecentAdvice('pitity-mili-rude', 'mili_called_tambu_tempered', ['Hardy Kane.', 'Harly Queen.', 'Bastante hard.', 'Vale...']),
    miliRecentAdvice('pitity-mili-claim', 'mili_laughed_at_drink_claim', ['God.', 'Bastante pro.', 'Ladroncillo.']),
    miliRecentAdvice('pitity-mili-party-good', 'mili_agreed_on_pool_accident', ['Goood.', 'Pro.', 'Misma neuroncilla.']),
    miliRecentAdvice('pitity-mili-party-friendly', 'mili_enjoyed_party_agreement', ['Amiguillos.', 'Vale, chavales.', 'Modo chavales.']),
    miliRecentAdvice('pitity-mili-party-bad', 'mili_declined_to_hold_tambu', ['Hardy Kane.', 'Harly Queen.', 'Bastante hard.']),
    miliRecentAdvice('pitity-mili-chaos', 'mili_played_along_with_chaos', ['Goood.', 'Está pro.', 'Se puso god.', 'Combete.']),
    miliRecentAdvice('pitity-mili-warning', 'mili_warned_tambu_to_slow_down', ['Hardy Kane.', 'Harly Queen.', 'Estás intensillo.', 'Fulete.']),
    miliRecentAdvice('pitity-mili-dance-bad', 'mili_called_dancing_boring', ['Hard.', 'Hardy Kane.', 'Harly Queen.']),
    miliRecentAdvice('pitity-mili-dance-friendly', 'mili_framed_party_companions', ['Amiguillos.', 'Modo chavales.']),
    miliRecentAdvice('pitity-mili-challenge', 'mili_returned_challenge', ['God.', 'Bastante pro.']),
    miliRecentAdvice('pitity-mili-dance-tease', 'mili_played_along_with_dance_tease', ['Goood.', 'Pro.', 'Bastante pro.']),
    miliRecentAdvice('pitity-mili-overplay', 'mili_disliked_overplay', ['Hardy Kane.', 'Harly Queen.', 'Estás intensillo.', 'Fulete.', 'Bastante hard.']),
  ],
  eze: [
    {
      id: 'eze-mili-strong-flirt',
      priority: 210,
      when: {
        latestSignals: ['mili_returned_challenge'],
        allSituations: ['strong_attraction', 'returned_flirt', 'good_balanced_progress'],
        allSignals: ['npc_returned_flirt', 'tambu_showed_romantic_intent'],
        historyLength: { eq: 3 },
      },
      lines: [
        { id: 'eze-mili-strong-1', text: 'Na bueno... esta quiere keke.' },
        { id: 'eze-mili-strong-2', text: 'Está pidiendo keke.' },
      ],
    },
    miliRecentAdvice('eze-mili-drink-trust', 'mili_trusted_drink_to_tambu', 'Te dejó un vaso de la nada y se quedó hablando. Por ahora buena onda, no inventes.'),
    miliRecentAdvice('eze-mili-friendly', 'mili_called_tambu_educated', 'Todo bien, pero fuiste literalmente un perchero con manos.'),
    miliRecentAdvice('eze-mili-rude', 'mili_called_tambu_tempered', '“No soy tu mozo mami”. Arrancaste como un pelotudo.'),
    miliRecentAdvice('eze-mili-claim', 'mili_laughed_at_drink_claim', 'Lo del vaso te lo compró. No empieces a abusar ahora.'),
    miliRecentAdvice('eze-mili-party-friendly', 'mili_enjoyed_party_agreement', 'Se están cagando de risa de la fiesta. Puede ser solo buena onda.'),
    miliRecentAdvice('eze-mili-party-bad', 'mili_declined_to_hold_tambu', 'Le dijiste que te querés ir y te dijo que no te retiene. No sé qué querés que te diga.'),
    miliRecentAdvice('eze-mili-party-good', 'mili_agreed_on_pool_accident', 'Coincidieron hasta en quién se cae a la pileta. Ahí hubo algo, pero calmate.'),
    miliRecentAdvice('eze-mili-chaos', 'mili_played_along_with_chaos', 'Te siguió lo de ser parte del problema. Ojo.'),
    miliRecentAdvice('eze-mili-warning', 'mili_warned_tambu_to_slow_down', 'Ya te dijo que bajes medio cambio. Hacelo.'),
    miliRecentAdvice('eze-mili-dance-bad', 'mili_called_dancing_boring', 'Te dijo “qué embole” en la cara. No necesito analizar mucho.'),
    miliRecentAdvice('eze-mili-dance-friendly', 'mili_framed_party_companions', 'Se están llevando bien, pero sigue medio compañeros de joda.'),
    miliRecentAdvice('eze-mili-challenge', 'mili_returned_challenge', 'Esa te la dejó picando.'),
    miliRecentAdvice('eze-mili-dance-tease', 'mili_played_along_with_dance_tease', 'Te dijo que después te lo hace comprobar. Ojo que ahí hubo algo.'),
    miliRecentAdvice('eze-mili-overplay', 'mili_disliked_overplay', 'Ya te está diciendo que solo sabés bardear. Aflojá.'),
  ],
  tobi: [
    miliRecentAdvice('tobi-mili-drink-trust', 'mili_trusted_drink_to_tambu', 'Te pidió un favor, se lo hiciste y habló. Seguí.'),
    miliRecentAdvice('tobi-mili-friendly', 'mili_called_tambu_educated', '¿Viniste a preguntarme porque sostuviste un vaso? Volvé allá.'),
    miliRecentAdvice('tobi-mili-rude', 'mili_called_tambu_tempered', '“No soy tu mozo mami”. ¿Sos pelotudo?'),
    miliRecentAdvice('tobi-mili-claim', 'mili_laughed_at_drink_claim', 'Le robaste el vaso cuatro segundos. ¿Y?'),
    miliRecentAdvice('tobi-mili-party-friendly', 'mili_enjoyed_party_agreement', 'Están hablando de una fiesta. Hacé algo.'),
    miliRecentAdvice('tobi-mili-party-bad', 'mili_declined_to_hold_tambu', 'Si te querés ir, andate. ¿Entonces para qué le hablás?'),
    miliRecentAdvice('tobi-mili-party-good', 'mili_agreed_on_pool_accident', 'Se cagó de risa. ¿Qué querés, un certificado?'),
    miliRecentAdvice('tobi-mili-chaos', 'mili_played_along_with_chaos', 'Bueno, te siguió. No la cagues.'),
    miliRecentAdvice('tobi-mili-warning', 'mili_warned_tambu_to_slow_down', 'Te dijo bajá medio cambio. Bajalo.'),
    miliRecentAdvice('tobi-mili-dance-bad', 'mili_called_dancing_boring', 'No bailás ni en pedo y ella te dijo qué embole. Listo.'),
    miliRecentAdvice('tobi-mili-dance-friendly', 'mili_framed_party_companions', 'Mucho banco, mucha dignidad. ¿Vas a hacer algo?'),
    miliRecentAdvice('tobi-mili-challenge', 'mili_returned_challenge', '¿Sos pelotudo? Te desafió de vuelta. Hacé algo.'),
    miliRecentAdvice('tobi-mili-dance-tease', 'mili_played_along_with_dance_tease', 'Te dijo que te lo hace comprobar. Andá.'),
    miliRecentAdvice('tobi-mili-overplay', 'mili_disliked_overplay', 'Nao, nao... ya estás bardeando de más.'),
  ],
};

export const MILI_COUNCIL_CONFIG = {
  ...COUNCIL_CONFIG,
  members: COUNCIL_CONFIG.members.map((member) => ({
    ...member,
    rules: [...(MILI_COUNCIL_RULES[member.id] ?? []), ...member.rules],
  })),
};
