import * as moment from "moment";

export function shuffledArray<T>(array: T[]): T[] {

    const a = [...array];

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function formatDatetimeSQL(date: moment.Moment | Date): string {
   const momentDate = date instanceof Date ? moment(date) : date;

   return momentDate.format("YYYY-MM-DD HH:mm:ss");
}
