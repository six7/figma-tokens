import * as React from 'react';

export enum ActionType {
    SetShowNewGroupForm = 'SET_SHOW_NEW_GROUP_FORM',
    SetShowOptions = 'SET_SHOW_OPTIONS',
    SetCollapsed = 'SET_COLLAPSED',
    ToggleShowEmptyGroups = 'TOGGLE_SHOW_EMPTY_GROUPS',
    ToggleUpdateAfterApply = 'TOGGLE_UPDATE_AFTER_APPLY',
    CreateTokenGroup = 'CREATE_TOKEN_GROUP',
    SetSyncEnabled = 'SET_SYNC_ENABLED',
}

const emptyState = {
    collapsed: false,
    showEditForm: false,
    showNewGroupForm: false,
    showEmptyGroups: true,
    showOptions: false,
    updateAfterApply: true,
};

const TokenStateContext = React.createContext(emptyState);
const TokenDispatchContext = React.createContext(null);

function stateReducer(state, action) {
    switch (action.type) {
        case ActionType.SetCollapsed:
            return {
                ...state,
                collapsed: !state.collapsed,
            };

        case ActionType.ToggleShowEmptyGroups:
            return {
                ...state,
                showEmptyGroups: !state.showEmptyGroups,
            };
        case ActionType.ToggleUpdateAfterApply:
            return {
                ...state,
                updateAfterApply: action.bool,
            };

        case ActionType.CreateTokenGroup: {
            console.log('Not implemented');

            // state.tokenData.createTokenGroup({
            //     parent: action.data.parent,
            //     name: action.data.name,
            // });

            return {
                ...state,
                tokenData: state.tokenData,
            };
        }
        default:
            throw new Error('Context not implemented');
    }
}

function TokenProvider({children}) {
    const [state, dispatch] = React.useReducer(stateReducer, emptyState);

    const updatedAt = new Date().toString();

    const tokenContext = React.useMemo(
        () => ({
            setShowNewGroupForm: (bool: boolean) => {
                dispatch({type: ActionType.SetShowNewGroupForm, bool});
            },

            setCollapsed: () => {
                dispatch({type: ActionType.SetCollapsed});
            },
            toggleShowEmptyGroups: () => {
                dispatch({type: ActionType.ToggleShowEmptyGroups});
            },
            toggleUpdateAfterApply: (bool: boolean) => {
                dispatch({type: ActionType.ToggleUpdateAfterApply, bool});
            },
            createTokenGroup: (data: {parent: string; name: string; updatedAt: Date}) => {
                dispatch({type: ActionType.CreateTokenGroup, data});
            },
        }),
        [dispatch, updatedAt]
    );

    return (
        <TokenStateContext.Provider value={state}>
            <TokenDispatchContext.Provider value={tokenContext}>{children}</TokenDispatchContext.Provider>
        </TokenStateContext.Provider>
    );
}

function useTokenState() {
    const context = React.useContext(TokenStateContext);
    if (context === undefined) {
        throw new Error('useTokenState must be used within a TokenProvider');
    }
    return context;
}
function useTokenDispatch() {
    const context = React.useContext(TokenDispatchContext);
    if (context === undefined) {
        throw new Error('useTokenDispatch must be used within a TokenProvider');
    }
    return context;
}

export {TokenProvider, useTokenState, useTokenDispatch};
