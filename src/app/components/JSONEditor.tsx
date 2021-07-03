import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import parseTokenValues from '@/utils/parseTokenValues';
import Textarea from './Textarea';
import Heading from './Heading';
import Button from './Button';
import Modal from './Modal';
import TokenSetSelector from './TokenSetSelector';
import ExportModal from './modals/ExportModal';
import PresetModal from './modals/PresetModal';
import {Dispatch, RootState} from '../store';
import useTokens from '../store/useTokens';

const JSONEditor = () => {
    const {tokens, activeTokenSet, editProhibited} = useSelector((state: RootState) => state.tokenState);
    const {tokenType} = useSelector((state: RootState) => state.settings);
    const dispatch = useDispatch<Dispatch>();
    const {getStringTokens} = useTokens();

    const [confirmModalVisible, showConfirmModal] = React.useState('');
    const [exportModalVisible, showExportModal] = React.useState(false);
    const [presetModalVisible, showPresetModal] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [stringTokens, setStringTokens] = React.useState(JSON.stringify(tokens[activeTokenSet]?.values, null, 2));

    React.useEffect(() => {
        setError(null);
        setStringTokens(
            tokenType === 'array' ? JSON.stringify(tokens[activeTokenSet]?.values, null, 2) : getStringTokens()
        );
    }, [tokens, activeTokenSet, tokenType]);

    const handleUpdate = async () => {
        dispatch.tokenState.setJSONData(stringTokens);
    };

    const handleSetEmpty = () => {
        dispatch.tokenState.setEmptyTokens();
        showConfirmModal('');
    };

    const changeTokens = (val) => {
        setError(null);
        try {
            const parsedTokens = JSON.parse(val);
            parseTokenValues(parsedTokens);
        } catch (e) {
            console.log('Error parsing tokens', e);
            setError('Unable to read JSON');
        }
        setStringTokens(val);
    };

    return (
        <div className="flex flex-col flex-grow">
            {exportModalVisible && <ExportModal onClose={() => showExportModal(false)} />}
            {presetModalVisible && <PresetModal onClose={() => showPresetModal(false)} />}
            <Modal isOpen={confirmModalVisible === 'delete'} close={() => showConfirmModal('')}>
                <div className="flex justify-center flex-col text-center space-y-4">
                    <div className="space-y-2">
                        <Heading>Are you sure?</Heading>
                        <p className="text-xs">
                            You can undo this action by <br />
                            performing Undo in Figma itself.
                        </p>
                    </div>
                    <div className="space-x-4">
                        <Button variant="secondary" onClick={() => showConfirmModal('')}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSetEmpty}>
                            Yes, clear all tokens.
                        </Button>
                    </div>
                </div>
            </Modal>
            <TokenSetSelector />
            <div className="flex flex-col justify-between items-center flex-grow">
                <div className="flex flex-col p-4 pt-2 w-full items-center flex-grow">
                    <Textarea
                        isDisabled={editProhibited}
                        className="flex-grow"
                        placeholder="Enter JSON"
                        rows={21}
                        hasErrored={tokens[activeTokenSet]?.hasErrored}
                        onChange={changeTokens}
                        value={stringTokens}
                    />
                    {error && (
                        <div className="w-full font-bold p-2 text-xs rounded mt-2 bg-red-100 text-red-700">{error}</div>
                    )}
                </div>
            </div>

            <div className="flex justify-between w-full px-4 bg-white">
                <div className="space-x-2 flex mr-2">
                    <Button
                        id="load-preset"
                        disabled={editProhibited}
                        variant="secondary"
                        onClick={() => showPresetModal(true)}
                    >
                        Load preset
                    </Button>
                    <Button
                        id="clear-tokens"
                        disabled={editProhibited}
                        variant="secondary"
                        onClick={() => showConfirmModal('delete')}
                    >
                        Clear
                    </Button>
                </div>
                <div className="space-x-2 flex">
                    <Button id="export" variant="secondary" onClick={() => showExportModal(true)}>
                        Export
                    </Button>
                    <Button id="save-update-json" disabled={editProhibited} variant="primary" onClick={handleUpdate}>
                        Save & update
                    </Button>
                </div>
            </div>
        </div>
    );
};
export default JSONEditor;
