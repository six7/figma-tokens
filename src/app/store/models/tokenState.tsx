/* eslint-disable import/prefer-default-export */
import {createModel} from '@rematch/core';
import {SingleTokenObject, TokenGroup, SingleToken, TokenProps} from '@types/tokens';
import {StorageProviderType} from '@types/api';
import defaultJSON from '@/config/default.json';

import parseTokenValues from '@/utils/parseTokenValues';
import {notifyToUI} from '@/plugin/notifiers';
import {reduceToValues} from '@/plugin/tokenHelpers';
import {RootModel} from '.';
import updateTokensOnSources from '../updateSources';
import * as pjs from '../../../../package.json';

const defaultTokens: TokenProps = {
    version: pjs.plugin_version,
    updatedAt: new Date().toString(),
    values: defaultJSON,
};

type TokenInput = {
    name: string;
    parent: string;
    value: SingleToken;
    options: object;
};

type EditTokenInput = TokenInput & {
    oldName?: string;
};

type DeleteTokenInput = {parent: string; path: string};

export interface SelectionValue {
    borderRadius: string | undefined;
    horizontalPadding: string | undefined;
    verticalPadding: string | undefined;
    itemSpacing: string | undefined;
}

interface TokenState {
    tokens: TokenGroup;
    importedTokens: {
        newTokens: SingleTokenObject[];
        updatedTokens: SingleTokenObject[];
    };
    activeTokenSet: string;
    usedTokenSet: string[];
    editProhibited: boolean;
}

export const tokenState = createModel<RootModel>()({
    state: {
        tokens: {},
        importedTokens: {
            newTokens: [],
            updatedTokens: [],
        },
        activeTokenSet: 'global',
        usedTokenSet: ['global'],
        editProhibited: false,
    } as TokenState,
    reducers: {
        toggleUsedTokenSet: (state, data: string) => {
            return {
                ...state,
                usedTokenSet: state.usedTokenSet.includes(data)
                    ? state.usedTokenSet.filter((n) => n !== data)
                    : [...new Set([...state.usedTokenSet, data])],
            };
        },
        setActiveTokenSet: (state, data: string) => {
            return {
                ...state,
                activeTokenSet: data,
            };
        },
        addTokenSet: (state, name: string) => {
            if (name in state.tokens) {
                notifyToUI('Token set already exists');
                return state;
            }
            return {
                ...state,
                tokens: {
                    ...state.tokens,
                    [name]: {
                        type: 'array',
                        values: [],
                    },
                },
            };
        },
        deleteTokenSet: (state, data: string) => {
            const oldTokens = state.tokens;
            delete oldTokens[data];
            return {
                ...state,
                tokens: oldTokens,
                activeTokenSet: state.activeTokenSet === data ? Object.keys(state.tokens)[0] : state.activeTokenSet,
            };
        },
        renameTokenSet: (state, data: {oldName: string; newName: string}) => {
            // Handle add new token set
            const oldTokens = state.tokens;
            oldTokens[data.newName] = oldTokens[data.oldName];
            delete oldTokens[data.oldName];
            return {
                ...state,
                tokens: oldTokens,
                activeTokenSet: state.activeTokenSet === data.oldName ? data.newName : state.activeTokenSet,
            };
        },
        setTokenSetOrder: (state, data: string[]) => {
            // Handle reorder token set
            return state;
        },
        resetImportedTokens: (state) => {
            return {
                ...state,
                importedTokens: {
                    newTokens: [],
                    updatedTokens: [],
                },
            };
        },
        setTokenData: (state, data: {values: SingleTokenObject[]; shouldUpdate: boolean}) => {
            const values = parseTokenValues(data.values);
            return {
                ...state,
                tokens: values,
                activeTokenSet: Array.isArray(data.values) ? 'global' : Object.keys(data.values)[0],
                usedTokenSet: Array.isArray(data.values) ? ['global'] : [Object.keys(data.values)[0]],
            };
        },
        setJSONData(state, payload) {
            const parsedTokens = JSON.parse(payload);
            try {
                parseTokenValues(parsedTokens);
                const values = parseTokenValues({[state.activeTokenSet]: parsedTokens});
                return {
                    ...state,
                    tokens: {
                        ...state.tokens,
                        ...values,
                    },
                };
            } catch (e) {
                console.log('Error parsing tokens', e);
            }
            return state;
        },
        createToken: (state, data: TokenInput) => {
            let newTokens = {};
            const existingToken = state.tokens[data.parent].values.find((n) => n.name === data.name);
            if (!existingToken) {
                newTokens = {
                    [data.parent]: {
                        values: [
                            ...state.tokens[data.parent].values,
                            {
                                name: data.name,
                                value: data.value,
                                ...data.options,
                            },
                        ],
                    },
                };
            }
            return {
                ...state,
                tokens: {
                    ...state.tokens,
                    ...newTokens,
                },
            };
        },
        // Imports received styles as tokens, if needed
        setTokensFromStyles: (state, receivedStyles) => {
            const newTokens = [];
            const existingTokens = [];
            const updatedTokens = [];

            // Iterate over received styles and check if they existed before or need updating
            Object.entries(receivedStyles).map(([_parent, values]: [string, SingleTokenObject[]]) => {
                values.map((token: TokenGroup) => {
                    const oldValue = state.tokens[state.activeTokenSet].values.find((t) => t.name === token.name);
                    if (oldValue) {
                        if (oldValue.value.toUpperCase() === token.value.toUpperCase()) {
                            if (
                                oldValue.description === token.description ||
                                (typeof token.description === 'undefined' && oldValue.description === '')
                            ) {
                                existingTokens.push(token);
                            } else {
                                updatedTokens.push({
                                    ...token,
                                    oldDescription: oldValue.description,
                                });
                            }
                        } else {
                            updatedTokens.push({
                                ...token,
                                oldValue: oldValue.value,
                            });
                        }
                    } else {
                        newTokens.push(token);
                    }
                });
            });

            return {
                ...state,
                importedTokens: {
                    newTokens,
                    updatedTokens,
                },
            };
        },
        editToken: (state, data: EditTokenInput) => {
            const nameToFind = data.oldName ? data.oldName : data.name;
            const index = state.tokens[data.parent].values.findIndex((token) => token.name === nameToFind);
            const newArray = [...state.tokens[data.parent].values];
            newArray[index] = {
                ...newArray[index],
                name: data.name,
                value: data.value,
                ...data.options,
            };

            return {
                ...state,
                tokens: {
                    ...state.tokens,
                    [data.parent]: {
                        ...state.tokens[data.parent],
                        values: newArray,
                    },
                },
            };
        },
        deleteToken: (state, data: DeleteTokenInput) => {
            const newState = {
                ...state,
                tokens: {
                    ...state.tokens,
                    [data.parent]: {
                        ...state.tokens[data.parent],
                        values: state.tokens[data.parent].values.filter((token) => token.name !== data.path),
                    },
                },
            };

            return newState;
        },
    },
    effects: (dispatch) => ({
        setDefaultTokens: (payload) => {
            dispatch.tokenState.setTokenData({values: defaultTokens.values});
        },
        setEmptyTokens: (payload) => {
            dispatch.tokenState.setTokenData({values: []});
        },
        editToken(payload, rootState) {
            if (payload.shouldUpdate && rootState.settings.updateOnChange) {
                dispatch.tokenState.updateDocument();
            }
        },
        deleteToken() {
            dispatch.tokenState.updateDocument(false);
        },
        addTokenSet() {
            dispatch.tokenState.updateDocument(false);
        },
        renameTokenSet() {
            dispatch.tokenState.updateDocument(false);
        },
        deleteTokenSet() {
            dispatch.tokenState.updateDocument(false);
        },
        setTokenSetOrder() {
            dispatch.tokenState.updateDocument(false);
        },
        setJSONData() {
            dispatch.tokenState.updateDocument(true);
        },
        setTokenData(payload, rootState) {
            if (payload.shouldUpdate) {
                dispatch.tokenState.updateDocument();
            }
        },
        createToken(payload, rootState) {
            if (payload.shouldUpdate && rootState.settings.updateOnChange) {
                dispatch.tokenState.updateDocument();
            }
        },
        updateDocument(shouldUpdateNodes = true, rootState) {
            updateTokensOnSources({
                tokens: shouldUpdateNodes ? rootState.tokenState.tokens : null,
                tokenValues: reduceToValues(rootState.tokenState.tokens),
                usedTokenSet: rootState.tokenState.usedTokenSet,
                settings: rootState.settings,
                updatedAt: new Date().toString(),
                lastUpdatedAt: rootState.uiState.lastUpdatedAt,
                isLocal: rootState.uiState.storageType.provider === StorageProviderType.LOCAL,
                editProhibited: rootState.uiState.editProhibited,
                api: rootState.uiState.api,
                storageType: rootState.uiState.storageType,
            });
        },
    }),
});
