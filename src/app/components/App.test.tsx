import React from 'react';
import {render, fireEvent, resetStore} from '../../../tests/config/setupTest';
import App from './App';

describe('App', () => {
    beforeEach(() => {
        resetStore();
    });

    it('displays loading indicator on startup', () => {
        const {getByText} = render(<App />);
        const LoadingText = getByText('Hold on, updating...');
        expect(LoadingText).toBeInTheDocument();
    });

    it('doesnt display loading indicator when values received', () => {
        const {getByText} = render(<App />);
        const LoadingText = getByText('Hold on, updating...');
        fireEvent(window, new MessageEvent('message', {data: {pluginMessage: {type: 'tokenvalues'}}}));
        expect(LoadingText).not.toBeInTheDocument();
    });

    it('calls setTokenData when received values', () => {
        const {getByText} = render(<App />);
        fireEvent(
            window,
            new MessageEvent('message', {
                data: {
                    pluginMessage: {
                        type: 'tokenvalues',
                        values: {version: '5', values: {options: JSON.stringify({sizing: {xs: 4}}, null, 2)}},
                    },
                },
            })
        );
        const TokensText = getByText('Sizing');

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
