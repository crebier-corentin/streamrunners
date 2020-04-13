import { CaseContentEntity } from './case-content.entity';

describe('CaseContentEntity', () => {
    describe('color', () => {
        it.each([
            ['#ffd700', 1, 19],
            ['#cf0a1d', 20, 30],
            ['#2e006c', 31, 150],
            ['#33cc33', 151, 250],
            ['#0066ff', 251, 1000],
        ])('should return %s for range %i - %i', (expected, min, max) => {
            for (let chance = min; chance <= max; chance++) {
                const content = new CaseContentEntity();
                content.chance = chance;

                expect(content.color).toBe(expected);
            }
        });
    });
});
