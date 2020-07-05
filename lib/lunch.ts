import { WebClient, WebAPICallResult } from "@slack/web-api";
import { getEpoch, getMilliseconds } from "./datetime";
import config from "../config";

const now = new Date();

// TODO: internationalize messages
const channel = "#canal-pessoal-calixto";
const lunchMessage = "vou almoçar! 🍛";

const finishLunchMessage = "voltei do almoço";
const finishLunchDate = getEpoch(now, config.finishLunchDurationISO);
const finishLunchTimeout = getMilliseconds(config.finishLunchDurationISO);

// TODO: change "message" to "reminder"
const resumeWorkMessage = "voltar a trabalhar!";
const resumeWorkDate = getEpoch(now,config.resumeWorkReminderDurationISO);
const resumeWorkMessageDeleteTimeout = getMilliseconds(
  config.resumeWorkReminderDeleteDurationISO
);

const lunchStatusMessage = "almoçando";
const lunchStatusEmoji = "🍛";

interface AddReminderResponse extends WebAPICallResult {
  ok: boolean,
  reminder: {
    id: string,
    creator?: string,
    user?: string,
    text?: string,
    recurring?: boolean,
    time?: number,
    complete_ts?: number
  }
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

  const token = config.slackToken;

  const slackWebClient = new WebClient(token);

  sendMessage(slackWebClient, channel, lunchMessage);

  // TODO: set do-not-disturb
  setStatus(
    slackWebClient,
    lunchStatusMessage,
    lunchStatusEmoji,
    finishLunchDate
  );

  scheduleMessage(slackWebClient, channel, finishLunchMessage, finishLunchDate);

  const resumeWorkReminderResponse: AddReminderResponse = await addReminder(
    slackWebClient,
    resumeWorkMessage,
    resumeWorkDate
  ) as AddReminderResponse;

  const resumeWorkReminderId = resumeWorkReminderResponse.reminder.id;

  setTimeout(() => {
    deleteReminder(slackWebClient, resumeWorkReminderId);
  }, resumeWorkMessageDeleteTimeout);

  setTimeout(() => {
    isLunching = false;
  }, finishLunchTimeout);
}

export {
  beginLunch
};
