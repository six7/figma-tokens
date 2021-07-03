import {convertToFigmaColor} from './figmaTransforms/colors';
import {transformValue} from './helpers';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import setTextValuesOnTarget from './setTextValuesOnTarget';

export default async function setValuesOnNode(node, values, data) {
    try {
        // BORDER RADIUS
        if (values.borderRadius) {
            if (typeof node.cornerRadius !== 'undefined') {
                node.cornerRadius = transformValue(values.borderRadius || values.borderRadiusTopLeft, 'borderRadius');
            }
        }
        if (values.borderRadiusTopLeft) {
            if (typeof node.topLeftRadius !== 'undefined') {
                node.topLeftRadius = transformValue(values.borderRadiusTopLeft, 'borderRadius');
            }
        }
        if (values.borderRadiusTopRight) {
            if (typeof node.topRightRadius !== 'undefined') {
                node.topRightRadius = transformValue(values.borderRadiusTopRight, 'borderRadius');
            }
        }
        if (values.borderRadiusBottomRight) {
            if (typeof node.bottomRightRadius !== 'undefined') {
                node.bottomRightRadius = transformValue(values.borderRadiusBottomRight, 'borderRadius');
            }
        }
        if (values.borderRadiusBottomLeft) {
            if (typeof node.bottomLeftRadius !== 'undefined') {
                node.bottomLeftRadius = transformValue(values.borderRadiusBottomLeft, 'borderRadius');
            }
        }

        // BOX SHADOW
        if (values.boxShadow) {
            if (typeof node.effects !== 'undefined') {
                // get all effects, but remove DROP_SHADOW, since we're about to add it
                const effects = node.effects.filter((effect) => effect.type !== 'DROP_SHADOW');
                const {x, y, spread, color, blur} = values.boxShadow;
                const {
                    color: {r, g, b},
                    opacity,
                } = convertToFigmaColor(color);

                const effect: ShadowEffect = {
                    type: 'DROP_SHADOW',
                    visible: true,
                    blendMode: 'NORMAL',
                    color: {r, g, b, a: opacity},
                    offset: {x: transformValue(x, 'boxShadow'), y: transformValue(y, 'boxShadow')},
                    radius: transformValue(blur, 'boxShadow'),
                    spread: transformValue(spread, 'boxShadow'),
                };

                effects.push(effect);
                node.effects = effects;
            }
        }

        // BORDER WIDTH
        if (values.borderWidth) {
            // Has to be larger than 0
            if (typeof node.strokeWeight !== 'undefined' && transformValue(values.borderWidth, 'borderWidth') >= 0) {
                node.strokeWeight = transformValue(values.borderWidth, 'borderWidth');
            }
        }

        // OPACITY
        if (values.opacity) {
            if (typeof node.opacity !== 'undefined') {
                node.opacity = transformValue(values.opacity, 'opacity');
            }
        }

        // SIZING: BOTH
        if (values.sizing) {
            if (typeof node.resize !== 'undefined') {
                node.resize(transformValue(values.sizing, 'sizing'), transformValue(values.sizing, 'sizing'));
            }
        }

        // SIZING: WIDTH
        if (values.width) {
            if (typeof node.resize !== 'undefined') {
                node.resize(transformValue(values.width, 'sizing'), node.height);
            }
        }

        // SIZING: HEIGHT
        if (values.height) {
            if (typeof node.resize !== 'undefined') {
                node.resize(node.width, transformValue(values.height, 'sizing'));
            }
        }

        // FILL
        if (values.fill && typeof values.fill === 'string') {
            if (typeof node.fills !== 'undefined') {
                const paints = figma.getLocalPaintStyles();
                const path = data.fill.split('.');
                const pathname = path.slice(1, path.length).join('/');
                const matchingStyles = paints.filter((n) => n.name === pathname);
                if (matchingStyles.length) {
                    // matchingStyles[0].paints = [{color, opacity, type: 'SOLID'}];
                    node.fillStyleId = matchingStyles[0].id;
                } else {
                    setColorValuesOnTarget(node, {value: values.fill}, 'fills');
                }
            }
        }

        // TYPOGRAPHY
        // Either set typography or individual values, if typography is present we prefer that.
        if (values.typography) {
            if (node.type === 'TEXT') {
                const styles = figma.getLocalTextStyles();
                const path = data.typography.split('.'); // extract to helper fn
                const pathname = path.slice(1, path.length).join('/');
                const matchingStyles = styles.filter((n) => n.name === pathname);

                if (matchingStyles.length) {
                    node.textStyleId = matchingStyles[0].id;
                } else {
                    setTextValuesOnTarget(node, {value: values.typography});
                }
            }
        } else if (
            values.fontFamilies ||
            values.fontWeights ||
            values.lineHeights ||
            values.fontSizes ||
            values.letterSpacing ||
            values.paragraphSpacing
        ) {
            if (node.type === 'TEXT') {
                setTextValuesOnTarget(node, {
                    value: {
                        fontFamily: values.fontFamilies,
                        fontWeight: values.fontWeights,
                        lineHeight: values.lineHeights,
                        fontSize: values.fontSizes,
                        letterSpacing: values.letterSpacing,
                        paragraphSpacing: values.paragraphSpacing,
                    },
                });
            }
        }

        // BORDER WIDTH
        if (values.border) {
            if (typeof node.strokes !== 'undefined') {
                const paints = figma.getLocalPaintStyles();
                const path = data.border.split('.');
                const pathname = path.slice(1, path.length).join('/');
                const matchingStyles = paints.filter((n) => n.name === pathname);
                const {color, opacity} = convertToFigmaColor(values.border);

                if (matchingStyles.length) {
                    matchingStyles[0].paints = [{color, opacity, type: 'SOLID'}];
                    node.strokeStyleId = matchingStyles[0].id;
                } else {
                    node.strokes = [{type: 'SOLID', color, opacity}];
                }
            }
        }

        // SPACING
        if (values.spacing) {
            if (typeof node.paddingLeft !== 'undefined') {
                node.paddingLeft = transformValue(values.spacing, 'spacing');
                node.paddingRight = transformValue(values.spacing, 'spacing');
                node.paddingTop = transformValue(values.spacing, 'spacing');
                node.paddingBottom = transformValue(values.spacing, 'spacing');
                node.itemSpacing = transformValue(values.spacing, 'spacing');
            }
        }
        if (values.horizontalPadding) {
            if (typeof node.paddingLeft !== 'undefined') {
                node.paddingLeft = transformValue(values.horizontalPadding, 'spacing');
                node.paddingRight = transformValue(values.horizontalPadding, 'spacing');
            }
        }
        if (values.verticalPadding) {
            if (typeof node.paddingTop !== 'undefined') {
                node.paddingTop = transformValue(values.verticalPadding, 'spacing');
                node.paddingBottom = transformValue(values.verticalPadding, 'spacing');
            }
        }
        if (values.itemSpacing) {
            if (typeof node.itemSpacing !== 'undefined') {
                node.itemSpacing = transformValue(values.itemSpacing, 'spacing');
            }
        }

        if (values.paddingTop) {
            if (typeof node.paddingTop !== 'undefined') {
                node.paddingTop = transformValue(values.paddingTop, 'spacing');
            }
        }
        if (values.paddingRight) {
            if (typeof node.paddingRight !== 'undefined') {
                node.paddingRight = transformValue(values.paddingRight, 'spacing');
            }
        }
        if (values.paddingBottom) {
            if (typeof node.paddingBottom !== 'undefined') {
                node.paddingBottom = transformValue(values.paddingBottom, 'spacing');
            }
        }
        if (values.paddingLeft) {
            if (typeof node.paddingLeft !== 'undefined') {
                node.paddingLeft = transformValue(values.paddingLeft, 'spacing');
            }
        }

        // Raw value for text layers
        if (values.tokenValue) {
            if (typeof node.characters !== 'undefined') {
                await figma.loadFontAsync(node.fontName);
                node.characters = String(values.tokenValue);
            }
        }

        // Name value for text layers
        if (values.tokenName) {
            if (typeof node.characters !== 'undefined') {
                await figma.loadFontAsync(node.fontName);
                node.characters = String(values.tokenName);
            }
        }

        // Name value for text layers
        if (values.description) {
            if (typeof node.characters !== 'undefined') {
                await figma.loadFontAsync(node.fontName);
                node.characters = String(values.description);
            }
        }
    } catch (e) {
        console.log('Error setting data on node', e);
    }
}
