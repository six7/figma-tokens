import {mapValuesToTokens, returnValueToLookFor} from './node';

describe('mapValuesToTokens', () => {
    it('maps values to tokens', () => {
        const tokens = [{name: 'global.colors.blue', value: '#0000ff'}];

        const values = {fill: 'global.colors.blue'};
        expect(mapValuesToTokens(tokens, values)).toEqual({
            fill: '#0000ff',
        });
    });
});

describe('returnValueToLookFor', () => {
    it('returns value that were looking for', () => {
        const tokens = [
            {
                key: 'tokenName',
                input: {
                    description: 'my description',
                    value: '#ff0000',
                    name: 'colors.red.500',
                },
                output: 'name',
            },
            {
                key: 'description',
                input: {
                    description: 'my description',
                    value: '#ff0000',
                    name: 'colors.red.500',
                },
                output: 'description',
            },
            {
                key: 'tokenValue',
                input: {
                    description: 'my description',
                    value: '#ff0000',
                    name: 'colors.red.500',
                },
                output: 'rawValue',
            },
            {
                key: 'tokenValue',
                input: '#ff0000',
                output: 'rawValue',
            },
            {
                key: 'size',
                input: {
                    description: 'my description',
                    value: '12',
                    name: 'sizing.small',
                },
                output: 'value',
            },
        ];
        tokens.forEach((token) => {
            expect(returnValueToLookFor(token.key)).toEqual(token.output);
        });
    });
});
