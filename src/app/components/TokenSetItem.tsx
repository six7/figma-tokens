import React from 'react';
import {useDrop, useDrag, DropTargetMonitor} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {XYCoord} from 'dnd-core';
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';
import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';

interface DragItem {
    index: number;
    id: string;
    type: string;
}

enum ItemTypes {
    CARD = 'card',
}

export default function TokenSetItem({tokenSet, onMove, index, onRename, onDelete, onDrop}) {
    const {tokens, activeTokenSet, usedTokenSet, editProhibited} = useSelector((state: RootState) => state.tokenState);
    const dispatch = useDispatch<Dispatch>();

    const ref = React.useRef<HTMLDivElement>(null);

    const [{handlerId}, drop] = useDrop({
        accept: ItemTypes.CARD,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: DragItem, monitor: DropTargetMonitor) {
            if (!ref.current || editProhibited) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.left;

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging right
            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
                return;
            }

            // Dragging left
            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
                return;
            }

            // Time to actually perform the action
            onMove(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            // eslint-disable-next-line no-param-reassign
            item.index = hoverIndex;
        },
        drop() {
            if (editProhibited) return;
            onDrop();
        },
    });

    const [{isDragging}, drag, preview] = useDrag({
        item: {type: ItemTypes.CARD, tokenSet, index},
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    React.useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true});
    });

    const style = editProhibited
        ? {}
        : {
              cursor: 'move',
          };
    const opacity = isDragging ? 1 : 1;
    drag(drop(ref));

    return (
        <div className="flex-shrink-0" ref={ref} style={{...style, opacity}} data-handler-id={handlerId}>
            <ContextMenuTrigger id={`${tokenSet}-trigger`}>
                <button
                    key={tokenSet}
                    className={`font-bold items-center gap-2 focus:outline-none text-xs flex p-2 rounded border ${
                        activeTokenSet === tokenSet && 'border-blue-500 bg-blue-100'
                    }`}
                    type="button"
                    onClick={() => dispatch.tokenState.setActiveTokenSet(tokenSet)}
                >
                    <input
                        type="checkbox"
                        className="py-2 pl-2"
                        id={`toggle-${tokenSet}`}
                        checked={usedTokenSet.includes(tokenSet)}
                        onChange={() => dispatch.tokenState.toggleUsedTokenSet(tokenSet)}
                    />
                    {tokenSet}
                </button>
            </ContextMenuTrigger>
            <ContextMenu id={`${tokenSet}-trigger`} className="text-xs">
                <MenuItem disabled={editProhibited} onClick={() => onRename(tokenSet)}>
                    Rename
                </MenuItem>
                <MenuItem
                    disabled={editProhibited || Object.keys(tokens).length < 2}
                    onClick={() => onDelete(tokenSet)}
                >
                    Delete
                </MenuItem>
            </ContextMenu>
        </div>
    );
}
