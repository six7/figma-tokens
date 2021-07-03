import convertOpacityToFigma from './opacity';

describe('convertOpacityToFigma', () => {
    it('converts opacity input to figma readable output', () => {
        const opacityPercent = convertOpacityToFigma('50%');
        expect(opacityPercent).toBe(0.5);
        const opacityNumber = convertOpacityToFigma('0.3');
        expect(opacityNumber).toBe(0.3);
    });
});
