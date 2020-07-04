import { WebClient, WebAPICallResult } from "@slack/web-api";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const channel = "#canal-pessoal-calixto";
const lunchMessage = "vou almoçar! 🍛";
const finishLunchMessage = "voltei do almoço";
const finishLunchMessageDate = Math.round(
  (new Date().getTime() + 1 * HOUR) / 1000
);

const resumeWorkMessage = "voltar a trabalhar!";
const resumeWorkMessageDate = Math.round(
  (new Date().getTime() + 1 * HOUR - 5 * MINUTE) / 1000
);
const resumeWorkMessageDeleteTimeout =
  finishLunchMessageDate * 1000 - new Date().getTime() + 10 * MINUTE;

const lunchStatusMessage = "almoçando";
const lunchStatusEmoji = "🍛";
const lunchStatusExpirationDate = Math.round(
  (new Date().getTime() + 1 * HOUR - 10 * MINUTE) / 1000
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

async function main() {
  const token = process.env.SLACK_TOKEN;

  const slackWebClient = new WebClient(token);

  sendMessage(slackWebClient, channel, lunchMessage);

  setStatus(
    slackWebClient,
    lunchStatusMessage,
    lunchStatusEmoji,
    lunchStatusExpirationDate
  );

  scheduleMessage(
    slackWebClient,
    channel,
    finishLunchMessage,
    finishLunchMessageDate
  );

  const resumeWorkReminderResponse: AddReminderResponse = await addReminder(
    slackWebClient,
    resumeWorkMessage,
    resumeWorkMessageDate
  ) as AddReminderResponse;

  const resumeWorkReminderId = resumeWorkReminderResponse.reminder.id;

  setTimeout(() => {
    deleteReminder(slackWebClient, resumeWorkReminderId);
  }, resumeWorkMessageDeleteTimeout);
}

main();
