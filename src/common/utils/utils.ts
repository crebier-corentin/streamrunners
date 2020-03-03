import * as moment from 'moment';

export function shuffledArray<T>(array: T[]): T[] {
    const a = [...array];

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function duplicatedArray<T>(array: T[], amount: number): T[] {
    return new Array(amount).fill(array).flat();
}

export function formatDatetimeSQL(date: moment.Moment | Date): string {
    const momentDate = date instanceof Date ? moment(date) : date;

    return momentDate.utc().format('YYYY-MM-DD HH:mm:ss');
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
