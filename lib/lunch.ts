import { WebClient, WebAPICallResult } from "@slack/web-api";
const luxon = require("luxon");

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const now = luxon.DateTime.utc();

// TODO: internationalize messages
const channel = "#canal-pessoal-calixto";
const lunchMessage = "vou almoçar! 🍛";
const finishLunchMessage = "voltei do almoço";
const finishLunchMessageDurationISO = "PT50M";
const finishLunchMessageDuration = luxon.Duration.fromISO(
  finishLunchMessageDurationISO
);
const finishLunchMessageDate = now.plus(finishLunchMessageDuration);
const finishLunchMessageDateEpoch = Math.round(
  finishLunchMessageDate.toSeconds()
);

// TODO: change "message" to "reminder"
const resumeWorkMessage = "voltar a trabalhar!";
const resumeWorkMessageDurationISO = "PT55M";
const resumeWorkMessageDuration = luxon.Duration.fromISO(
  resumeWorkMessageDurationISO
);
const resumeWorkMessageDate = now.plus(resumeWorkMessageDuration);
const resumeWorkMessageDateEpoch = Math.round(
  resumeWorkMessageDate.toSeconds()
);

const resumeWorkMessageDeleteDurationISO = "PT10M";
const resumeWorkMessageDeleteDuration = luxon.Duration.fromISO(
  resumeWorkMessageDeleteDurationISO
);
const resumeWorkMessageDeleteTimeout = resumeWorkMessageDeleteDuration.as(
  "millisecond"
);

const lunchStatusMessage = "almoçando";
const lunchStatusEmoji = "🍛";
const lunchStatusExpirationDurationISO = "PT50M";
const lunchStatusExpirationDuration = luxon.Duration.fromISO(
  lunchStatusExpirationDurationISO
);
const lunchStatusExpirationDate = now.plus(lunchStatusExpirationDuration);
const lunchStatusExpirationDateEpoch = Math.round(
  lunchStatusExpirationDate.toSeconds()
);

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

  const token = process.env.SLACK_TOKEN;

  const slackWebClient = new WebClient(token);

  sendMessage(slackWebClient, channel, lunchMessage);

  setStatus(
    slackWebClient,
    lunchStatusMessage,
    lunchStatusEmoji,
    lunchStatusExpirationDateEpoch
  );

  scheduleMessage(
    slackWebClient,
    channel,
    finishLunchMessage,
    finishLunchMessageDateEpoch
  );

  const resumeWorkReminderResponse: AddReminderResponse = await addReminder(
    slackWebClient,
    resumeWorkMessage,
    resumeWorkMessageDateEpoch
  ) as AddReminderResponse;

  const resumeWorkReminderId = resumeWorkReminderResponse.reminder.id;

  setTimeout(() => {
    deleteReminder(slackWebClient, resumeWorkReminderId);
  }, resumeWorkMessageDeleteTimeout);

  setTimeout(() => {
    isLunching = false
  }, 1 * HOUR); // TODO: move timeout value to constant
}

export {
  beginLunch
};
