import client from './client';
import flatten from 'lodash/flatten';
import getSampleDateRanges from './getSampleDateRanges';
import normalizeResponse from './normalizeResponse';
import pAll from 'p-all';
import summarizeResponses from './summarizeResponses';
import toPairs from 'lodash/toPairs';

function groupByQueryId(responsesByQueryId, response) {
  const responses = responsesByQueryId.get(response.queryId);
  if (responses) {
    responses.push(response);
  } else {
    responsesByQueryId.set(response.queryId, [response]);
  }

  return responsesByQueryId;
}

function rejectIfError(response) {
  if (response.error) {
    console.error('Got error when querying Daymet:', response);
    return Promise.reject();
  }

  return response;
}

export default async function({
  clientImpl = client,
  concurrency = 2,
  queries: partialQueries,
}) {
  const queries = partialQueries.map(({ date, ...query }, queryId) =>
    getSampleDateRanges({ date }).map((dateRange) => ({
      queryId,
      ...query,
      ...dateRange,
    }))
  );
  const actions = flatten(queries).map(({ date, queryId, ...query }) => {
    return () =>
      clientImpl(query)
        .then(rejectIfError)
        .then(normalizeResponse)
        .then((response) => ({ date, queryId, ...response }));
  });
  const responses = await pAll(actions, { concurrency });
  const responsesByQueryId = responses.reduce(groupByQueryId, new Map());

  return toPairs(responsesByQueryId)
    .sort(([a], [b]) => Math.sign(a - b))
    .map(([_queryId, responses]) => summarizeResponses(responses));
}
