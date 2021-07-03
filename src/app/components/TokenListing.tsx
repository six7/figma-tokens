import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {SingleTokenObject} from 'Types/tokens';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import Heading from './Heading';
import Icon from './Icon';
import renderKeyValue from './renderKeyValue';
import Tooltip from './Tooltip';
import {Dispatch, RootState} from '../store';

const TokenListing = ({
    tokenKey,
    label,
    schema,
    explainer = '',
    property,
    tokenType = 'implicit',
    values,
    resolvedTokens,
}: {
    tokenKey: string;
    label: string;
    schema: {
        value: object | string;
        options: object | string;
    };
    explainer: string;
    property: string;
    tokenType: string;
    values: object;
    resolvedTokens: SingleTokenObject[];
}) => {
    const {editProhibited} = useSelector((state: RootState) => state.tokenState);
    const {displayType} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();

    const {collapsed, showEmptyGroups} = useTokenState();
    const {setCollapsed} = useTokenDispatch();

    const showDisplayToggle = tokenType === 'color';

    const [isIntCollapsed, setIntCollapsed] = React.useState(false);

    const showForm = ({value, name, path, isPristine = false}) => {
        dispatch.uiState.setShowEditForm(true);
        dispatch.uiState.setEditToken({
            value,
            name,
            initialName: name,
            path,
            isPristine,
            explainer,
            property,
            schema: schema?.value,
            optionsSchema: schema?.options,
            options: {
                description: value.description,
                type: tokenType,
            },
        });
    };

    const showNewForm = ({path, name = ''}) => {
        showForm({value: '', name, path, isPristine: true});
    };

    React.useEffect(() => {
        if (values) {
            setIntCollapsed(collapsed);
        }
    }, [collapsed, values]);

    const handleSetIntCollapsed = (e) => {
        e.stopPropagation();
        if (e.altKey) {
            setCollapsed(!collapsed);
        } else {
            setIntCollapsed(!isIntCollapsed);
        }
    };

    if (!values && !showEmptyGroups) return null;

    return (
        <div className="border-b border-gray-200" data-cy={`tokenlisting-${tokenKey}`}>
            <div className="flex justify-between space-x-8 items-center relative">
                <button
                    className={`flex items-center w-full h-full p-4 space-x-2 hover:bg-gray-100 focus:outline-none ${
                        isIntCollapsed ? 'opacity-50' : null
                    }`}
                    type="button"
                    onClick={handleSetIntCollapsed}
                >
                    <Tooltip label="Alt + Click to collapse all">
                        <div className="p-2 -m-2">
                            {isIntCollapsed ? (
                                <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 3L1 0v6l4-3z" fill="currentColor" />
                                </svg>
                            ) : (
                                <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 5l3-4H0l3 4z" fill="currentColor" />
                                </svg>
                            )}
                        </div>
                    </Tooltip>
                    <Heading size="small">{label}</Heading>
                </button>
                <div className="absolute right-0 mr-2">
                    {showDisplayToggle && (
                        <Tooltip label={displayType === 'GRID' ? 'Show as List' : 'Show as Grid'}>
                            <button
                                onClick={() =>
                                    dispatch.uiState.setDisplayType(displayType === 'GRID' ? 'LIST' : 'GRID')
                                }
                                type="button"
                                className="button button-ghost"
                            >
                                <Icon name={displayType === 'GRID' ? 'list' : 'grid'} />
                            </button>
                        </Tooltip>
                    )}

                    <Tooltip label="Add a new token" variant="right">
                        <button
                            disabled={editProhibited}
                            data-cy="button-add-new-token"
                            className="button button-ghost"
                            type="button"
                            onClick={() => {
                                showNewForm({path: tokenKey});
                            }}
                        >
                            <Icon name="add" />
                        </button>
                    </Tooltip>
                </div>
            </div>
            {values && (
                <div className={`px-4 pb-4 ${isIntCollapsed ? 'hidden' : null}`}>
                    {renderKeyValue({
                        tokenValues: values,
                        showNewForm,
                        showForm,
                        schema,
                        path: tokenKey,
                        type: tokenType,
                        resolvedTokens,
                    })}
                </div>
            )}
        </div>
    );
};

export default TokenListing;
