import updateStyles from './updateStyles';
import * as updateColorStyles from './updateColorStyles';
import * as updateTextStyles from './updateTextStyles';

describe('updateStyles', () => {
    const colorSpy = jest.spyOn(updateColorStyles, 'default');
    const textSpy = jest.spyOn(updateTextStyles, 'default');

    it('returns if no values are given', () => {
        updateStyles([{name: 'borderRadius.small', value: '3', type: 'borderRadius'}]);
        expect(colorSpy).not.toHaveBeenCalled();
        expect(textSpy).not.toHaveBeenCalled();
    });

    it('calls update functions with correct tokens when all tokens are given', () => {
        const colorTokens = [
            {
                name: 'primary.500',
                value: '#ff0000',
                type: 'color',
            },
        ];

        const typographyTokens = [
            {
                name: 'heading.h1',
                value: {
                    fontFamily: 'Inter',
                    fontWeight: 'Regular',
                    fontSize: 24,
                },
                type: 'typography',
            },
        ];

        updateStyles([...typographyTokens, ...colorTokens]);
        expect(colorSpy).toHaveBeenCalledWith(
            colorTokens.map((t) => ({
                ...t,
                name: t.name.replace('.', '/'),
            })),
            false
        );
        expect(textSpy).toHaveBeenCalledWith(
            typographyTokens.map((t) => ({
                ...t,
                name: t.name.replace('.', '/'),
            })),
            false
        );
    });

    it('calls update functions with correct tokens for color tokens', () => {
        const colorTokens = [
            {
                name: 'primary.500',
                value: '#ff0000',
                type: 'color',
            },
        ];

        updateStyles(colorTokens);
        expect(colorSpy).toHaveBeenCalledWith(
            colorTokens.map((t) => ({
                ...t,
                name: t.name.replace('.', '/'),
            })),
            false
        );
        expect(textSpy).not.toHaveBeenCalled();
    });

    it('calls update functions with correct tokens for coltextor tokens', () => {
        const typographyTokens = [
            {
                name: 'heading.h1',
                value: {
                    fontFamily: 'Inter',
                    fontWeight: 'Regular',
                    fontSize: 24,
                },
                type: 'typography',
            },
        ];

        updateStyles(typographyTokens);
        expect(textSpy).toHaveBeenCalledWith(
            typographyTokens.map((t) => ({
                ...t,
                name: t.name.replace('.', '/'),
            })),
            false
        );
        expect(colorSpy).not.toHaveBeenCalled();
    });
});
