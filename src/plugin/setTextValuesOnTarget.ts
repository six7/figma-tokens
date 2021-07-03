import {transformValue} from './helpers';

export default async function setTextValuesOnTarget(target, token) {
    try {
        const {value, description} = token;
        const {fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, paragraphSpacing} = value.value || value;
        const family = fontFamily || target.fontName.family;
        const style = fontWeight || target.fontName.style;
        await figma.loadFontAsync({family, style});

        if (fontFamily && fontWeight) {
            target.fontName = {
                family,
                style,
            };
        }

        if (fontSize) {
            target.fontSize = transformValue(fontSize, 'fontSizes');
        }
        if (lineHeight) {
            target.lineHeight = transformValue(lineHeight, 'lineHeights');
        }
        if (letterSpacing) {
            target.letterSpacing = transformValue(letterSpacing, 'letterSpacing');
        }
        if (paragraphSpacing) {
            target.paragraphSpacing = transformValue(paragraphSpacing, 'paragraphSpacing');
        }
        if (description) {
            target.description = description;
        }
    } catch (e) {
        console.log('Error setting font on target', target, token, e);
    }
}
