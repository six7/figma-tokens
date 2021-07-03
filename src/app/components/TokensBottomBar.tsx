import {track} from '@/utils/analytics';
import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';
import useTokens from '../store/useTokens';
import ApplySelector from './ApplySelector';

import Button from './Button';

export default function TokensBottomBar() {
    const {updateDocument} = useDispatch<Dispatch>().tokenState;
    const {editProhibited} = useSelector((state: RootState) => state.tokenState);

    const handleUpdate = async () => {
        track('Update Tokens');
        updateDocument();
    };
    const {pullStyles} = useTokens();

    const {createStylesFromTokens} = useTokens();

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white flex justify-between items-center p-2 border-t border-gray-200">
            <ApplySelector />
            <div className="space-x-2">
                <Button variant="secondary" onClick={pullStyles} disabled={editProhibited}>
                    Import
                </Button>
                <Button variant="secondary" onClick={createStylesFromTokens}>
                    Create Styles
                </Button>
                <Button variant="primary" onClick={handleUpdate}>
                    Update
                </Button>
            </div>
        </div>
    );
}
