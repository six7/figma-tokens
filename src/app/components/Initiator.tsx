import React from 'react';
import {identify, track} from '@/utils/analytics';
import {useDispatch} from 'react-redux';
import {postToFigma} from '../../plugin/notifiers';
import {MessageFromPluginTypes, MessageToPluginTypes} from '../../../types/messages';
import useRemoteTokens from '../store/remoteTokens';
import {useTokenDispatch} from '../store/TokenContext';
import TokenData from './TokenData';
import {Dispatch} from '../store';

export default function Initiator({setRemoteComponents}) {
    const dispatch = useDispatch<Dispatch>();

    const {
        setTokenData,
        setLoading,
        setDisabled,
        setSelectionValues,
        resetSelectionValues,
        setTokensFromStyles,
        setApiData,
        setLocalApiState,
        setStorageType,
        setAPIProviders,
        setLastOpened,
    } = useTokenDispatch();
    const {fetchDataFromRemote} = useRemoteTokens();

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
                    width,
                    height,
                } = event.data.pluginMessage;
                switch (type) {
                    case MessageFromPluginTypes.SELECTION:
                        setDisabled(false);
                        if (values) {
                            setSelectionValues(values);
                        } else {
                            resetSelectionValues();
                        }
                        break;
                    case MessageFromPluginTypes.NO_SELECTION:
                        setDisabled(true);
                        resetSelectionValues();
                        break;
                    case MessageFromPluginTypes.REMOTE_COMPONENTS:
                        setLoading(false);
                        setRemoteComponents(values.remotes);
                        break;
                    case MessageFromPluginTypes.TOKEN_VALUES: {
                        setLoading(false);
                        if (values) {
                            setTokenData(new TokenData(values));
                            dispatch.base.setActiveTab('tokens');
                        }
                        break;
                    }
                    case MessageFromPluginTypes.STYLES:
                        setLoading(false);
                        if (values) {
                            track('Import styles');
                            setTokensFromStyles(values);
                            dispatch.base.setActiveTab('tokens');
                        }
                        break;
                    case MessageFromPluginTypes.RECEIVED_STORAGE_TYPE:
                        setStorageType(storageType);
                        break;
                    case MessageFromPluginTypes.API_CREDENTIALS: {
                        if (status === true) {
                            const {id, secret, name, provider} = credentials;
                            setApiData({id, secret, name, provider});
                            setLocalApiState({id, secret, name, provider});
                            const remoteValues = await fetchDataFromRemote(id, secret, name, provider);
                            if (remoteValues) {
                                setTokenData(new TokenData(remoteValues));
                                dispatch.base.setActiveTab('tokens');
                            }
                            setLoading(false);
                        }
                        break;
                    }
                    case MessageFromPluginTypes.API_PROVIDERS: {
                        setAPIProviders(providers);
                        break;
                    }
                    case MessageFromPluginTypes.UI_SETTINGS: {
                        dispatch.settings.setWindowSize({width, height});
                        dispatch.settings.triggerWindowChange();
                        break;
                    }
                    case MessageFromPluginTypes.USER_ID: {
                        identify(userId);
                        track('Launched');
                        break;
                    }
                    case MessageFromPluginTypes.RECEIVED_LAST_OPENED: {
                        setLastOpened(lastOpened);
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
