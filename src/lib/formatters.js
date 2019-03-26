export function floatToFixed(value) {
  return value.toFixed(2);
}

export function secondsToHours(seconds) {
  return (seconds / 60 / 60).toFixed(1);
}

const feetPerMeter = 3.28084;
export function metersToFeet(meters) {
  return (meters * feetPerMeter).toFixed(0);
}

export function millimetersToInches(millimeters) {
  return (millimeters * 0.0393701).toFixed(1);
}

export function celciusToFahrenheit(celcius) {
  return (celcius * (9 / 5) + 32).toFixed(0);
}

// https://journals.ametsoc.org/doi/abs/10.1175/1520-0442(1995)008%3C1261:ASSCCS%3E2.0.CO%3B2
// https://iahs.info/uploads/ICSIH_upload/articles/no1_2016/ICSIH%20article%20no1.pdf
// SWE = waterDepth * waterDensity
// SWE in kg/m^2
// waterDepth in m
// waterDensity in kg/m^3
export function kgPerSquareMeterToInches(swe) {
  const waterDensity = 1000;
  const waterDepth = swe / waterDensity;

  return (waterDepth * feetPerMeter).toFixed(1);
}

export function date(date) {
  return date.format('LL');
}

export const typeMappings = {
  // The order of the column types determines the order they are displayed in.
  lon: ['Longitude', floatToFixed],
  lat: ['Latitude', floatToFixed],
  elevation: ['Elevation (ft)', metersToFeet],
  date: ['Date', date],
  dayl: ['Daylight (hours)', secondsToHours],
  tmax_max: ['Highest max temperature (F)', celciusToFahrenheit],
  tmax_avg: ['Avg max temperature (F)', celciusToFahrenheit],
  tmin_min: ['Lowest min temperature (F)', celciusToFahrenheit],
  tmin_avg: ['Avg min temperature (F)', celciusToFahrenheit],
  prcp_avg: ['Avg precipitation (in/day)', millimetersToInches],
  swe_min: ['Min Snow water equivalent (in)', kgPerSquareMeterToInches],
  swe_avg: ['Avg Snow water equivalent (in)', kgPerSquareMeterToInches],
  swe_max: ['Max Snow water equivalent (in)', kgPerSquareMeterToInches],
};
