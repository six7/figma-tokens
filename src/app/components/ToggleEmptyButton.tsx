import * as React from 'react';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Button from './Button';

export default function ToggleEmptyButton() {
    const {showEmptyGroups} = useTokenState();
    const {toggleShowEmptyGroups} = useTokenDispatch();
    return (
        <div className="flex items-center justify-center mt-4">
            <Button variant="secondary" size="small" onClick={toggleShowEmptyGroups}>
                {showEmptyGroups ? 'Hide' : 'Show'} empty groups
            </Button>
        </div>
    );
}
