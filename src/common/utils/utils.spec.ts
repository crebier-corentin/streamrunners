import { AxiosError } from 'axios';
import moment = require('moment');
import { escapeHtml, formatDatetimeSQL, isAxiosError, shuffledArray } from './utils';

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

describe('isAxiosError', () => {
    it('should return true if error is an AxiosError', () => {
        const error: AxiosError = {
            name: '',
            message: '',
            config: {},
            isAxiosError: true,
            toJSON: jest.fn(),
        };

        expect(isAxiosError(error)).toBe(true);
    });

    it('should return true if error is not an AxiosError', () => {
        const error = {
            name: 'unrelated',
            message: 'test',
        };

        expect(isAxiosError(error)).toBe(false);
    });
});

describe('escapeHtml', () => {
    it('should escape ampersand, brackets and quotes', () => {
        expect(escapeHtml('<script src="evil.js"></script> \'&')).toBe(
            '&lt;script src=&quot;evil.js&quot;&gt;&lt;/script&gt; &#039;&amp;'
        );
    });
});
