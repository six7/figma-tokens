import {Models} from '@rematch/core';
import {settings} from './settings';
import {uiState} from './uiState';
import {tokenState} from './tokenState';

export interface RootModel extends Models<RootModel> {
    settings: typeof settings;
    uiState: typeof uiState;
    tokenState: typeof tokenState;
}

export const models: RootModel = {settings, uiState, tokenState};
