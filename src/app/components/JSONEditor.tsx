import * as React from 'react';
import YAML from 'js-yaml';
import Textarea from './Textarea';
import Heading from './Heading';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Button from './Button';
import Modal from './Modal';
import TabButton from './TabButton';

const schema = YAML.DEFAULT_SAFE_SCHEMA;
schema.compiledTypeMap.scalar['tag:yaml.org,2002:null'].represent.lowercase = function () {
    return '';
};

const JSONEditor = () => {
    const {tokenData} = useTokenState();
    const {setStringTokens, setEmptyTokens, setDefaultTokens, updateTokens, setLoading} = useTokenDispatch();
    const [activeToken] = React.useState('options');
    const [confirmModalVisible, showConfirmModal] = React.useState('');
    const [isJSON, setIsJSON] = React.useState(true);
    const [YAMLValue, setYAMLValue] = React.useState(undefined);

    let hasErrored = false;

    const handleUpdate = async () => {
        await setLoading(true);
        updateTokens();
    };

    const handleSetDefault = () => {
        setDefaultTokens();
        showConfirmModal('');
    };

    const handleSetEmpty = () => {
        setEmptyTokens();
        showConfirmModal('');
    };

    const handleChange = (val) => {
        setStringTokens({parent: activeToken, tokens: val});
    };

    const checkForError = (obj) => {
        if (hasErrored) return;
        Object.keys(obj).map((i) => {
            if (hasErrored) return;
            const child = obj[i];
            if (child === null) {
                hasErrored = true;
            } else if (typeof child === 'object') {
                checkForError(child);
            }
        });
    };

    const handleYMLChange = (val) => {
        setYAMLValue(val);
        const json = JSON.stringify(YAML.safeLoad(val), null, 2);
        hasErrored = false;
        checkForError(JSON.parse(json));
        if (!hasErrored) handleChange(json);
    };

    React.useEffect(() => {
        if (!tokenData.tokens[activeToken].hasErrored) {
            setYAMLValue(YAML.safeDump(JSON.parse(tokenData.tokens[activeToken].values)));
        }
    }, [tokenData.tokens[activeToken].values]);

    return (
        <div className="flex flex-col flex-grow">
            <Modal isOpen={confirmModalVisible === 'reset'} close={() => showConfirmModal('')}>
                <div className="flex justify-center flex-col text-center space-y-4">
                    <div className="space-y-2">
                        <Heading>Are you sure?</Heading>
                        <p className="text-xs">
                            You can undo this action by <br />
                            performing Undo in Figma itself.
                        </p>
                    </div>
                    <div className="space-x-4">
                        <Button variant="secondary" size="large" onClick={() => showConfirmModal('')}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="large" onClick={handleSetDefault}>
                            Yes, set to default.
                        </Button>
                    </div>
                </div>
            </Modal>
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
                        <Button variant="secondary" size="large" onClick={() => showConfirmModal('')}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="large" onClick={handleSetEmpty}>
                            Yes, clear all tokens.
                        </Button>
                    </div>
                </div>
            </Modal>
            <div className="flex flex-col justify-between items-center flex-grow">
                <div className="flex flex-col px-4 pb-4 w-full items-center flex-grow">
                    <div className="flex flex-row ml-auto space-x-2">
                        <TabButton name="json" label="JSON" active={isJSON} setActive={() => setIsJSON(true)} />
                        <TabButton name="yml" label="YML" active={!isJSON} setActive={() => setIsJSON(false)} />
                    </div>
                    {isJSON ? (
                        <Textarea
                            className="flex-grow"
                            placeholder="Enter JSON"
                            rows={20}
                            hasErrored={tokenData.tokens[activeToken].hasErrored}
                            onChange={handleChange}
                            value={tokenData.tokens[activeToken].values}
                        />
                    ) : (
                        <Textarea
                            className="flex-grow"
                            placeholder="Enter YML"
                            rows={20}
                            onChange={handleYMLChange}
                            hasErrored={tokenData.tokens[activeToken].hasErrored}
                            value={YAMLValue}
                        />
                    )}
                </div>
            </div>

            <div className="flex justify-between w-full px-4 bg-white">
                <div className="space-x-2 flex mr-2">
                    <Button variant="secondary" size="large" onClick={() => showConfirmModal('reset')}>
                        Fill with example data
                    </Button>
                    <Button variant="secondary" size="large" onClick={() => showConfirmModal('delete')}>
                        Clear
                    </Button>
                </div>
                <Button variant="primary" size="large" onClick={handleUpdate}>
                    Save & update
                </Button>
            </div>
        </div>
    );
};
export default JSONEditor;
