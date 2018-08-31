import DummySegment from './DummySegment';

export default function(realSegments) {
  if (realSegments.length == 0) {
    return [];
  }

  let cumulativeDistance = 0;
  const segments = [
    new DummySegment({}),
    ...realSegments,
    new DummySegment({ title: 'End' }),
  ];

  return segments.slice(1).map((segment, index) => {
    const prevSegment = segments[index];
    cumulativeDistance += prevSegment.distance() || 0;

    return {
      cumulativeDistance,
      description: segment.strippedDescription(),
      distance: prevSegment.distance(),
      gain: prevSegment.gain(),
      location: index == 0 ? 'Start' : segment.title,
      locomotion: segment.locomotion(),
      loss: prevSegment.loss(),
      surface: segment.surface(),
      users: segment.users(),
    };
  });
}
