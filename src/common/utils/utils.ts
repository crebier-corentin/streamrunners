import { AxiosError } from 'axios';
import * as moment from 'moment';

/**
 * @param array Array to shuffle
 *
 * @returns Shuffled copy of the array
 */
export function shuffledArray<T>(array: T[]): T[] {
    const a = [...array];

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * @param date Datetime to format
 *
 * @returns Formatted datetime string that mysql understands.
 */
export function formatDatetimeSQL(date: moment.Moment | Date): string {
    const momentDate = date instanceof Date ? moment(date) : date;

    return momentDate.utc().format('YYYY-MM-DD HH:mm:ss');
}

/**
 * @returns true if error is an AxiosError, else returns false.
 */
export function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true; //isAxiosError could be undefined
}

/**
 *
 * Used to prevent XSS attacks.
 *
 * @param str String to escape
 *
 * @returns Replace html syntax characters with their encoded representation.
 */
export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
