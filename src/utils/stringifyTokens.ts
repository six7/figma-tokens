import {appendTypeToToken} from '@/app/components/createTokenObj';
import set from 'set-value';

export default function stringifyTokens(tokens, activeTokenSet) {
    const tokenObj = {};
    tokens[activeTokenSet].values.forEach((token) => {
        const tokenWithType = appendTypeToToken(token);
        const {name, ...tokenWithoutName} = tokenWithType;
        set(tokenObj, token.name, tokenWithoutName);
    });

    return JSON.stringify(tokenObj, null, 2);
}
