import * as luxon from "luxon";

function getEpoch(startDate: Date, durationISO: string) {
  const luxonStartDate = luxon.DateTime.fromJSDate(startDate);

  const luxonDuration = luxon.Duration.fromISO(durationISO);

  const luxonDate = luxonStartDate.plus(luxonDuration);

  const dateEpoch = Math.round(luxonDate.toSeconds());

  return dateEpoch;
}

function getMilliseconds(durationISO: string) {
  const duration = luxon.Duration.fromISO(durationISO);

  const milliseconds = Math.round(duration.as("milliseconds"));

  return milliseconds;
}

export { getEpoch, getMilliseconds };
