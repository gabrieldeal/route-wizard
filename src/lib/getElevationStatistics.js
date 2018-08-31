export function calculateElevationStatistics(elevations) {
  const filteredElevations = elevations.filter(
    (elevation) => typeof elevation !== 'undefined'
  );

  if (filteredElevations.length < 2) {
    return { gain: undefined, loss: undefined };
  }

  let gain = 0;
  let loss = 0;

  filteredElevations.slice(1).forEach((elevation, i) => {
    const prevElevation = elevations[i];
    if (prevElevation < elevation) {
      gain += elevation - prevElevation;
    } else {
      loss += prevElevation - elevation;
    }
  });

  return {
    gain: gain,
    loss: loss,
  };
}
