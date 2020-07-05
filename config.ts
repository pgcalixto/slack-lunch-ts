interface ProcessEnv extends NodeJS.ProcessEnv {
  FINISH_LUNCH_DURATION_ISO: string,
  RESUME_WORK_REMINDER_DURATION_ISO: string,
  RESUME_WORK_REMINDER_DELETE_DURATION_ISO: string,
  SLACK_TOKEN: string
}

const {
  FINISH_LUNCH_DURATION_ISO: finishLunchDurationISO,
  RESUME_WORK_REMINDER_DURATION_ISO: resumeWorkReminderDurationISO,
  RESUME_WORK_REMINDER_DELETE_DURATION_ISO: resumeWorkReminderDeleteDurationISO,
  SLACK_TOKEN: slackToken
} = process.env as ProcessEnv;

export default {
  finishLunchDurationISO,
  resumeWorkReminderDurationISO,
  resumeWorkReminderDeleteDurationISO,
  slackToken
};
