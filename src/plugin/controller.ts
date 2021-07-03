/* eslint-disable no-param-reassign */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {removeSingleCredential, updateCredentials} from '@/utils/credentials';
import {updateUISettings, getUISettings} from '@/utils/uiSettings';
import getLastOpened from '@/utils/getLastOpened';
import {getUserId} from './helpers';
import pullStyles from './pullStyles';
import updateStyles from './updateStyles';
import store from './store';
import {
    notifyNoSelection,
    notifyTokenValues,
    notifyRemoteComponents,
    notifyStorageType,
    notifyAPIProviders,
    notifyUI,
    notifyUserId,
    notifyLastOpened,
} from './notifiers';
import {findAllWithData, removePluginData, sendPluginValues, updatePluginData} from './pluginData';
import {getTokenData, updateNodes, setTokensOnDocument, goToNode, saveStorageType, getSavedStorageType} from './node';

import {MessageToPluginTypes} from '../../types/messages';
import {StorageProviderType} from '../../types/api';
import compareProvidersWithStored from './compareProviders';

figma.showUI(__html__, {
    width: 400,
    height: 600,
});

figma.on('selectionchange', () => {
    const nodes = figma.currentPage.selection;
    if (!nodes.length) {
        notifyNoSelection();
        return;
    }
    sendPluginValues(nodes);
});

figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
        case MessageToPluginTypes.INITIATE:
            try {
                getUISettings();
                const userId = await getUserId();
                const lastOpened = await getLastOpened();
                const storageType = await getSavedStorageType();
                notifyUserId(userId);
                notifyLastOpened(lastOpened);
                notifyStorageType(storageType);

                const apiProviders = await figma.clientStorage.getAsync('apiProviders');

                if (apiProviders) notifyAPIProviders(JSON.parse(apiProviders));
                switch (storageType.provider) {
                    case StorageProviderType.JSONBIN:
                    case StorageProviderType.ARCADE: {
                        compareProvidersWithStored(apiProviders, storageType);

                        break;
                    }
                    default: {
                        const oldTokens = getTokenData();
                        notifyTokenValues(oldTokens);
                    }
                }
            } catch (err) {
                figma.closePlugin('There was an error, check console (F12)');
                console.error(err);
                return;
            }

            if (!figma.currentPage.selection.length) {
                notifyNoSelection();
                return;
            }
            sendPluginValues(figma.currentPage.selection);
            return;
        case MessageToPluginTypes.CREDENTIALS: {
            const {secret, id, provider, name} = msg;
            updateCredentials({secret, id, name, provider});
            break;
        }
        case MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL: {
            const {secret, id} = msg;
            removeSingleCredential({secret, id});
            break;
        }
        case MessageToPluginTypes.SET_STORAGE_TYPE:
            saveStorageType(msg.storageType);
            break;
        case MessageToPluginTypes.SET_NODE_DATA:
            try {
                updatePluginData(figma.currentPage.selection, msg.values);
                sendPluginValues(figma.currentPage.selection, updateNodes(figma.currentPage.selection, msg.tokens));
            } catch (e) {
                console.error(e);
            }
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;

        case MessageToPluginTypes.REMOVE_NODE_DATA:
            try {
                removePluginData(figma.currentPage.selection, msg.key);
                sendPluginValues(figma.currentPage.selection);
            } catch (e) {
                console.error(e);
            }
            notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            return;
        case MessageToPluginTypes.CREATE_STYLES:
            try {
                updateStyles(msg.tokens, true, msg.settings);
            } catch (e) {
                console.error(e);
            }
            return;
        case MessageToPluginTypes.UPDATE: {
            if (msg.settings.updateStyles && msg.tokens) updateStyles(msg.tokens, false, msg.settings);
            if (msg.tokenValues && msg.updatedAt) setTokensOnDocument(msg.tokenValues, msg.updatedAt);
            if (msg.tokens) {
                const allWithData = findAllWithData({updateMode: msg.settings.updateMode});
                updateNodes(allWithData, msg.tokens);
                updatePluginData(allWithData, {});
                notifyRemoteComponents({nodes: store.successfulNodes.length, remotes: store.remoteComponents});
            }
            return;
        }
        case MessageToPluginTypes.GO_TO_NODE:
            goToNode(msg.id);
            break;
        case MessageToPluginTypes.PULL_STYLES:
            pullStyles(msg.styleTypes);
            break;
        case MessageToPluginTypes.NOTIFY:
            notifyUI(msg.msg, msg.opts);
            break;
        case MessageToPluginTypes.SET_UI: {
            updateUISettings({
                width: msg.uiWindow.width,
                height: msg.uiWindow.height,
                updateMode: msg.updateMode,
                updateOnChange: msg.updateOnChange,
                updateStyles: msg.updateStyles,
                ignoreFirstPartForStyles: msg.ignoreFirstPartForStyles,
            });
            figma.ui.resize(msg.uiWindow.width, msg.uiWindow.height);
            break;
        }
        default:
    }
};
