import { createLogger, format, transports } from "winston";
import { getRFC2822FromEpoch, getRFC2822ByNowFromMillis } from "./datetime";

const serviceName = require("../package.json").name;

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: serviceName },
  transports: [new transports.Console()]
});

function logEpoch(epoch: number, epochName: string) {
  const rfc2822String = getRFC2822FromEpoch(epoch);

  logger.info(`${rfc2822String} - ${epochName}`);
}

function logMinutes(minutes: number, eventName: string) {
  const millis = minutes * 60 * 1000;

  const rfc2822String = getRFC2822ByNowFromMillis(millis);

  logger.info(`${rfc2822String} - ${eventName}`);
}

export { logger, logEpoch, logMinutes };
