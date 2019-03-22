import flatMap from 'lodash/flatMap';
import mean from 'lodash/mean';

function getMiddleValue(values) {
  const index = Math.floor(values.length / 2);

  return values[index];
}

function values(responses, attribute) {
  return flatMap(responses, (response) => response[attribute]);
}

function average(responses, attribute) {
  return mean(values(responses, attribute));
}

function min(responses, attribute) {
  return Math.min(...values(responses, attribute));
}

function max(responses, attribute) {
  return Math.max(...values(responses, attribute));
}

export default function(allResponses) {
  const responses = allResponses.filter((response) => response.date);
  if (responses.length === 0) {
    return [];
  }

  return {
    date: responses[0].date,
    dayl: getMiddleValue(responses[0].dayl),
    elevation: responses[0].elevation,
    prcp_avg: average(responses, 'prcp'),
    swe_avg: average(responses, 'swe'),
    swe_max: max(responses, 'swe'),
    swe_min: min(responses, 'swe'),
    tmax_avg: average(responses, 'tmax'),
    tmax_max: max(responses, 'tmax'),
    tmin_avg: average(responses, 'tmin'),
    tmin_min: min(responses, 'tmin'),
  };
}
