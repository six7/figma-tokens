import {notifyToUI, postToFigma} from '../../../plugin/notifiers';
import {StorageProviderType} from '../../../../types/api';
import {MessageToPluginTypes} from '../../../../types/messages';
import {TokenProps} from '../../../../types/tokens';
import {compareUpdatedAt} from '../../components/utils';
import {useTokenDispatch} from '../TokenContext';
import * as pjs from '../../../../package.json';

async function readTokensFromJSONBin({secret, id}): Promise<TokenProps> | null {
    const response = await fetch(`https://api.jsonbin.io/b/${id}/latest`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'secret-key': secret,
        },
    });

    if (response.ok) {
        return response.json();
    }
    notifyToUI('There was an error connecting, check your sync settings');
    return null;
}

async function writeTokensToJSONBin({secret, id, tokenObj}): Promise<TokenProps> | null {
    const response = await fetch(`https://api.jsonbin.io/b/${id}`, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        body: tokenObj,
        headers: {
            'Content-Type': 'application/json',
            'secret-key': secret,
        },
    });

    if (response.ok) {
        const res = await response.json();
        notifyToUI('Updated Remote');
        return res;
    }
    notifyToUI('Error updating remote');
    return null;
}

export async function updateJSONBinTokens({tokens, id, secret, updatedAt, oldUpdatedAt = null}) {
    const values = Object.entries(tokens).reduce((acc, [key, val]) => {
        acc[key] = JSON.parse(val as string);
        return acc;
    }, {});
    const tokenObj = JSON.stringify(
        {
            version: pjs.plugin_version,
            updatedAt,
            values,
        },
        null,
        2
    );

    if (oldUpdatedAt) {
        const remoteTokens = await readTokensFromJSONBin({secret, id});
        const comparison = await compareUpdatedAt(oldUpdatedAt, remoteTokens.updatedAt);
        if (comparison === 'remote_older') {
            writeTokensToJSONBin({secret, id, tokenObj});
        } else {
            // Tell the user to choose between:
            // A) Pull Remote values and replace local changes
            // B) Overwrite Remote changes
            notifyToUI('Error updating tokens as remote is newer, please update first');
        }
    } else {
        writeTokensToJSONBin({secret, id, tokenObj});
    }
}

export function useJSONbin() {
    const {setProjectURL, setApiData, setStorageType} = useTokenDispatch();

    async function createNewJSONBin({provider, secret, tokens, name, updatedAt}): Promise<TokenProps> {
        const response = await fetch(`https://api.jsonbin.io/b`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            body: JSON.stringify({
                version: pjs.plugin_version,
                updatedAt,
                values: {
                    options: {},
                },
            }),
            headers: {
                'Content-Type': 'application/json',
                'secret-key': secret,
                versioning: 'false',
            },
        });
        const jsonBinData = await response.json();
        if (jsonBinData.success) {
            setApiData({id: jsonBinData.id, name, secret, provider});
            setStorageType({id: jsonBinData.id, name, provider}, true);
            updateJSONBinTokens({
                tokens,
                id: jsonBinData.id,
                secret,
                updatedAt,
            });
            postToFigma({
                type: MessageToPluginTypes.CREDENTIALS,
                id: jsonBinData.id,
                name,
                secret,
                provider,
            });
            return tokens;
        }
        notifyToUI('Something went wrong. See console for details');
        return null;
    }

    // Read tokens from JSONBin

    async function fetchDataFromJSONBin(id, secret, name): Promise<TokenProps> {
        let tokenValues;

        if (!id && !secret) return;

        try {
            const jsonBinData = await readTokensFromJSONBin({id, secret});
            setProjectURL(`https://jsonbin.io/${id}`);

            if (jsonBinData) {
                postToFigma({
                    type: MessageToPluginTypes.CREDENTIALS,
                    id,
                    name,
                    secret,
                    provider: StorageProviderType.JSONBIN,
                });
                if (jsonBinData?.values) {
                    const values = Object.entries(jsonBinData.values).reduce((acc, [key, val]) => {
                        acc[key] = JSON.stringify(val, null, 2);
                        return acc;
                    }, {});

                    const obj = {
                        version: jsonBinData.version,
                        updatedAt: jsonBinData.updatedAt,
                        values,
                    };

                    tokenValues = obj;
                } else {
                    notifyToUI('No tokens stored on remote');
                }
            }

            return tokenValues;
        } catch (e) {
            notifyToUI('Error fetching from JSONbin, check console (F12)');
            console.log('Error:', e);
        }
    }
    return {
        fetchDataFromJSONBin,
        createNewJSONBin,
    };
}
