// Zone choices are editor context, not world bounds or automatic group assignment.
export const PATIO_COMPOSER_AREAS = Object.freeze({
  DJ: { label: 'DJ / Lounge', group: 'upper-lounge', hint: 'Dejá libre la pista y los accesos a los personajes.' },
  poolside: { label: 'Piscina / Poolside', group: 'pool-side', hint: 'Usá el espacio seco y dejá libre el borde de la piscina.' },
  bar: { label: 'Barra', group: 'bar-side', hint: 'Dejá libre el frente de servicio y el paso hacia el baño.' },
  deck: { label: 'Casa / Deck', group: 'house-deck', hint: 'Dejá libres las puertas y la bajada al patio.' },
  perimeter: { label: 'Perímetro', group: 'lower-border-west', hint: 'Dejá libre el acceso al patio. El alineado del borde inferior sigue en Edición.' },
});

export const PATIO_OPTIONAL_GROUPS = Object.freeze({
  'bar-side': 'Barra',
  'house-deck': 'Casa / Deck',
});
