export default {
    sizing: {
        label: 'Size',
        property: 'Size',
        type: 'sizing',
    },
    spacing: {
        label: 'Space',
        property: 'Space',
        type: 'spacing',
    },
    color: {
        label: 'Colors',
        property: 'Color',
        type: 'color',
        schema: {
            value: 'color',
            options: {
                description: '',
            },
        },
        help:
            "If a (local) style is found with the same name it will match to that, if not, will use hex value. Use 'Create Style' to batch-create styles from your tokens (e.g. in your design library). In the future we'll load all 'remote' styles and reference them inside the JSON.",
    },
    borderRadius: {
        label: 'Border Radius',
        property: 'Border Radius',
        type: 'borderRadius',
    },
    borderWidth: {
        label: 'Border Width',
        property: 'Border Width',
        type: 'borderWidth',
        explainer: 'Enter as a number, e.g. 4',
    },
    opacity: {
        label: 'Opacity',
        property: 'Opacity',
        type: 'opacity',
        explainer: 'Set as 50%',
    },
    boxShadow: {
        label: 'Box Shadow',
        property: 'Box Shadow',
        type: 'boxShadow',
        schema: {
            value: {
                x: '',
                y: '',
                spread: '',
                color: '',
                blur: '',
            },
        },
    },
    typography: {
        label: 'Typography',
        property: 'Typography',
        type: 'typography',
        schema: {
            value: {
                fontFamily: '',
                fontWeight: '',
                lineHeight: '',
                fontSize: '',
                letterSpacing: '',
                paragraphSpacing: '',
            },
            options: {
                description: '',
            },
        },
        help:
            "If a (local) style is found with the same name it will match to that, if not, will use raw font values. Use 'Create Style' to batch-create styles from your tokens (e.g. in your design library). In the future we'll load all 'remote' styles and reference them inside the JSON.",
    },
    fontFamilies: {
        help: 'Only works in combination with a Font Weight',
        label: 'Font Families',
        property: 'Font Family',
        type: 'fontFamilies',
    },
    fontWeights: {
        help: 'Only works in combination with a Font Family',
        label: 'Font Weights',
        property: 'Font Weight',
        type: 'fontWeights',
    },
    lineHeights: {
        label: 'Line Heights',
        explainer: 'e.g. 100% or 14',
        property: 'Line Height',
        type: 'lineHeights',
    },
    fontSizes: {
        label: 'Font Sizes',
        property: 'Font Size',
        type: 'fontSizes',
    },
    letterSpacing: {
        label: 'Letter Spacing',
        property: 'Letter Spacing',
        type: 'letterSpacing',
    },
    paragraphSpacing: {
        label: 'Paragraph Spacing',
        property: 'ParagraphSpacing',
        type: 'paragraphSpacing',
    },
};
