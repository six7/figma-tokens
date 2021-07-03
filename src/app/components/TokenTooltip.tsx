import React from 'react';

// Returns token value in display format
export default function TokenTooltip({token, resolvedTokens, shouldResolve = false}) {
    try {
        const valueToCheck = shouldResolve ? resolvedTokens.find((t) => t.name === token.name).value : token.value;

        if (token.type === 'typography') {
            if (shouldResolve) {
                return (
                    <div>
                        {valueToCheck.fontFamily} / {valueToCheck.fontWeight}
                    </div>
                );
            }
            return (
                <div>
                    <div>Font: {valueToCheck.fontFamily}</div>
                    <div>Weight: {valueToCheck.fontWeight}</div>
                    <div>Leading: {valueToCheck.lineHeight}</div>
                    <div>Tracking: {valueToCheck.lineHeight}</div>
                </div>
            );
        }
        if (typeof valueToCheck !== 'string' && typeof valueToCheck !== 'number') {
            return <div>{JSON.stringify(valueToCheck, null, 2)}</div>;
        }

        return <div>{valueToCheck}</div>;
    } catch (e) {
        console.log('Error rendering tooltip', token, e);
        return null;
    }
}
