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
          priority: 100,
          when: {
            allSituations: ['strong_attraction', 'returned_flirt'],
            allSignals: ['sofi_returned_flirt', 'tambu_showed_romantic_intent'],
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
          'Mucho misterio.', 'Ni vos sabés qué versión.',
        ], 50),
        recentAdvice('pitity-marketing', 'sofi_enjoyed_group_humor', [
          'Ya tenés representante.', 'Salió gratis la publicidad.',
        ], 50),
        recentAdvice('pitity-genuine', 'sofi_comfortable_with_genuine_intro', [
          'Todavía no la decepcionaste.', 'Te dio plazo.',
        ], 50),
        recentAdvice('pitity-papi', 'sofi_played_along_with_papi', [
          'Se rió. Milagro.', 'Arrancaste fuerte, papi.',
        ], 50),
        recentAdvice('pitity-observer', 'sofi_values_tambu_observation', [
          'Te fichó.', 'Sobreviviente profesional.',
        ], 50),
        recentAdvice('pitity-personal', 'sofi_invited_personal_connection', [
          'Ya no sos tan desconocido.', 'Te preguntó por ella.',
        ], 50),
        recentAdvice('pitity-report', 'sofi_amused_by_psychopedagogy', [
          'El informe no lo quiere.', 'No le factures.',
        ], 50),
        recentAdvice('pitity-automatic', 'beat3_genuine', [
          'Agotador, dijo.', 'Aflojá el análisis.',
        ], 50),
        recentAdvice('pitity-interest', 'beat3_direct_interest', [
          'Se dio por aludida.', 'Entendió.',
        ], 50),
        recentAdvice('pitity-vulnerable', 'beat3_vulnerable', [
          'Te analizaste solo.', 'Mucho pensamiento.',
        ], 50),
        recentAdvice('pitity-diagnosis', 'beat3_diagnosis', [
          'Guardá la matrícula.', 'Diagnóstico reservado.',
        ], 50),
      ],
      fallbackLines: [
        { id: 'pitity-neutral-1', text: '¿Yo tengo que saber?' },
        { id: 'pitity-neutral-2', text: 'Me elegiste a mí. Mirá vos.' },
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
