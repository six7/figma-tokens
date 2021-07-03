import {checkAndEvaluateMath, convertToRgb} from '@/app/components/utils';
import {SingleTokenObject} from 'Types/tokens';
import checkIfValueToken from './checkIfValueToken';

export const aliasRegex = /(\$[^\s]+\w)|({[^\s]+})/g;

export function getAliasValue(token: SingleTokenObject, tokens = []): string | null {
    try {
        let returnedValue = checkIfValueToken(token) ? (token.value as string) : (token as string);

        const tokenReferences = returnedValue?.toString().match(aliasRegex);
        if (tokenReferences?.length > 0) {
            const resolvedReferences = tokenReferences.map((ref) => {
                if (ref.length > 1) {
                    const nameToLookFor = ref.startsWith('{') ? ref.slice(1, ref.length - 1) : ref.substring(1);
                    const foundToken = tokens.find((t) => t.name === nameToLookFor);
                    if (typeof foundToken !== 'undefined') return foundToken.value;
                }
                return null;
            });
            tokenReferences.forEach((reference, index) => {
                returnedValue = returnedValue.replace(
                    reference,
                    resolvedReferences[index]?.value ?? resolvedReferences[index]
                );
            });
            if (returnedValue === 'null') {
                returnedValue = null;
            }
        }
        if (typeof returnedValue !== 'undefined') {
            if (!returnedValue.toString().match(aliasRegex)) {
                return convertToRgb(checkAndEvaluateMath(returnedValue));
            }
            return returnedValue;
        }
    } catch (e) {
        console.log(`Error getting alias value of ${token}`, tokens);
    }
    return null;
}
