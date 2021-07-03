import React from 'react';
import {reduceToValues} from '@/plugin/tokenHelpers';
import {useSelector} from 'react-redux';
import {RootState} from '@/app/store';
import Modal from '../Modal';
import Heading from '../Heading';
import StorageItemForm from '../StorageItemForm';
import useRemoteTokens from '../../store/remoteTokens';

export default function CreateStorageItemModal({isOpen, onClose, onSuccess}) {
    const {tokens} = useSelector((state: RootState) => state.tokenState);
    const {localApiState} = useSelector((state: RootState) => state.uiState);
    const {addNewProviderItem} = useRemoteTokens();
    const [hasErrored, setHasErrored] = React.useState(false);
    const [formFields, setFormFields] = React.useState({id: '', name: '', secret: ''});

    const handleCreateNewClick = async () => {
        setHasErrored(false);
        const response = await addNewProviderItem({
            id: formFields.id,
            provider: localApiState.provider,
            secret: formFields.secret,
            tokens: reduceToValues(tokens),
            name: formFields.name,
            updatedAt: Date.now(),
        });
        if (response) {
            onSuccess();
        } else {
            setHasErrored(true);
        }
    };

    const handleChange = (e) => {
        setFormFields({...formFields, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCreateNewClick();
    };

    return (
        <Modal isOpen={isOpen} close={() => onClose(false)}>
            <div className="space-y-4">
                <Heading>Add new credentials</Heading>
                <StorageItemForm
                    isNew
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={() => onClose(false)}
                    values={formFields}
                    hasErrored={hasErrored}
                />
            </div>
        </Modal>
    );
}
