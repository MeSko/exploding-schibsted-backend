import { Service } from "typedi";
import debug from "debug";

export const logger = debug("API");
export const loggerInfo = debug("APIA:info");
export const loggerError = debug("API:error");

@Service()
export class Logger {
    constructor(private requestId: number) {}

    log(namespace: string, formatter: string, ...messages: any[]) {
        if (this.requestId) {
            logger.extend(namespace)(`RequestId-%d ${formatter}`, this.requestId, ...messages);
        } else {
            logger.extend(namespace)(formatter, ...messages);
        }
    }
}
