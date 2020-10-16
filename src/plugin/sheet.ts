/* eslint-disable no-param-reassign */
import Dot from 'dot-object';
import {convertToFigmaColor} from './helpers';

const dot = new Dot('/');

function createRow(name, direction = 'HORIZONTAL') {
    console.log('CREATING ROW', name);

    const frame = figma.createFrame();
    frame.layoutMode = direction;
    frame.counterAxisSizingMode = 'AUTO';
    frame.name = name;
    frame.clipsContent = false;
    frame.itemSpacing = 8;
    frame.backgrounds = [];
    return frame;
}

const updateTokenSheet = (tokens) => {
    const colorTokens = dot.dot(tokens.colors);

    const ancestors = [];
    const existingTokenLayer = figma.currentPage.findChild((n) => n.name === 'Tokens');

    if (existingTokenLayer) {
        ancestors.push(...existingTokenLayer.findChildren((n) => n.type === 'FRAME').map((n) => n.name));
    }

    const paints = figma.getLocalPaintStyles();
    const row = existingTokenLayer || createRow('Tokens', 'VERTICAL');

    function createColorTile(key, value) {
        const rect = figma.createRectangle();
        const matchingStyle = paints.find((n) => n.name === key);
        if (matchingStyle) {
            rect.fillStyleId = matchingStyle.id;
        } else {
            rect.fills = [{type: 'SOLID', color: convertToFigmaColor(value)}];
        }

        rect.name = key;
        return rect;
    }

    Object.entries(colorTokens).map(([key, value]) => {
        const keySplit = key.split('/');
        let ancestorRow = null;
        if (keySplit.length > 1) {
            const ancestor = keySplit.slice(0, keySplit.length - 1).join('/');
            if (ancestors.includes(ancestor)) {
                ancestorRow = row.findChild((n) => n.name === ancestor);
            } else {
                ancestorRow = createRow(ancestor);
                ancestors.push(ancestor);
                row.appendChild(ancestorRow);
            }
        }
        if (ancestorRow) {
            if (!ancestorRow.findChild((n) => n.name === key)) {
                console.log('Ancestor node DOES exist', ancestorRow.name);
                const rect = createColorTile(key, value);
                ancestorRow.appendChild(rect);
            }
        } else if (!row.findChild((n) => n.name === key)) {
            console.log('Ancestor node does not exist');
            const rect = createColorTile(key, value);
            row.appendChild(rect);
        }
    });
};

export default updateTokenSheet;
