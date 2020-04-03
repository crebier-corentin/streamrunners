import * as moment from 'moment';
import { duplicatedArray, formatDuration, mod, randomIntFromInterval, sleep } from './shared-utils';

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

describe('mod', () => {
    it.each([
        [5, 11, 5],
        [11, 5, 1],
        [-5, 11, 6],
        [-11, 5, 4],
    ])('mod(%i, %i) should return %i', (n, m, expected) => {
        expect(mod(n, m)).toBe(expected);
    });
});

describe('duplicatedArray', () => {
    it.each([
        [0, []],
        [1, [1, 2]],
        [4, [1, 2, 1, 2, 1, 2, 1, 2]],
        [10, [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]],
    ])("should duplicate the array's content %i times", (amount: number, expected) => {
        expect(duplicatedArray([1, 2], amount)).toEqual(expected);
    });
});

describe('randomIntFromInterval', () => {
    it.each([
        [0, 100],
        [51, 8794],
        [-10, 10],
    ])('should return a number between %f and %f (test repeated 100 times)', (min: number, max) => {
        //Repeat to test randomness
        for (let i = 0; i < 100; i++) {
            const result = randomIntFromInterval(min, max);
            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
        }
    });
});
