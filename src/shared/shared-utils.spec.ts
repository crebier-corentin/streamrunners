import * as moment from 'moment';
import { formatDuration, sleep } from './shared-utils';

describe('formatDuration', () => {
    it.each([
        [
            moment.duration({
                seconds: 2,
                minutes: 2,
                hours: 2,
                days: 2,
                months: 2,
            }),
            '2m2j2h2m2s',
        ],
        [
            moment.duration({
                seconds: 2,
                minutes: 2,
                hours: 0,
                days: 2,
                months: 0,
            }),
            '2j0h2m2s',
        ],
        [
            moment.duration({
                seconds: 45,
                minutes: 0,
                hours: 0,
                days: 0,
                months: 0,
            }),
            '45s',
        ],
    ])('should format the duration', (duration: moment.Duration, expected) => {
        expect(formatDuration(duration)).toBe(expected);
    });
});

describe('sleep', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    it.each([1000, 2000, 5000])('should sleep for %i ms seconds', async ms => {
        const promise = sleep(ms);

        jest.runAllTimers();

        await promise;

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), ms);
    });
});
