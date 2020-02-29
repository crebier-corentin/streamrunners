import * as moment from 'moment';
import { formatDuration, intervalWait } from './shared-utils';

function flushPromises(): Promise<unknown> {
    jest.useRealTimers();
    const tmp = new Promise(resolve => setImmediate(resolve));
    jest.useFakeTimers();
    return tmp;
}

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

describe('intervalWait', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    it.each([1000, 2000, 5000])('should call the callback once and every %i ms', async ms => {
        const callback = jest.fn().mockResolvedValue('yay');
        intervalWait(ms, callback);

        expect(callback).toHaveBeenCalledTimes(1);

        await flushPromises();

        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), ms);

        jest.runAllTimers();

        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should log errors to the console', async () => {
        const spyError = jest.spyOn(global.console, 'error').mockImplementation();

        const callback = jest.fn().mockReturnValue(Promise.reject('oops'));
        intervalWait(1000, callback);

        expect(callback).toHaveBeenCalledTimes(1);

        await flushPromises();

        expect(spyError).toHaveBeenLastCalledWith('oops');
    });
});
