/* eslint-disable import/prefer-default-export */
import {postToFigma} from '@/plugin/notifiers';
import {track} from '@/utils/analytics';
import {createModel} from '@rematch/core';
import {MessageToPluginTypes} from 'Types/messages';
import {UpdateMode} from 'Types/state';
import {RootModel} from '.';

type WindowSettingsType = {
    width: number;
    height: number;
};

type TokenModeType = 'object' | 'array';

export interface SettingsState {
    uiWindow?: WindowSettingsType;
    updateMode?: UpdateMode;
    updateOnChange?: boolean;
    updateStyles?: boolean;
    tokenType?: TokenModeType;
    ignoreFirstPartForStyles?: boolean;
}

const setUI = (state) => {
    postToFigma({
        type: MessageToPluginTypes.SET_UI,
        ...state,
    });
};

export const settings = createModel<RootModel>()({
    state: {
        uiWindow: {
            width: 400,
            height: 600,
        },
        updateMode: UpdateMode.PAGE,
        updateOnChange: true,
        updateStyles: true,
        tokenType: 'object',
        ignoreFirstPartForStyles: true,
    } as SettingsState,
    reducers: {
        setWindowSize(state, payload: {width: number; height: number}) {
            track('Set Window Size', {width: payload.width, height: payload.height});
            return {
                ...state,
                uiWindow: {
                    width: payload.width,
                    height: payload.height,
                },
            };
        },
        setUISettings(state, payload: SettingsState) {
            return {
                ...state,
                ...payload,
            };
        },
        triggerWindowChange(state) {
            setUI(state);
            return state;
        },
        setUpdateMode(state, payload: UpdateMode) {
            return {
                ...state,
                updateMode: payload,
            };
        },
        setUpdateOnChange(state, payload: boolean) {
            return {
                ...state,
                updateOnChange: payload,
            };
        },
        setUpdateStyles(state, payload: boolean) {
            return {
                ...state,
                updateStyles: payload,
            };
        },
        setTokenType(state, payload: TokenModeType) {
            return {
                ...state,
                tokenType: payload,
            };
        },
        setIgnoreFirstPartForStyles(state, payload: boolean) {
            return {
                ...state,
                ignoreFirstPartForStyles: payload,
            };
        },
    },
    effects: (dispatch) => ({
        setUpdateStyles: (payload, rootState) => {
            setUI(rootState.settings);
        },
        setUpdateMode: (payload, rootState) => {
            setUI(rootState.settings);
        },
        setUpdateOnChange: (payload, rootState) => {
            setUI(rootState.settings);
        },
        setIgnoreFirstPartForStyles: (payload, rootState) => {
            setUI(rootState.settings);
        },
    }),
});
