import {getConnectionOptions} from "typeorm";
import * as moment from "moment";

export function shuffledArray<T>(array: T[]): T[] {

    const a = [...array];

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export async function formatDateSQL(date: moment.Moment | Date): Promise<string> {

    const unix = date instanceof Date ? (date.getTime() / 1000).toFixed(0) : date.unix();

    return (await getConnectionOptions()).type === "sqlite" ? `datetime(${unix}, "unixepoch")` : `FROM_UNIXTIME(${unix})`;
}

export async function formatRandomSQL(): Promise<string> {
    return (await getConnectionOptions()).type === "sqlite" ? `RANDOM()` : `RAND()`;
}

export function formatDuration(duration: moment.Duration): string {

    const units: moment.unitOfTime.Base[] = ["months", "days", "hours", "minutes", "seconds"];
    const formatNames: string[] = ["m", "j", "h", "m", "s"];

    //Biggest non zero unit
    //Example: 0 months 10 days 0 hours 0 minutes 4 seconds -> days
    const biggestUnitIndex = (() => {
        for (let i = 0; i < units.length; i++) {
            let unit = units[i];
            if (duration.get(unit) > 0) {
                return i;
            }
        }
    })();

    //Construct string
    let result = "";

    for (let i = biggestUnitIndex; i < units.length; i++) {
        result += `${duration.get(units[i])}${formatNames[i]}`;
    }

    return result;


}
