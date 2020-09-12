import { WebClient, WebAPICallResult } from "@slack/web-api";
import { getDateByDuration, getMinutes } from "./datetime";
import { logEpoch, logMinutes } from "./logger";
import config from "../config";
import database from "./database";

// TODO: internationalize messages
const token = config.slackToken;
const channel = config.slackChannel;

const lunchMessage = "vou almoçar! 🍛";
const finishLunchMessage = "voltei do almoço";
const resumeWorkReminderMessage = "voltar a trabalhar!";
const lunchStatusMessage = "almoçando";
const lunchStatusEmoji = "🍛";

const finishDoNotDisturbMinutes = getMinutes(config.finishDoNotDisturbISO);

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
  }) as Promise<AddReminderResponse>;
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

async function getIsLunching(startDate: Date) {
  const lunches = await database.getLunchByStartDate(startDate);

  return lunches.length > 0;
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

async function beginLunch() {
  const startLunchDate = new Date();

  const isLunching = await getIsLunching(startLunchDate);

  if (isLunching) {
    console.log("I am already lunching.");
    return;
  }

  console.log("Start lunch.");

  const { date: finishLunchDate, epoch: finishLunchEpoch } = getDateByDuration(
    startLunchDate,
    config.finishLunchDurationISO
  );
  const {
    date: resumeWorkReminderDate,
    epoch: resumeWorkReminderEpoch
  } = getDateByDuration(startLunchDate, config.resumeWorkReminderDurationISO);

  const lunchId = await database.saveLunch(startLunchDate, finishLunchDate);

  logMinutes(finishDoNotDisturbMinutes, "finish do not disturb minutes");
  logEpoch(resumeWorkReminderEpoch, "resume work reminder date");
  logEpoch(finishLunchEpoch, "finish lunch date");

  const slackWebClient = new WebClient(token);

  const sendMessagePromise = sendMessage(slackWebClient, channel, lunchMessage);

  const setStatusPromise = setStatus(
    slackWebClient,
    lunchStatusMessage,
    lunchStatusEmoji,
    finishLunchEpoch
  );

  const setDoNotDisturbPromise = setDoNotDisturb(
    slackWebClient,
    finishDoNotDisturbMinutes
  );

  const scheduleMessagePromise = scheduleMessage(
    slackWebClient,
    channel,
    finishLunchMessage,
    finishLunchEpoch
  );

  const resumeWorkReminderPromise = addReminder(
    slackWebClient,
    resumeWorkReminderMessage,
    resumeWorkReminderEpoch
  );

  const [resumeWorkReminderResponse] = await Promise.all([
    resumeWorkReminderPromise,
    sendMessagePromise,
    setStatusPromise,
    setDoNotDisturbPromise,
    scheduleMessagePromise
  ]);

  const resumeWorkReminderId = resumeWorkReminderResponse.reminder.id;

  await database.saveLunchReminder(
    lunchId,
    resumeWorkReminderId,
    resumeWorkReminderDate
  );
}

export { beginLunch };
