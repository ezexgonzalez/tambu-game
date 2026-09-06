function hasSignal(session, signal) {
  return session.signals?.includes(signal) ?? false;
}

export function resolveSocialSituation(session) {
  const stats = session.stats ?? session;
  const history = session.history ?? [];
  const attraction = stats.attraction ?? 0;
  const trust = stats.trust ?? 0;
  const intensity = stats.intensity ?? 0;
  const returnedFlirt = hasSignal(session, 'npc_returned_flirt');
  const romanticIntent = hasSignal(session, 'tambu_showed_romantic_intent');
  const tags = [];

  if (history.length <= 1) tags.push('early_conversation');
  if (returnedFlirt) tags.push('returned_flirt');
  if (romanticIntent) tags.push('romantic_intent_shown');
  if (intensity >= 12 || hasSignal(session, 'tambu_overplayed')) tags.push('too_intense');
  if (attraction >= 14) tags.push('strong_attraction');
  if (trust >= 14 && attraction < 10 && intensity <= 5) tags.push('friendzone_risk');
  if (trust >= 9 && attraction < 9 && intensity <= 4) {
    tags.push('comfortable_but_low_romantic_intent');
  }
  if (attraction >= 10 && trust >= 10 && intensity >= 3 && intensity <= 11) {
    tags.push('good_balanced_progress');
  }
  if (tags.length === 0) tags.push('ambiguous');

  const priority = [
    'too_intense',
    'friendzone_risk',
    'strong_attraction',
    'good_balanced_progress',
    'comfortable_but_low_romantic_intent',
    'returned_flirt',
    'early_conversation',
    'ambiguous',
  ];

  return {
    primary: priority.find((tag) => tags.includes(tag)) ?? 'ambiguous',
    tags,
    evidence: {
      returnedFlirt,
      romanticIntent,
      choicesMade: history.length,
    },
  };
}
