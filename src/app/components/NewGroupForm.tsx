import * as React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import {useTokenDispatch} from '../store/TokenContext';
import useManageTokens from '../store/useManageTokens';
import Input from './Input';
import Modal from './Modal';

const NewGroupForm = ({path}) => {
    const title = 'Create new group';
    const [name, setName] = React.useState('');
    const {setShowNewGroupForm} = useTokenDispatch();
    const {activeTokenSet} = useSelector((state: RootState) => state.tokenState);
    const {createSingleToken} = useManageTokens();

    const handleChange = (e) => {
        e.persist();
        setName(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        createSingleToken({
            parent: activeTokenSet,
            name: [path, name].join('.'),
            value: {},
            newGroup: true,
        });

        setShowNewGroupForm(false);
    };

    const handleReset = () => {
        setShowNewGroupForm(false);
    };

    return (
        <Modal isOpen close={handleReset} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4 flex flex-col justify-start">
                <Input required full label="Name" value={name} onChange={handleChange} type="text" name="name" />

                <div className="flex space-x-2 justify-end">
                    <button className="button button-link" type="button" onClick={handleReset}>
                        Cancel
                    </button>
                    <button className="button button-primary" type="submit">
                        Create
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default NewGroupForm;
