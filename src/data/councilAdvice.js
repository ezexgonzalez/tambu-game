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
      ],
      fallbackLines: [
        { id: 'pitity-neutral-1', text: 'Puede ser.' },
        { id: 'pitity-neutral-2', text: 'Seguí viendo.' },
      ],
    },
    {
      id: 'eze',
      name: 'EZE',
      rules: [
        {
          id: 'eze-papi',
          priority: 95,
          when: {
            allSignals: ['sofi_played_along_with_papi'],
            historyLength: { lte: 1 },
          },
          lines: [{ id: 'eze-papi-line', text: 'Lo de papi funcionó de pedo. No abuses.' }],
        },
        {
          id: 'eze-intense',
          priority: 90,
          when: { anySituations: ['too_intense'] },
          lines: [
            { id: 'eze-intense-1', text: 'Ya entendió que te interesa. Bajá un cambio.' },
            { id: 'eze-intense-2', text: 'No sigas empujando porque la vas a quemar.' },
          ],
        },
        {
          id: 'eze-returned-flirt',
          priority: 80,
          when: { anySituations: ['returned_flirt'] },
          lines: [
            { id: 'eze-flirt-1', text: 'Esa te la dejó picando bastante.' },
            { id: 'eze-flirt-2', text: 'Ojo que ahí hubo algo.' },
            { id: 'eze-flirt-3', text: 'Na bueno... esta quiere keke.' },
          ],
        },
        {
          id: 'eze-friendzone',
          priority: 70,
          when: { anySituations: ['friendzone_risk'] },
          lines: [
            {
              id: 'eze-friend-1',
              text: 'La charla está buena, pero estás jugando demasiado de amigo.',
            },
            {
              id: 'eze-friend-2',
              text: 'Está cómoda, sí. Pero no significa necesariamente que te esté dando bola.',
            },
            { id: 'eze-friend-3', text: 'En algún momento acordate de que te gusta.' },
          ],
        },
        {
          id: 'eze-balanced',
          priority: 50,
          when: { anySituations: ['good_balanced_progress'] },
          lines: [
            { id: 'eze-balanced-1', text: 'Viene bien. Seguí hablando normal.' },
            { id: 'eze-balanced-2', text: 'Hay algo, pero no inventes de más todavía.' },
          ],
        },
      ],
      fallbackLines: [
        { id: 'eze-neutral-1', text: 'Todavía es medio pronto. Seguí viendo qué devuelve.' },
        { id: 'eze-neutral-2', text: 'La charla está bien, pero no te diría que ya está.' },
      ],
    },
    {
      id: 'tobi',
      name: 'TOBI',
      rules: [
        {
          id: 'tobi-intense',
          priority: 90,
          when: { anySituations: ['too_intense'] },
          lines: [
            { id: 'tobi-intense-1', text: 'Nao, nao... ya está. No digas más nada.' },
            { id: 'tobi-intense-2', text: 'Ya está. Callate la boca un poco.' },
          ],
        },
        {
          id: 'tobi-friendzone',
          priority: 75,
          when: { anySituations: ['friendzone_risk'] },
          lines: [
            {
              id: 'tobi-friend-1',
              text: '¿Sos pelotudo? ¿Entonces para qué viniste a hablarle? Hacé algo.',
            },
            {
              id: 'tobi-friend-2',
              text: 'Nao, nao... estás jugando demasiado de amigo. Acordate para qué viniste.',
            },
          ],
        },
        {
          id: 'tobi-obvious',
          priority: 65,
          when: { anySituations: ['returned_flirt', 'good_balanced_progress'] },
          lines: [
            { id: 'tobi-obvious-1', text: '¿Sos pelotudo? Te está hablando bien. Hacé algo.' },
            { id: 'tobi-obvious-2', text: '¿Qué estás esperando? Hacelo.' },
          ],
        },
      ],
      fallbackLines: [
        { id: 'tobi-neutral-1', text: 'Andá, cagón.' },
        { id: 'tobi-neutral-2', text: 'Seguí hablando normal y dejá de pensar tanto.' },
      ],
    },
  ],
};
