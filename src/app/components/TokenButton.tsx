import * as React from 'react';
import {track} from '@/utils/analytics';
import Tooltip from './Tooltip';
import MoreButton from './MoreButton';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Icon from './Icon';
import {lightOrDark, colorByHashCode, isTypographyToken} from './utils';

const TokenButton = ({type, property, name, path, token, editMode, showForm}) => {
    const {colorMode, displayType, selectionValues, tokenData, disabled, activeTokenSet} = useTokenState();
    const {setNodeData, setShowOptions, setLoading, deleteToken} = useTokenDispatch();
    const displayValue = tokenData.getTokenValue(token);
    let style;
    let showValue = true;
    let showEditButton = false;
    let properties = [type];
    const buttonClass = [];

    const handleEditClick = () => {
        setShowOptions(property);
        showForm({name, value: token, path});
    };

    const handleDeleteClick = () => {
        deleteToken({parent: activeTokenSet, path: [path, name].join('.')});
    };

    function setPluginValue(value) {
        setLoading(true);
        setNodeData(value);
    }

    if (colorMode) {
        style = {
            '--bgColor': colorByHashCode(name.toString()),
            backgroundColor: 'hsl(var(--bgColor))',
        };
    }
    switch (type) {
        case 'borderRadius':
            style = {...style, borderRadius: `${displayValue}px`};
            properties = [
                {
                    label: 'All',
                    name: 'borderRadius',
                    clear: [
                        'borderRadiusTopLeft',
                        'borderRadiusTopRight',
                        'borderRadiusBottomRight',
                        'borderRadiusBottomLeft',
                    ],
                },
                {label: 'Top Left', name: 'borderRadiusTopLeft'},
                {label: 'Top Right', name: 'borderRadiusTopRight'},
                {label: 'Bottom Right', name: 'borderRadiusBottomRight'},
                {label: 'Bottom Left', name: 'borderRadiusBottomLeft'},
            ];
            break;
        case 'spacing':
            properties = [
                {
                    label: 'All',
                    icon: 'Spacing',
                    name: 'spacing',
                    clear: ['horizontalPadding', 'verticalPadding', 'itemSpacing'],
                },
                {label: 'Horizontal', name: 'horizontalPadding', icon: 'HorizontalPadding'},
                {label: 'Vertical', name: 'verticalPadding', icon: 'VerticalPadding'},
                {label: 'Gap', name: 'itemSpacing', icon: 'Gap'},
            ];
            break;
        case 'sizing':
            properties = [
                {
                    label: 'All',
                    name: 'sizing',
                    clear: ['width', 'height'],
                },
                {label: 'Width', name: 'width'},
                {label: 'Height', name: 'height'},
            ];
            break;
        case 'color':
            showValue = false;
            properties = [
                {
                    label: 'Fill',
                    name: 'fill',
                },
                {
                    label: 'Border',
                    name: 'border',
                },
            ];

            style = {
                '--backgroundColor': displayValue,
                '--borderColor': lightOrDark(displayValue) === 'light' ? '#f5f5f5' : 'white',
            };
            buttonClass.push('button-property-color');
            if (displayType === 'LIST') {
                buttonClass.push('button-property-color-listing');
                showValue = true;
                if (!editMode) showEditButton = true;
            }
            break;
        default:
            break;
    }

    properties = [
        ...properties,
        {
            label: 'Insert name (text)',
            name: 'tokenName',
        },
        {
            label: 'Insert raw value (text)',
            name: 'tokenValue',
        },
        {
            label: 'Insert description (text)',
            name: 'description',
        },
    ];

    const active = selectionValues[type] === [path, name].join('.');
    const semiActive = properties.some((prop) => selectionValues[prop.name] === [path, name].join('.'));

    if (editMode) {
        buttonClass.push('button-edit');
    }
    if (active) {
        buttonClass.push('button-active');
    } else if (semiActive) {
        buttonClass.push('button-semi-active');
    }

    const onClick = (givenProperties, isActive = active) => {
        const propsToSet = Array.isArray(givenProperties) ? givenProperties : new Array(givenProperties);
        if (editMode) {
            showForm({name, value: token, path});
        } else {
            track('Apply Token', {givenProperties});
            const tokenValue = [path, name].join('.');
            let value = isActive ? 'delete' : tokenValue;
            if (propsToSet[0].clear && !active) {
                value = 'delete';
                propsToSet[0].forcedValue = tokenValue;
            }
            const newProps = {
                [propsToSet[0].name || propsToSet[0]]: propsToSet[0].forcedValue || value,
            };
            if (propsToSet[0].clear) propsToSet[0].clear.map((item) => Object.assign(newProps, {[item]: 'delete'}));
            setPluginValue(newProps);
        }
    };

    const getTokenDisplay = (tokenVal) => {
        const valueToCheck = tokenVal.value ?? tokenVal;
        if (isTypographyToken(valueToCheck)) {
            return `${valueToCheck.fontFamily} / ${valueToCheck.fontWeight}`;
        }
        if (typeof valueToCheck !== 'string' && typeof valueToCheck !== 'number') {
            return JSON.stringify(valueToCheck, null, 2);
        }

        return valueToCheck;
    };

    return (
        <div
            className={`relative mb-1 mr-1 flex button button-property ${buttonClass.join(' ')} ${
                disabled && 'button-disabled'
            } `}
            style={style}
        >
            <MoreButton
                properties={properties}
                onClick={onClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                value={name}
                path={path}
                mode={editMode ? 'edit' : 'list'}
            >
                <Tooltip label={`${name}: ${getTokenDisplay(token)}`}>
                    <button
                        className="w-full h-full"
                        disabled={editMode ? false : disabled}
                        type="button"
                        onClick={() => onClick(properties[0])}
                    >
                        <div className="button-text">{showValue && <span>{name}</span>}</div>
                        {editMode && <div className="button-edit-overlay">Edit</div>}
                    </button>
                </Tooltip>
            </MoreButton>
            {showEditButton && (
                <Tooltip label="Edit Token">
                    <button
                        className="ml-auto button button-ghost button-property-edit"
                        type="button"
                        onClick={handleEditClick}
                    >
                        <Icon name="edit" />
                    </button>
                </Tooltip>
            )}
        </div>
    );
};

export default TokenButton;
