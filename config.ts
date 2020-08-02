interface ProcessEnv extends NodeJS.ProcessEnv {
  FINISH_DO_NOT_DISTURB_ISO: string;
  FINISH_LUNCH_DURATION_ISO: string;
  RESUME_WORK_REMINDER_DURATION_ISO: string;
  RESUME_WORK_REMINDER_DELETE_DURATION_ISO: string;
  SLACK_CHANNEL: string;
  SLACK_TOKEN: string;
}

const {
  FINISH_DO_NOT_DISTURB_ISO: finishDoNotDisturbISO,
  FINISH_LUNCH_DURATION_ISO: finishLunchDurationISO,
  RESUME_WORK_REMINDER_DURATION_ISO: resumeWorkReminderDurationISO,
  RESUME_WORK_REMINDER_DELETE_DURATION_ISO: resumeWorkReminderDeleteDurationISO,
  SLACK_CHANNEL: slackChannel,
  SLACK_TOKEN: slackToken
} = process.env as ProcessEnv;

export default {
  finishDoNotDisturbISO,
  finishLunchDurationISO,
  resumeWorkReminderDurationISO,
  resumeWorkReminderDeleteDurationISO,
  slackChannel,
  slackToken
};
