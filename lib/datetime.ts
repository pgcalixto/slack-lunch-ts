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

function getRFC2822ByNowFromMillis(millis: number) {
  const duration = luxon.Duration.fromMillis(millis);

  const now = luxon.DateTime.utc();

  const then = now.plus(duration);

  const rfc2822String = then.toRFC2822();

  return rfc2822String;
}

function getRFC2822FromEpoch(epoch: number) {
  const epochMillis = epoch * 1000;

  const date = luxon.DateTime.fromMillis(epochMillis);

  const utcDate = date.toUTC();

  const rfc2822String = utcDate.toRFC2822();

  return rfc2822String;
}

export {
  getEpoch,
  getMilliseconds,
  getRFC2822ByNowFromMillis,
  getRFC2822FromEpoch
};
