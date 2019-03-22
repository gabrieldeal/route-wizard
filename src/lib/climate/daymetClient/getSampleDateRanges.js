import dayjs from '../dayjs';

export default function({
  date: targetDateStr,
  numSampleYears = 10,
  numSampleDays = 20,
}) {
  const targetDate = dayjs.utc(targetDateStr);
  const now = dayjs.utc();

  // Go back two years because Daymet will not have data for this year
  // and they may not have already released data for last year.
  const startYear = now.subtract(2 + numSampleYears, 'year').year();

  const sampleDates = [];
  for (let i = 0; i < numSampleYears; i++) {
    const start = targetDate
      .clone()
      .year(startYear + i)
      .subtract(Math.floor(numSampleDays / 2));
    const end = start.clone().add(numSampleDays - 1, 'day');
    sampleDates.push({
      date: targetDate,
      start: start,
      end: end,
    });
  }

  return sampleDates;
}
