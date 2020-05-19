import { AxiosError } from 'axios';
import * as moment from 'moment';

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

    return momentDate.utc().format('YYYY-MM-DD HH:mm:ss');
}

export function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true; //isAxiosError could be undefined
}

export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
