// Presentation may lag a hit; damage and the ten-second clock never wait for a line.
export function getBathroomReactionTimeline(narrative, config) {
  const timeline = [];
  let nextReadableAt = 0;
  narrative.hits.forEach((reaction, index) => {
    if (!reaction.speaker) return;
    const at = Math.max(config.hits[index].at, nextReadableAt);
    const memory = (narrative.attemptNumber === 2 && index === 4)
      || (narrative.attemptNumber === 3 && index === 2);
    const readingMs = memory ? 2000 : narrative.attemptNumber === 3 ? 1400 : 1600;
    timeline.push({ at, reaction, readingMs });
    nextReadableAt = at + readingMs;
  });
  return timeline;
}
