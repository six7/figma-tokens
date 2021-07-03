import {track} from '@/utils/analytics';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';
import Button from './Button';
import Heading from './Heading';
import Icon from './Icon';
import Input from './Input';
import Modal from './Modal';
import TokenSetItem from './TokenSetItem';
import Tooltip from './Tooltip';

export default function TokenSetSelector() {
    const {tokens, editProhibited} = useSelector((state: RootState) => state.tokenState);
    const dispatch = useDispatch<Dispatch>();

    const [showNewTokenSetFields, setShowNewTokenSetFields] = React.useState(false);
    const [showDeleteTokenSetModal, setShowDeleteTokenSetModal] = React.useState(false);
    const [showRenameTokenSetFields, setShowRenameTokenSetFields] = React.useState(false);
    const [newTokenSetName, handleNewTokenSetNameChange] = React.useState('');
    const [tokenSetMarkedForChange, setTokenSetMarkedForChange] = React.useState('');
    const [totalTokenSetArray, setTotalTokenSetArray] = React.useState(Object.keys(tokens));

    const tokenKeys = Object.keys(tokens);

    React.useEffect(() => {
        setTotalTokenSetArray(tokenKeys);
    }, [tokenKeys]);

    const stringOrder = JSON.stringify(totalTokenSetArray);

    React.useEffect(() => {
        setTotalTokenSetArray(totalTokenSetArray);
    }, [stringOrder, totalTokenSetArray]);

    const orderPositions = (array, from, to) => {
        const newArray = [...array];
        newArray.splice(to, 0, newArray.splice(from, 1)[0]);
        setTotalTokenSetArray(newArray);
    };

    const reorderSets = (from, to) => {
        track('Reordered token set');
        orderPositions(totalTokenSetArray, from, to);
    };

    const handleNewTokenSetSubmit = (e) => {
        e.preventDefault();
        track('Created token set', {name: newTokenSetName});
        dispatch.tokenState.addTokenSet(newTokenSetName.trim());
    };

    const handleDeleteTokenSet = (tokenSet) => {
        track('Deleted token set');
        setTokenSetMarkedForChange(tokenSet);
        setShowDeleteTokenSetModal(true);
    };

    const handleRenameTokenSet = (tokenSet) => {
        track('Renamed token set');
        setTokenSetMarkedForChange(tokenSet);
        setShowRenameTokenSetFields(true);
    };

    const handleConfirmDeleteTokenSet = () => {
        dispatch.tokenState.deleteTokenSet(tokenSetMarkedForChange);
        setTokenSetMarkedForChange('');
        setShowDeleteTokenSetModal(false);
    };

    const handleRenameTokenSetSubmit = (e) => {
        e.preventDefault();
        dispatch.tokenState.renameTokenSet({oldName: tokenSetMarkedForChange, newName: newTokenSetName.trim()});
        setTokenSetMarkedForChange('');
        setShowRenameTokenSetFields(false);
    };

    React.useEffect(() => {
        setShowNewTokenSetFields(false);
        handleNewTokenSetNameChange('');
    }, [tokens]);

    return (
        <div className="flex flex-row items-center gap-2 px-4 pt-2 pb-0 overflow-x-auto">
            <DndProvider backend={HTML5Backend}>
                {totalTokenSetArray.map((tokenSet, index) => (
                    <TokenSetItem
                        onDrop={() => dispatch.tokenState.setTokenSetOrder(totalTokenSetArray)}
                        onMove={reorderSets}
                        tokenSet={tokenSet}
                        index={index}
                        key={tokenSet}
                        onRename={handleRenameTokenSet}
                        onDelete={handleDeleteTokenSet}
                    />
                ))}
            </DndProvider>
            <Modal isOpen={showDeleteTokenSetModal} close={() => setShowDeleteTokenSetModal(false)}>
                <div className="flex justify-center flex-col text-center space-y-4">
                    <Heading>Are you sure?</Heading>
                    <div className="space-x-4">
                        <Button variant="secondary" size="large" onClick={() => setShowDeleteTokenSetModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="large" onClick={handleConfirmDeleteTokenSet}>
                            Yes, delete it.
                        </Button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={showRenameTokenSetFields} close={() => setShowRenameTokenSetFields(false)}>
                <div className="flex justify-center flex-col text-center space-y-4">
                    <Heading>Rename {tokenSetMarkedForChange}</Heading>
                    <form onSubmit={handleRenameTokenSetSubmit} className="space-y-4">
                        <Input
                            full
                            value={newTokenSetName}
                            onChange={(e) => handleNewTokenSetNameChange(e.target.value)}
                            type="text"
                            name="tokensetname"
                            required
                        />
                        <div className="space-x-4">
                            <Button variant="secondary" size="large" onClick={() => setShowRenameTokenSetFields(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="large">
                                Change
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal isOpen={showNewTokenSetFields} close={() => setShowNewTokenSetFields(false)}>
                <div className="flex justify-center flex-col text-center space-y-4">
                    <Heading>New set</Heading>
                    <form onSubmit={handleNewTokenSetSubmit} className="space-y-4">
                        <Input
                            full
                            value={newTokenSetName}
                            onChange={(e) => handleNewTokenSetNameChange(e.target.value)}
                            type="text"
                            name="tokensetname"
                            required
                        />
                        <div className="space-x-4">
                            <Button variant="secondary" size="large" onClick={() => setShowNewTokenSetFields(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="large">
                                Create
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Tooltip label="Add new token set">
                <button
                    className="button button-ghost flex-shrink-0"
                    type="button"
                    disabled={editProhibited}
                    onClick={() => setShowNewTokenSetFields(true)}
                >
                    <Icon name="add" />
                </button>
            </Tooltip>
        </div>
    );
}
