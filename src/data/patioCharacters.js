import { SOFI_CONVERSATION } from './conversations/sofiConversation.js';
import { MILI_CONVERSATION } from './conversations/miliConversation.js';
import { CAMI_CONVERSATION } from './conversations/camiConversation.js';

export const patioWomen = [
  {
    id: 'sofi',
    name: 'Sofi',
    x: 400,
    y: 690,
    palette: 7,
    conversation: SOFI_CONVERSATION,
  },
  {
    id: 'mili',
    name: 'Mili',
    x: 930,
    y: 330,
    palette: 8,
    conversation: MILI_CONVERSATION,
  },
  {
    id: 'cami',
    name: 'Cami',
    x: 1235,
    y: 635,
    palette: 9,
    conversation: CAMI_CONVERSATION,
  },
];

export const patioFriends = [
  { id: 'eze', name: 'Eze', x: 1215, y: 470, palette: 1 },
  { id: 'pitity', name: 'Pitity', x: 1270, y: 500, palette: 2 },
  { id: 'uriel', name: 'Uriel', x: 320, y: 355, palette: 3 },
  { id: 'santy', name: 'Santy', x: 380, y: 390, palette: 4 },
  { id: 'thiago', name: 'Thiago', x: 420, y: 800, palette: 5 },
  { id: 'tobi', name: 'Tobi', x: 470, y: 835, palette: 6 },
];
