export const COUNCIL_CONFIG = {
  availableFromRound: 1,
  members: [
    {
      id: 'pitity',
      name: 'PITITY',
      advice: [
        { when: { intensity: { gte: 12 } }, text: 'No la apures.' },
        {
          when: { trust: { gte: 14 }, attraction: { lt: 8 } },
          text: 'Está cómoda. No significa todo.',
        },
        { text: 'Seguí tranqui.' },
      ],
    },
    {
      id: 'eze',
      name: 'EZE',
      advice: [
        {
          when: { trust: { gte: 14 }, attraction: { lt: 8 } },
          text: 'Te sigue la charla, pero estás jugando demasiado seguro.',
        },
        { when: { intensity: { gte: 12 } }, text: 'Ya entendió que te interesa. Bajá un cambio.' },
        { text: 'Viene bien. No cambies de personaje ahora.' },
      ],
    },
    {
      id: 'tobi',
      name: 'TOBI',
      advice: [
        { when: { intensity: { gte: 12 } }, text: 'Ya está, boludo. Callate un poco.' },
        { text: 'Andá, cagón.' },
      ],
    },
  ],
};
