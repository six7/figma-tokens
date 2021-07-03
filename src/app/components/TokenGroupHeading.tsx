import React from 'react';
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';
import {useDispatch, useSelector} from 'react-redux';
import Heading from './Heading';
import {Dispatch, RootState} from '../store';

export default function TokenGroupHeading({label, path, id}) {
    const {activeTokenSet, editProhibited} = useSelector((state: RootState) => state.tokenState);
    const {deleteToken} = useDispatch<Dispatch>().tokenState;

    const onDelete = () => {
        deleteToken({parent: activeTokenSet, path});
    };

    return (
        <div>
            <ContextMenuTrigger id={`group-heading-${path}-${label}-${id}`}>
                <Heading size="small">{label}</Heading>
            </ContextMenuTrigger>
            <ContextMenu id={`group-heading-${path}-${label}-${id}`} className="text-xs">
                <MenuItem disabled={editProhibited} onClick={onDelete}>
                    Delete
                </MenuItem>
            </ContextMenu>
        </div>
    );
}
