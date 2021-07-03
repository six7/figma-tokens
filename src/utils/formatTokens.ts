import set from 'set-value';

export default function formatTokens(tokens, activeTokenSet) {
    const tokenObj = {};
    tokens[activeTokenSet].values.forEach((token) => {
        set(tokenObj, token.name, token);
    });

    return JSON.stringify(tokenObj, null, 2);
}
