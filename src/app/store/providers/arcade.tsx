import {useDispatch} from 'react-redux';
import {Dispatch} from '@/app/store';
import {StorageProviderType} from '@types/api';
import {MessageToPluginTypes} from '@types/messages';
import {ArcadeTokenType, TokenProps, TokenType} from '@types/tokens';
import {notifyToUI, postToFigma} from '@/plugin/notifiers';

type ArcadeResponse = {
    exports: object;
    version: string;
};

function mapTypeToArcade(type: TokenType): ArcadeTokenType {
    switch (type) {
        case 'borderRadius':
            return 'border-radius';
        case 'borderWidth':
            return 'border-width';
        case 'sizing':
            return 'size';
        case 'spacing':
            return 'space';
        case 'fontWeights':
            return 'font-weight';
        case 'lineHeights':
            return 'line-height';
        case 'letterSpacing':
            return 'letter-spacing';
        case 'paragraphSpacing':
            return 'paragraph-spacing';
        case 'fontFamilies':
            return 'font-family';
        case 'fontSizes':
            return 'font-size';
        default:
            return type;
    }
}
function mapTypeFromArcade(type: ArcadeTokenType): TokenType {
    switch (type) {
        case 'border-radius':
            return 'borderRadius';
        case 'border-width':
            return 'borderWidth';
        case 'font-weight':
            return 'fontWeights';
        case 'line-height':
            return 'lineHeights';
        case 'letter-spacing':
            return 'letterSpacing';
        case 'paragraph-spacing':
            return 'paragraphSpacing';
        case 'font-family':
            return 'fontFamilies';
        case 'font-size':
            return 'fontSizes';
        case 'size':
            return 'sizing';
        case 'space':
            return 'spacing';
        default:
            return type;
    }
}

async function readTokensFromArcade({secret, id}): Promise<ArcadeResponse> | null {
    try {
        const res = await fetch(
            `https://api.usearcade.com/api/projects/${id}/tokens/draft/export/figma-tokens-plugin/raw`,
            {
                headers: {
                    authorization: `Bearer ${secret}`,
                },
            }
        ).then(async (r) => {
            if (!r.ok) {
                throw await r.json();
            }
            return r.json();
        });

        return res;
    } catch (err) {
        notifyToUI('Error fetching from Arcade, check console (F12)');
        console.log('Error fetching from Arcade: ', err);
    }

    return null;
}

async function writeTokensToArcade(): Promise<TokenProps> | null {
    throw new Error('Not implemented');
}

export default function useArcade() {
    const dispatch = useDispatch<Dispatch>();

    async function updateArcadeTokens() {
        throw new Error('Not implemented');
    }

    async function createNewArcade() {
        return null;
    }

    async function editArcadeToken({id, secret, data}): Promise<boolean> {
        console.log('Calling edit arcade token', data);
        const {name, value, options} = data;
        const {description, type} = options;
        const tokenName = data.oldName || name;
        const newToken: {
            name: string;
            value: string;
            description?: string;
            type?: string;
        } = {
            name,
            value,
        };
        if (description) {
            newToken.description = description;
        }
        if (type) {
            newToken.type = mapTypeToArcade(type);
        }
        try {
            await fetch(`https://api.usearcade.com/api/projects/${id}/tokens/${tokenName}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    newToken,
                    from: 'figma',
                    changeComment: 'Edited by Figma Plugin',
                }),
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${secret}`,
                },
            }).then(async (r) => {
                if (!r.ok) {
                    throw await r.json();
                }
                return r.json();
            });

            return true;
        } catch (err) {
            notifyToUI('Error editing token on Arcade, check console (F12)');
            console.log('Error editing token on Arcade: ', err);
            return false;
        }
    }

    async function createArcadeToken({id, secret, data}): Promise<boolean> {
        console.log('Calling create arcade token', data);
        const {name, value, options = {}} = data;
        const {description, type} = options;
        const tokenName = name;
        const tokenObj: {
            name: string;
            value: string;
            description?: string;
            type?: ArcadeTokenType;
        } = {
            name: tokenName,
            value,
        };
        if (description) {
            tokenObj.description = description;
        }
        if (type) {
            tokenObj.type = mapTypeToArcade(type);
        }
        try {
            await fetch(`https://api.usearcade.com/api/projects/${id}/tokens`, {
                method: 'POST',
                body: JSON.stringify({
                    ...tokenObj,
                    from: 'figma',
                    changeComment: 'Created by Figma Plugin',
                }),
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${secret}`,
                },
            }).then(async (r) => {
                if (!r.ok) {
                    throw await r.json();
                }
                return r.json();
            });

            return true;
        } catch (err) {
            notifyToUI('Error creating token on Arcade, check console (F12)');
            console.log('Error creating token on Arcade: ', err);
            return false;
        }
    }

    // Read tokens from Arcade
    async function fetchDataFromArcade(id, secret, name): Promise<TokenProps> {
        console.log('Fetching from arcade', id, secret, name);
        try {
            let tokenValues;

            if (!id && !secret) return;

            const res = await readTokensFromArcade({id, secret});

            if (res.exports) {
                dispatch.uiState.setProjectURL(`https://app.usearcade.com/projects/${id}`);
                postToFigma({
                    type: MessageToPluginTypes.CREDENTIALS,
                    id,
                    name,
                    secret,
                    provider: StorageProviderType.ARCADE,
                });
                const tokens = res.exports['figma-tokens-plugin'];
                if (tokens?.output) {
                    const parsedTokens = JSON.parse(tokens.output);
                    const mappedTokens = parsedTokens.tokens.map((token) => ({
                        ...token,
                        type: mapTypeFromArcade(token.type),
                    }));

                    const obj = {
                        version: res.version,
                        values: mappedTokens,
                    };

                    tokenValues = obj;
                } else {
                    notifyToUI('No tokens stored on remote');
                }

                return tokenValues;
            }
        } catch (e) {
            console.error('Error parsing tokens', e);
            return null;
        }
    }

    async function deleteArcadeToken({id, secret, data}) {
        console.log('Calling delete arcade token', data);
        const {path} = data;
        const tokenName = path;
        try {
            const res = await fetch(`https://api.usearcade.com/api/projects/${id}/tokens/${tokenName}`, {
                method: 'DELETE',
                headers: {
                    authorization: `Bearer ${secret}`,
                },
            }).then(async (r) => {
                if (!r.ok) {
                    throw await r.json();
                }
                return r.json();
            });
            if (res) {
                console.log('Success');
            }
        } catch (err) {
            notifyToUI('Error deleting token on Arcade, check console (F12)');
            console.log('Error deleting token on Arcade: ', err);
        }
    }

    return {
        fetchDataFromArcade,
        updateArcadeTokens,
        createArcadeToken,
        editArcadeToken,
        deleteArcadeToken,
        createNewArcade,
    };
}
