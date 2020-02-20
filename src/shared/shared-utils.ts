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
    const func = (): void => {
        callback()
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setTimeout(func, ms);
            });
    };

    func();
}
