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

export async function getDBType(): Promise<"mysql" | "sqlite"> {
    return (await getConnectionOptions()).type as "mysql" | "sqlite";
}

export async function formatDateSQL(date: moment.Moment | Date): Promise<string> {
    const unix = date instanceof Date ? (date.getTime() / 1000).toFixed(0) : date.unix();

    return await getDBType() === "sqlite" ? `datetime(${unix}, "unixepoch")` : `FROM_UNIXTIME(${unix})`;
}

export async function formatRandomSQL(): Promise<string> {
    return await getDBType() === "sqlite" ? `RANDOM()` : `RAND()`;
}


