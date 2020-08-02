import { WebClient, WebAPICallResult } from "@slack/web-api";
import { getEpochByNow, getMilliseconds, getMinutes } from "./datetime";
import { logEpoch, logMinutes, logTimeout } from "./logger";
import config from "../config";

// TODO: internationalize messages
const token = config.slackToken;
const channel = config.slackChannel;

const lunchMessage = "vou almoçar! 🍛";
const finishLunchMessage = "voltei do almoço";
const resumeWorkReminderMessage = "voltar a trabalhar!";
const lunchStatusMessage = "almoçando";
const lunchStatusEmoji = "🍛";

const finishLunchTimeout = getMilliseconds(config.finishLunchDurationISO);
const finishDoNotDisturbMinutes = getMinutes(config.finishDoNotDisturbISO);
const resumeWorkReminderDeleteTimeout = getMilliseconds(
  config.resumeWorkReminderDeleteDurationISO
);

interface AddReminderResponse extends WebAPICallResult {
  ok: boolean;
  reminder: {
    id: string;
    creator?: string;
    user?: string;
    text?: string;
    recurring?: boolean;
    time?: number;
    complete_ts?: number;
  };
}

async function addReminder(
  slackWebClient: WebClient,
  message: string,
  date: number
) {
  return slackWebClient.reminders.add({
    text: message,
    time: date
  });
}

async function deleteReminder(slackWebClient: WebClient, id: string) {
  return slackWebClient.reminders.delete({ reminder: id });
}

async function sendMessage(
  slackWebClient: WebClient,
  channel: string,
  message: string
) {
  return slackWebClient.chat.postMessage({
    channel: channel,
    text: message
  });
}

async function setDoNotDisturb(slackWebClient: WebClient, minutes: number) {
  return slackWebClient.dnd.setSnooze({ num_minutes: minutes });
}

async function scheduleMessage(
  slackWebClient: WebClient,
  channel: string,
  message: string,
  date: number
) {
  return slackWebClient.chat.scheduleMessage({
    channel: channel,
    text: message,
    post_at: date.toString()
  });
}

async function setStatus(
  slackWebClient: WebClient,
  text: string,
  emoji: string,
  expirationDate: number
) {
  const status = {
    status_text: text,
    status_emoji: emoji,
    status_expiration: expirationDate
  };

  return slackWebClient.users.profile.set({
    profile: JSON.stringify(status)
  });
}

let isLunching = false;

async function beginLunch() {
  if (isLunching) {
    console.log("I am already lunching.");
    return;
  }

  console.log("Start lunch.");
  isLunching = true;

  const finishLunchDate = getEpochByNow(config.finishLunchDurationISO);
  const resumeWorkReminderDate = getEpochByNow(
    config.resumeWorkReminderDurationISO
  );

  logMinutes(finishDoNotDisturbMinutes, "finish do not disturb minutes");
  logEpoch(resumeWorkReminderDate, "resume work reminder date");
  logEpoch(finishLunchDate, "finish lunch date");
  logTimeout(finishLunchTimeout, "finish lunch timeout");
  logTimeout(
    resumeWorkReminderDeleteTimeout,
    "resume work reminder delete timeout"
  );

  const slackWebClient = new WebClient(token);

  const sendMessagePromise = sendMessage(slackWebClient, channel, lunchMessage);

  const setStatusPromise = setStatus(
    slackWebClient,
    lunchStatusMessage,
    lunchStatusEmoji,
    finishLunchDate
  );

  const setDoNotDisturbPromise = setDoNotDisturb(
    slackWebClient,
    finishDoNotDisturbMinutes
  );

  const scheduleMessagePromise = scheduleMessage(
    slackWebClient,
    channel,
    finishLunchMessage,
    finishLunchDate
  );

  await Promise.all([
    sendMessagePromise,
    setStatusPromise,
    setDoNotDisturbPromise,
    scheduleMessagePromise
  ]);

  const resumeWorkReminderResponse = (await addReminder(
    slackWebClient,
    resumeWorkReminderMessage,
    resumeWorkReminderDate
  )) as AddReminderResponse;

  const resumeWorkReminderId = resumeWorkReminderResponse.reminder.id;

  // TODO: this is not being triggered due to the Heroku's idling state
  setTimeout(() => {
    deleteReminder(slackWebClient, resumeWorkReminderId);
  }, resumeWorkReminderDeleteTimeout);

  setTimeout(() => {
    isLunching = false;
  }, finishLunchTimeout);
}

export { beginLunch };
