import React from 'react';
import {render, fireEvent, resetStore} from '../../../tests/config/setupTest';
import App from './App';

describe('App', () => {
    beforeEach(() => {
        resetStore();
    });

    it('calls setTokenData when received values', () => {
        const {getByText} = render(<App />);
        fireEvent(
            window,
            new MessageEvent('message', {
                data: {
                    pluginMessage: {
                        type: 'tokenvalues',
                        values: {
                            version: '5',
                            values: {
                                options: [
                                    {
                                        id: '123',
                                        type: 'sizing',
                                        description: 'some size',
                                        name: 'global.size.xs',
                                        value: '4',
                                    },
                                ],
                            },
                        },
                    },
                },
            })
        );
        const TokensText = getByText('Size');

        expect(TokensText).toBeInTheDocument();
    });

    it('shows welcome screen when no tokeeens are found', () => {
        const {getByText} = render(<App />);
        fireEvent(
            window,
            new MessageEvent('message', {
                data: {
                    pluginMessage: {
                        type: 'tokenvalues',
                    },
                },
            })
        );
        const WelcomeText = getByText('Welcome to Figma Tokens.');

        expect(WelcomeText).toBeInTheDocument();
    });
});
