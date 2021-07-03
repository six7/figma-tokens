import {convertTypographyNumberToFigma} from './figmaTransforms/generic';
import {convertLetterSpacingToFigma} from './figmaTransforms/letterSpacing';
import {convertLineHeightToFigma} from './figmaTransforms/lineHeight';
import convertOpacityToFigma from './figmaTransforms/opacity';

export function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

export function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}});
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        });
    }

    return mergeDeep(target, ...sources);
}

export function generateId(len, charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let randomString = '';
    for (let i = 0; i < len; i++) {
        const randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
}

export async function getUserId() {
    let userId = generateId(24);

    try {
        const id = await figma.clientStorage.getAsync('userId');
        if (typeof id === 'undefined') {
            figma.clientStorage.setAsync('userId', userId);
        } else {
            userId = id;
        }
    } catch (e) {
        console.error('error retrieving userId', e);
        figma.clientStorage.setAsync('userId', userId);
    }

    return userId;
}

export function transformValue(value, type) {
    switch (type) {
        case 'borderRadius':
        case 'borderRadiusTopLeft':
        case 'borderRadiusTopRight':
        case 'borderRadiusBottomRight':
        case 'borderRadiusBottomLeft':
        case 'width':
        case 'height':
        case 'sizing':
        case 'spacing':
        case 'horizontalPadding':
        case 'verticalPadding':
        case 'paddingTop':
        case 'paddingRight':
        case 'paddingBottom':
        case 'paddingLeft':
        case 'itemSpacing':
        case 'borderWidth':
        case 'boxShadow':
        case 'paragraphSpacing':
        case 'fontSizes':
            return convertTypographyNumberToFigma(value);
        case 'letterSpacing':
            return convertLetterSpacingToFigma(value);
        case 'lineHeights':
            return convertLineHeightToFigma(value);
        case 'opacity':
            return convertOpacityToFigma(value.toString());
        default:
            return value;
    }
}
