import * as moment from 'moment';

export function formatDuration(duration: moment.Duration): string {
    const values: number[] = [
        duration.months(),
        duration.days(),
        duration.hours(),
        duration.minutes(),
        duration.seconds(),
    ];
    const formatNames: string[] = ['m', 'j', 'h', 'm', 's'];

    //Biggest non zero unit
    //Example: 0 months 10 days 0 hours 0 minutes 4 seconds -> days
    const biggestUnitIndex = ((): number => {
        for (let i = 0; i < values.length; i++) {
            if (values[i] > 0) {
                return i;
            }
        }
    })();

    //Construct string
    let result = '';

    for (let i = biggestUnitIndex; i < values.length; i++) {
        result += `${values[i]}${formatNames[i]}`;
    }

    return result;
}

export function intervalWait(ms: number, callback: () => Promise<unknown>): void {
    const func = async (): Promise<void> => {
        try {
            await callback();
        } catch (err) {
            console.error(err);
        } finally {
            setTimeout(func, ms);
        }
    };

    func();
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * In javascript, the % operator is actually the remainder operator, this function provides the actual modulo operation.
 *
 * @example    (-5 % 7) -> -5
 * @example mod(-5, 7)  ->  2
 */
export function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

export function duplicatedArray<T>(array: T[], amount: number): T[] {
    return new Array(amount).fill(array).flat();
}
