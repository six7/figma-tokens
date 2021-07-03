import convertToTokenArray from './convertTokens';

describe('convertToTokenArray', () => {
    it('converts given tokens to an array', () => {
        const typographyTokens = {
            basic: {
                input: {
                    fontFamily: 'Inter',
                    fontWeight: 'Bold',
                    fontSize: 36,
                    description: 'Use for bold headings',
                },
                output: {
                    value: {
                        fontFamily: 'Inter',
                        fontWeight: 'Bold',
                        fontSize: 36,
                    },
                    description: 'Use for bold headings',
                    type: 'typography',
                },
            },
            withValue: {
                input: {
                    value: {
                        fontFamily: 'Inter',
                        fontWeight: 'Regular',
                        fontSize: 24,
                    },
                    description: 'Use for headings',
                },
                output: {
                    value: {
                        fontFamily: 'Inter',
                        fontWeight: 'Regular',
                        fontSize: 24,
                    },
                    description: 'Use for headings',
                },
            },
        };
        const basicTokens = {
            global: {
                withValue: {
                    value: 'bar',
                },
                basic: '#ff0000',
                typography: {
                    heading: {
                        h1: typographyTokens.basic.input,
                        h2: typographyTokens.withValue.input,
                    },
                },
            },
        };

        expect(convertToTokenArray({tokens: basicTokens})).toEqual([
            ['global.withValue', {value: 'bar'}],
            ['global.basic', {value: '#ff0000'}],
            ['global.typography.heading.h1', typographyTokens.basic.output],
            ['global.typography.heading.h2', typographyTokens.withValue.output],
        ]);
    });
});
