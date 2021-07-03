import * as React from 'react';
import Icon from './Icon';
import TokenButton from './TokenButton';
import TokenGroupHeading from './TokenGroupHeading';
import Tooltip from './Tooltip';
import {isSingleToken, isTypographyToken} from './utils';

const renderKeyValue = ({
    tokenValues,
    showNewForm,
    showForm,
    schema,
    path = '',
    type = '',
    editMode = false,
    resolvedTokens,
}) => {
    return (
        <div className="flex justify-start flex-row flex-wrap">
            {Object.entries(tokenValues).map(([key, value]) => {
                const stringPath = [path, key].join('.');

                return (
                    <React.Fragment key={[path, key].join('.')}>
                        {typeof value === 'object' && !isTypographyToken(value) && !isSingleToken(value) ? (
                            <div className="property-wrapper w-full">
                                <div className="flex items-center justify-between">
                                    <TokenGroupHeading
                                        label={key}
                                        path={stringPath}
                                        id={editMode ? 'edit' : 'listing'}
                                    />
                                    {editMode && (
                                        <Tooltip label="Add a new token in group" variant="right">
                                            <button
                                                className="button button-ghost"
                                                type="button"
                                                onClick={() => {
                                                    showNewForm({path: stringPath, name: key});
                                                }}
                                            >
                                                <Icon name="add" />
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>

                                {renderKeyValue({
                                    tokenValues: value,
                                    showNewForm,
                                    showForm,
                                    schema,
                                    path: stringPath,
                                    type,
                                    editMode,
                                    resolvedTokens,
                                })}
                            </div>
                        ) : (
                            <TokenButton
                                type={type}
                                editMode={editMode}
                                token={value}
                                showForm={showForm}
                                resolvedTokens={resolvedTokens}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default renderKeyValue;
