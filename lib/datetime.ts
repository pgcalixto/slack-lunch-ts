import * as luxon from "luxon";

luxon.Settings.throwOnInvalid = true;

function _getLuxonEndDate(startDate: Date, durationISO: string) {
  const luxonStartDate = luxon.DateTime.fromJSDate(startDate);

  const luxonDuration = luxon.Duration.fromISO(durationISO);

  const luxonDate = luxonStartDate.plus(luxonDuration);

  return luxonDate;
}

function getDateByDuration(startDate: Date, durationISO: string) {
  const luxonDate = _getLuxonEndDate(startDate, durationISO);

  const date = luxonDate.toJSDate();

  const epoch = Math.round(luxonDate.toSeconds());

  return { date, epoch };
}

function getMinutes(durationISO: string) {
  const duration = luxon.Duration.fromISO(durationISO);

  const minutes = Math.round(duration.as("minutes"));

  return minutes;
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
  getDateByDuration,
  getMinutes,
  getRFC2822ByNowFromMillis,
  getRFC2822FromEpoch
};
