import DummySegment from './DummySegment';

function isBlank(str) {
  return str === undefined || str === null || str === '' || isNaN(str);
}

function roundTo(number, position) {
  return Number(number.toFixed(position));
}

function roundToFeet(meters) {
  if (isBlank(meters)) {
    return null;
  }

  return roundTo(meters * 3.28084, 0);
}

function roundToMiles(meters) {
  if (isBlank(meters)) {
    return null;
  }

  return roundTo(meters * 0.000621371, 1);
}

function createRows(realSegments) {
  if (realSegments.length == 0) {
    return [];
  }

  let cumulativeDistance = 0;
  const segments = [...realSegments, new DummySegment({ title: 'The End' })];

  return segments.slice(0, segments.length - 1).map((segment, index) => {
    const nextSegment = segments[index + 1];
    cumulativeDistance += segment.distance() || 0;

    return {
      cumulativeDistance: roundToMiles(cumulativeDistance),
      description: segment.description(),
      distance: roundToMiles(segment.distance()),
      gain: roundToFeet(segment.gain()),
      from: segment.title,
      to: nextSegment.title,
      locomotion: segment.locomotion(),
      loss: roundToFeet(segment.loss()),
      surface: segment.surface(),
      users: segment.users(),
    };
  });
}

function filterColumns(filteredRows, unfilteredColumns) {
  const optionalColumns = ['users', 'surface', 'locomotion', 'gain', 'loss'];
  const unusedOptionalColumns = optionalColumns.filter(
    (optionalColumn) => !filteredRows.find((row) => row[optionalColumn])
  );

  return unfilteredColumns.filter(
    (column) => !unusedOptionalColumns.includes(column.key)
  );
}

export default function(segments, unfilteredColumns) {
  const rows = createRows(segments);
  const columns = filterColumns(rows, unfilteredColumns);

  return { rows, columns };
}
