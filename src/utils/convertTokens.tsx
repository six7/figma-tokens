import {SingleToken} from '../../types/tokens';
import {isTypographyToken, isValueToken} from '../app/components/utils';

function checkForTokens({
    obj,
    token,
    root = null,
    returnValuesOnly = false,
    expandTypography = false,
}): [object, SingleToken] {
    let returnValue;
    const shouldExpandTypography = expandTypography ? isTypographyToken(token.value) : false;
    if (isValueToken(token) && !shouldExpandTypography) {
        returnValue = token;
    } else if (isTypographyToken(token) && !expandTypography) {
        returnValue = {
            type: 'typography',
            value: Object.entries(token).reduce((acc, [key, val]) => {
                acc[key] = isValueToken(val) && returnValuesOnly ? val.value : val;
                return acc;
            }, {}),
        };

        if (token.description) {
            delete returnValue.value.description;
            returnValue.description = token.description;
        }
    } else if (typeof token === 'object') {
        let tokenToCheck = token;
        if (isValueToken(token)) {
            tokenToCheck = token.value;
        }
        Object.entries(tokenToCheck).map(([key, value]) => {
            const [, result] = checkForTokens({
                obj,
                token: value,
                root: [root, key].filter((n) => n).join('.'),
                returnValuesOnly,
                expandTypography,
            });
            if (root && result) {
                obj[[root, key].join('.')] = result;
            } else if (result) {
                obj[key] = result;
            }
        });
    } else {
        returnValue = {
            value: token,
        };
    }

    return [obj, returnValue];
}

export default function convertToTokenArray({tokens, returnValuesOnly = false, expandTypography = false}) {
    const [result] = checkForTokens({obj: {}, token: tokens, returnValuesOnly, expandTypography});
    return Object.entries(result);
}
