/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useDebouncedCallback} from 'use-debounce';
import Checkbox from './Checkbox';
import Heading from './Heading';
import {RootState, Dispatch} from '../store';
import Input from './Input';

const SyncSettings = () => {
    const {uiWindow, ignoreFirstPartForStyles} = useSelector((state: RootState) => state.settings);
    const dispatch = useDispatch<Dispatch>();

    const debouncedChange = useDebouncedCallback(() => {
        dispatch.settings.triggerWindowChange();
    }, 1000);

    const handleSizeChange = (e) => {
        const value = Number(e.target.value.trim());
        if (!Number.isNaN(value)) {
            dispatch.settings.setWindowSize({
                ...uiWindow,
                [e.target.name]: value,
            });
            debouncedChange();
        }
    };

    const handleIgnoreChange = (bool) => {
        dispatch.settings.setIgnoreFirstPartForStyles(bool);
    };

    return (
        <div className="flex flex-col flex-grow">
            <div className="p-4 space-y-4 border-b">
                <div className="space-y-4">
                    <Heading>Window size</Heading>
                    <div className="flex flex-row space-x-2">
                        <Input
                            full
                            label="Width"
                            value={uiWindow.width}
                            onChange={handleSizeChange}
                            type="text"
                            name="width"
                            required
                        />
                        <Input
                            full
                            label="Height"
                            value={uiWindow.height}
                            onChange={handleSizeChange}
                            type="text"
                            name="height"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <Heading>Styles</Heading>
                    <div className="space-y-2">
                        <Checkbox
                            name="ignoreFirstPartForStyles"
                            checked={ignoreFirstPartForStyles}
                            onChange={handleIgnoreChange}
                            label="Ignore first part of token name for styles"
                        />
                        <div className="text-xs">
                            If active a token named <code className="p-1 -m-1 font-bold">colors.primary.500</code> will
                            become a color style of name <code className="p-1 -m-1 font-bold">primary/500</code>). Since
                            Version 53 you no longer need to prepend type to token names.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SyncSettings;
