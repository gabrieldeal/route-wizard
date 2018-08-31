export function calculateElevationStatistics(elevations) {
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < elevations.length; ++i) {
    const prevElevation = elevations[i - 1];
    const elevation = elevations[i];
    if (prevElevation < elevation) {
      gain += elevation - prevElevation;
    } else {
      loss += prevElevation - elevation;
    }
  }

  return {
    gain: gain,
    loss: loss,
  };
}
