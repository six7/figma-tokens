/* eslint-disable class-methods-use-this */
import objectPath from 'object-path';
import set from 'set-value';
import convertToTokenArray from '@/utils/convertTokens';
import checkIfValueToken from '@/utils/checkIfValueToken';
import {getAliasValue} from '@/utils/aliases';
import checkIfAlias from '@/utils/checkIfAlias';
import {mergeDeep} from '../../plugin/helpers';
import {notifyToUI} from '../../plugin/notifiers';
import {SingleToken, TokenGroup, TokenObject, TokenProps, Tokens} from '../../../types/tokens';

export default class TokenData {
    mergedTokens: TokenGroup;

    tokens: Tokens;

    usedTokenSet: string[];

    updatedAt: string;

    constructor(data: TokenProps) {
        this.setTokens(data);
        this.setMergedTokens();
    }

    setTokens(tokens: TokenProps): void {
        const parsed = this.parseTokenValues(tokens);
        this.setUpdatedAt(tokens.updatedAt || new Date().toString());
        if (!parsed) return;

        this.tokens = parsed;
        this.setUsedTokenSet([Object.keys(parsed)[0]]);
    }

    private checkTokenValidity(tokens: string): boolean {
        try {
            JSON.parse(tokens);
            return false;
        } catch (e) {
            return true;
        }
    }

    private parseTokenValues(tokens: TokenProps): Tokens | null {
        try {
            const reducedTokens = Object.entries(tokens.values).reduce((prev, group) => {
                prev.push({[group[0]]: {values: group[1]}});
                return prev;
            }, []);

            const assigned = Object.assign({}, ...reducedTokens);

            return assigned;
        } catch (e) {
            notifyToUI('Error reading tokens, check console (F12)');
            console.error('Error reading tokens', e);
            console.log("Here's the tokens");
            console.log(tokens);
            return null;
        }
    }

    convertDotPathToNestedObject(path, value) {
        const [last, ...paths] = path.toString().split('/').reverse();
        return paths.reduce((acc, el) => ({[el]: acc}), {[last]: value});
    }

    injectTokens(tokens, activeTokenSet): void {
        const receivedStyles = {};
        const oldValues = JSON.parse(this.tokens[activeTokenSet].values);

        // Iterate over received styles to set a value if no value existed before.
        Object.entries(tokens).map(([parent, values]: [string, SingleToken[]]) => {
            values.map((token: TokenGroup) => {
                const key = `${parent}/${token[0]}`.split('/').join('.');
                const oldValue = objectPath.get(oldValues, key);
                set(receivedStyles, key, oldValue || token[1]);
            });
        });

        // Merge again with old tokens object to preserve tokens that don't exist as styles
        const newTokens = mergeDeep(oldValues, receivedStyles);
        this.tokens[activeTokenSet].values = JSON.stringify(newTokens, null, 2);
        this.setMergedTokens();
    }

    addTokenSet(tokenSet: string, updatedAt): boolean {
        if (tokenSet in this.tokens) {
            notifyToUI('Token set already exists');
            return false;
        }
        this.tokens = {
            ...this.tokens,
            [tokenSet]: {
                values: JSON.stringify({}),
            },
        };
        this.setUpdatedAt(updatedAt);
        return true;
    }

    deleteTokenSet(tokenSet: string, updatedAt): void {
        if (tokenSet in this.tokens) {
            const oldTokens = this.tokens;
            delete oldTokens[tokenSet];
            this.tokens = {
                ...oldTokens,
            };
            this.setUpdatedAt(updatedAt);
        }
    }

    renameTokenSet({oldName, newName, updatedAt}): boolean {
        if (newName in this.tokens) {
            notifyToUI('Token set already exists');
            return false;
        }
        this.tokens = {
            ...this.tokens,
            [newName]: this.tokens[oldName],
        };
        delete this.tokens[oldName];
        this.setUpdatedAt(updatedAt);

        return true;
    }

    reorderTokenSets(tokenSets: string[]): void {
        const newTokens = {};
        tokenSets.map((set) => {
            Object.assign(newTokens, {[set]: this.tokens[set]});
        });
        this.tokens = newTokens;
        this.setMergedTokens();
    }

    setUsedTokenSet(usedTokenSet: string[]): void {
        this.usedTokenSet = usedTokenSet;
        this.setMergedTokens();
    }

    setMergedTokens(): void {
        if (Object.entries(this.tokens)) {
            this.mergedTokens = mergeDeep(
                {},
                ...Object.entries(this.tokens).reduce((acc, cur) => {
                    if (this.usedTokenSet.includes(cur[0])) acc.push(JSON.parse(cur[1].values));
                    return acc;
                }, [])
            );

            // Allows for referencing values form 'palette' set in each other set.
            if ('palette' in this.tokens) {
                this.mergedTokens.palette = JSON.parse(this.tokens.palette.values);
            }

            this.setAllAliases();
        }
    }

    updateTokenValues(parent: string, tokens: string, updatedAt: string): void {
        if (tokens) {
            const hasErrored: boolean = this.checkTokenValidity(tokens);

            const newTokens = {
                ...this.tokens,
                [parent]: {
                    hasErrored,
                    values: tokens,
                },
            };
            this.setUpdatedAt(updatedAt);
            this.tokens = newTokens;
            if (!hasErrored) {
                this.setMergedTokens();
            }
        } else {
            const oldTokens = this.tokens;
            delete oldTokens[parent];
        }
    }

    getTokens() {
        return this.tokens;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    setUpdatedAt(value: string) {
        this.updatedAt = value;
    }

    reduceToValues() {
        const reducedTokens = Object.entries(this.tokens).reduce((prev, group) => {
            prev.push({[group[0]]: group[1].values});
            return prev;
        }, []);

        const assigned = mergeDeep({}, ...reducedTokens);

        return assigned;
    }

    getMergedTokens(): TokenGroup {
        return this.mergedTokens;
    }

    getFormattedTokens() {
        const tokens = convertToTokenArray({tokens: this.getMergedTokens(), expandTypography: true});
        console.log('Tokens are', tokens);
        const tokenObj = {};
        tokens.forEach(([key, value]) => {
            set(tokenObj, key.split('/').join('.').toString(), value);
        });

        return JSON.stringify(tokenObj, null, 2);
    }

    private findAllAliases({
        key = null,
        arr = Object.entries(this.tokens),
    }: {
        key?: string;
        arr?: [string, SingleToken | TokenObject][];
    }) {
        return arr.reduce((prev, el) => {
            if (typeof el[1] === 'object') {
                const newKey = key ? [key, el[0]].join('.') : el[0];
                prev.push(...this.findAllAliases({key: newKey, arr: Object.entries(el[1])}));
            } else if (checkIfAlias(el[1], this.mergedTokens)) {
                const obj = [`${key}.${el[0]}`, el[1]];
                prev.push(obj);
                return prev;
            }
            return prev;
        }, []);
    }

    setAllAliases(previousCount = undefined, aliasArray = Object.entries(this.mergedTokens)): void {
        const aliases = this.findAllAliases({arr: aliasArray});

        if (aliases.length > 0) {
            aliases.forEach((alias) => {
                this.setResolvedAlias(this.mergedTokens, alias[0], getAliasValue(alias[1], this.mergedTokens));
            });
            if (previousCount > aliases.length || !previousCount) {
                this.setAllAliases(aliases.length);
            } else {
                console.log("Unable to resolve some aliases, these wont' resolve:", aliases);
            }
        }
    }

    getTokenValue(token: SingleToken): string | null {
        if (checkIfAlias(token, this.mergedTokens)) {
            return getAliasValue(token, this.mergedTokens);
        }
        return String(checkIfValueToken(token) ? token.value : token);
    }

    setResolvedAlias(tokens: TokenGroup, target: string, source: string): void {
        set(tokens, target, source);
    }

    getResolvedAlias(tokens: TokenGroup, token: string): string {
        try {
            return objectPath.get(tokens, token);
        } catch (e) {
            console.log('error', e);
        }
        return null;
    }
}
