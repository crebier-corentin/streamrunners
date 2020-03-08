import { duplicatedArray, formatDatetimeSQL, shuffledArray } from './utils';
import moment = require('moment');

describe('shuffledArray', () => {
    beforeEach(() => {
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.942)
            .mockReturnValueOnce(0.569)
            .mockReturnValueOnce(0.3)
            .mockReturnValueOnce(0.24)
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.02874)
            .mockReturnValueOnce(0.8956)
            .mockReturnValueOnce(0.3654)
            .mockReturnValueOnce(0.384)
            .mockReturnValueOnce(0.317)
            .mockReturnValueOnce(0.63);
    });

    it.each([
        [[], []], //empty
        [
            [1, 2],
            [1, 2],
        ],
        [
            ['a', 'b', 'c'],
            ['c', 'a', 'b'],
        ],
        [
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            [8, 6, 4, 5, 2, 10, 7, 9, 1, 3],
        ],
    ])('should shuffle the array randomly (%j -> %j)', (arr: any[], expected: any[]) => {
        expect(shuffledArray(arr)).toEqual(expected);
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

describe('formatDatetimeSQL', () => {
    it('should convert a js Date to UTC and format it for a sql query', () => {
        const date = new Date('2011-12-03T10:15:30+01:00');
        expect(formatDatetimeSQL(date)).toEqual('2011-12-03 09:15:30');
    });

    it('should convert a moment Date to UTC and format it for a sql query', () => {
        const date = moment('2011-12-03T10:15:30+01:00');
        expect(formatDatetimeSQL(date)).toEqual('2011-12-03 09:15:30');
    });
});
