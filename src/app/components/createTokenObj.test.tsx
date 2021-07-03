import {createTokensObject} from './createTokenObj';

const baseTokens = {
    input: [
        {id: '123', type: 'color', description: 'some color', name: 'global.colors.gray.500', value: '#ff0000'},
        {id: '123', type: 'color', description: 'some color', name: 'global.colors.gray.400', value: '#ff0000'},
        {
            id: '123',
            type: 'color',
            description: 'some color',
            name: 'theme.colors.interaction.background.default',
            value: '#ff0000',
        },
        {
            id: '123',
            type: 'color',
            description: 'some color',
            name: 'global.colors.gray.50',
            value: '#ff0000',
        },
    ],
    output: {
        color: {
            values: {
                global: {
                    colors: {
                        gray: {
                            '50': {
                                id: '123',
                                type: 'color',
                                description: 'some color',
                                name: 'global.colors.gray.50',
                                value: '#ff0000',
                            },
                            '400': {
                                id: '123',
                                type: 'color',
                                description: 'some color',
                                name: 'global.colors.gray.400',
                                value: '#ff0000',
                            },
                            '500': {
                                id: '123',
                                type: 'color',
                                description: 'some color',
                                name: 'global.colors.gray.500',
                                value: '#ff0000',
                            },
                        },
                    },
                },
                theme: {
                    colors: {
                        interaction: {
                            background: {
                                default: {
                                    id: '123',
                                    type: 'color',
                                    description: 'some color',
                                    name: 'theme.colors.interaction.background.default',
                                    value: '#ff0000',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

describe('createTokenObj', () => {
    it('creates a token object', () => {
        expect(createTokensObject(baseTokens.input)).toEqual(baseTokens.output);
    });
});
