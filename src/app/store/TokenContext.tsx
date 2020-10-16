import * as React from 'react';
import JSON5 from 'json5';
import {defaultJSON} from '../presets/default';
import TokenData, {TokenProps} from '../components/TokenData';
import * as pjs from '../../../package.json';

export interface SelectionValue {
    borderRadius: string | undefined;
    horizontalPadding: string | undefined;
    verticalPadding: string | undefined;
    itemSpacing: string | undefined;
}

const TokenContext = React.createContext(null);

const defaultTokens: TokenProps = {
    version: pjs.version,
    values: {
        options: JSON5.stringify(defaultJSON(), null, 2),
    },
};

const emptyTokens: TokenProps = {
    version: pjs.version,
    values: {
        options: '{ }',
    },
};

const defaultState = {
    tokens: defaultTokens,
    loading: true,
    tokenData: new TokenData(defaultTokens),
    selectionValues: {},
    displayType: 'GRID',
    colorMode: false,
};

const emptyState = {
    tokens: defaultTokens,
    loading: true,
    tokenData: new TokenData(emptyTokens),
    selectionValues: {},
    displayType: 'GRID',
    colorMode: false,
};

function stateReducer(state, action) {
    switch (action.type) {
        case 'SET_TOKEN_DATA':
            return {
                ...state,
                tokenData: action.data,
            };
        case 'SET_DEFAULT_TOKENS':
            state.tokenData.setTokens(defaultTokens);
            return state;
        case 'SET_EMPTY_TOKENS':
            return emptyState;
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.state,
            };
        case 'SET_STRING_TOKENS':
            state.tokenData.updateTokenValues(action.data.parent, action.data.tokens);
            return {
                ...state,
                tokens: {
                    ...state.tokens,
                    [action.data.parent]: {
                        hasErrored: state.tokenData.checkTokenValidity(action.data.tokens),
                        values: action.data.tokens,
                    },
                },
            };
        case 'UPDATE_TOKENS':
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'update',
                        tokenValues: state.tokenData.reduceToValues(),
                        tokens: state.tokenData.getMergedTokens(),
                    },
                },
                '*'
            );
            return state;
        case 'CREATE_STYLES':
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'create-styles',
                        tokens: state.tokenData.getMergedTokens(),
                    },
                },
                '*'
            );
            return state;
        case 'SET_NODE_DATA':
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'set-node-data',
                        values: {
                            ...state.selectionValues,
                            ...action.data,
                        },
                        tokens: state.tokenData.getMergedTokens(),
                    },
                },
                '*'
            );
            return state;
        case 'UPDATE_TOKEN_SHEET':
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'update-token-sheet',
                        tokens: state.tokenData.getMergedTokens(),
                    },
                },
                '*'
            );
            return state;
        case 'REMOVE_NODE_DATA':
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'remove-node-data',
                    },
                },
                '*'
            );
            return state;

        case 'SET_SELECTION_VALUES':
            return {
                ...state,
                selectionValues: {
                    ...state.selectionValues,
                    ...action.data,
                },
            };
        case 'RESET_SELECTION_VALUES':
            return {
                ...state,
                selectionValues: {},
            };
        case 'SET_SHOW_EDIT_FORM':
            return {
                ...state,
                showEditForm: action.bool,
            };
        case 'SET_SHOW_OPTIONS':
            return {
                ...state,
                showOptions: action.data,
            };
        case 'SET_DISPLAY_TYPE':
            return {
                ...state,
                displayType: action.data,
            };
        case 'TOGGLE_COLOR_MODE':
            return {
                ...state,
                colorMode: !state.colorMode,
            };
        default:
            throw new Error('Not implemented');
    }
}

function TokenProvider({children}) {
    const [state, dispatch] = React.useReducer(stateReducer, defaultState);

    const tokenContext = React.useMemo(
        () => ({
            state,
            setTokens: (tokens) => {
                dispatch({type: 'SET_TOKENS', tokens});
            },
            setTokenData: (data: TokenData) => {
                dispatch({type: 'SET_TOKEN_DATA', data});
            },
            setStringTokens: (data: {parent: string; tokens: string}) => {
                dispatch({type: 'SET_STRING_TOKENS', data});
            },
            setDefaultTokens: () => {
                dispatch({type: 'SET_DEFAULT_TOKENS'});
                dispatch({type: 'SET_LOADING', state: false});
            },
            setEmptyTokens: () => {
                dispatch({type: 'SET_EMPTY_TOKENS'});
                dispatch({type: 'SET_LOADING', state: false});
            },
            updateTokens: () => {
                dispatch({type: 'UPDATE_TOKENS'});
            },
            createStyles: () => {
                dispatch({type: 'CREATE_STYLES'});
            },
            setLoading: (boolean) => {
                dispatch({type: 'SET_LOADING', state: boolean});
            },
            setNodeData: (data: SelectionValue) => {
                dispatch({type: 'SET_LOADING', state: true});
                dispatch({type: 'SET_NODE_DATA', data});
            },
            removeNodeData: (data: SelectionValue) => {
                dispatch({type: 'SET_LOADING', state: true});
                dispatch({type: 'REMOVE_NODE_DATA', data});
            },
            setSelectionValues: (data: SelectionValue) => {
                dispatch({type: 'SET_SELECTION_VALUES', data});
            },
            resetSelectionValues: () => {
                dispatch({type: 'RESET_SELECTION_VALUES'});
            },
            setShowEditForm: (bool: boolean) => {
                dispatch({type: 'SET_SHOW_EDIT_FORM', bool});
            },
            setShowOptions: (data: string) => {
                dispatch({type: 'SET_SHOW_OPTIONS', data});
            },
            setDisplayType: (data: string) => {
                dispatch({type: 'SET_DISPLAY_TYPE', data});
            },
            toggleColorMode: () => {
                dispatch({type: 'TOGGLE_COLOR_MODE'});
            },
            updateTokenSheet: () => {
                dispatch({type: 'UPDATE_TOKEN_SHEET'});
            },
        }),
        [state]
    );

    return <TokenContext.Provider value={tokenContext}>{children}</TokenContext.Provider>;
}

function useTokenState() {
    const context = React.useContext(TokenContext);
    if (context === undefined) {
        throw new Error('useTokenState must be used within a TokenProvider');
    }
    return context;
}

export {TokenProvider, useTokenState, TokenContext};
