import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';
import EditTokenForm from './EditTokenForm';
import Modal from './Modal';

const EditTokenFormModal = () => {
    const {editToken} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();

    const handleReset = () => {
        dispatch.uiState.setShowEditForm(false);
    };

    return (
        <Modal large isOpen close={handleReset} title={editToken.isPristine ? `New Token` : editToken.initialName}>
            <EditTokenForm />
        </Modal>
    );
};

export default EditTokenFormModal;
