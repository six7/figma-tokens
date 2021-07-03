import React from 'react';
import {identify, track} from '@/utils/analytics';
import {useDispatch} from 'react-redux';
import {MessageFromPluginTypes, MessageToPluginTypes} from '@types/messages';
import {postToFigma} from '../../plugin/notifiers';
import useRemoteTokens from '../store/remoteTokens';
import {Dispatch} from '../store';
import useStorage from '../store/useStorage';

export default function Initiator() {
    const dispatch = useDispatch<Dispatch>();

    const {fetchDataFromRemote} = useRemoteTokens();
    const {setStorageType} = useStorage();

    const onInitiate = () => {
        postToFigma({type: MessageToPluginTypes.INITIATE});
    };

    React.useEffect(() => {
        onInitiate();
        window.onmessage = async (event) => {
            if (event.data.pluginMessage) {
                const {
                    type,
                    values,
                    credentials,
                    status,
                    storageType,
                    lastOpened,
                    providers,
                    userId,
                    settings,
                } = event.data.pluginMessage;
                switch (type) {
                    case MessageFromPluginTypes.SELECTION: {
                        dispatch.uiState.setDisabled(false);
                        if (values) {
                            dispatch.uiState.setSelectionValues(values);
                        } else {
                            dispatch.uiState.resetSelectionValues();
                        }
                        break;
                    }
                    case MessageFromPluginTypes.NO_SELECTION: {
                        dispatch.uiState.setDisabled(true);
                        dispatch.uiState.resetSelectionValues();
                        break;
                    }
                    case MessageFromPluginTypes.REMOTE_COMPONENTS:
                        dispatch.uiState.setLoading(false);
                        break;
                    case MessageFromPluginTypes.TOKEN_VALUES: {
                        dispatch.uiState.setLoading(false);
                        if (values) {
                            dispatch.tokenState.setTokenData(values);
                            dispatch.uiState.setActiveTab('tokens');
                        }
                        break;
                    }
                    case MessageFromPluginTypes.STYLES:
                        dispatch.uiState.setLoading(false);
                        if (values) {
                            track('Import styles');
                            dispatch.tokenState.setTokensFromStyles(values);
                            dispatch.uiState.setActiveTab('tokens');
                        }
                        break;
                    case MessageFromPluginTypes.RECEIVED_STORAGE_TYPE:
                        setStorageType({provider: storageType});
                        break;
                    case MessageFromPluginTypes.API_CREDENTIALS: {
                        if (status === true) {
                            const {id, secret, name, provider} = credentials;
                            dispatch.uiState.setApiData({id, secret, name, provider});
                            dispatch.uiState.setLocalApiState({id, secret, name, provider});
                            const remoteValues = await fetchDataFromRemote(id, secret, name, provider);
                            if (remoteValues) {
                                dispatch.tokenState.setTokenData(remoteValues);
                                dispatch.uiState.setActiveTab('tokens');
                            }
                            dispatch.uiState.setLoading(false);
                        }
                        break;
                    }
                    case MessageFromPluginTypes.API_PROVIDERS: {
                        dispatch.uiState.setAPIProviders(providers);
                        break;
                    }
                    case MessageFromPluginTypes.UI_SETTINGS: {
                        dispatch.settings.setUISettings(settings);
                        dispatch.settings.triggerWindowChange();
                        break;
                    }
                    case MessageFromPluginTypes.USER_ID: {
                        identify(userId);
                        track('Launched');
                        break;
                    }
                    case MessageFromPluginTypes.RECEIVED_LAST_OPENED: {
                        dispatch.uiState.setLastOpened(lastOpened);
                        break;
                    }
                    default:
                        break;
                }
            }
        };
    }, []);

    return null;
}
