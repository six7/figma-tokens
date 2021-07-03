import React from 'react';
import {useDispatch} from 'react-redux';
import {Dispatch} from '@/app/store';
import Heading from '../Heading';
import Button from '../Button';
import Modal from '../Modal';

export default function ExportModal({onClose}) {
    const dispatch = useDispatch<Dispatch>();

    const handleSetDefault = () => {
        dispatch.tokenState.setDefaultTokens();
        onClose();
    };

    return (
        <Modal showClose isOpen close={onClose}>
            <div className="flex justify-center flex-col text-center space-y-4">
                <div className="space-y-2">
                    <Heading>Load a preset</Heading>
                    <p className="text-xs text-gray-600">
                        Override your current tokens by applying a preset. Want your preset featured here? Submit it via{' '}
                        <a
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                            href="https://github.com/six7/figma-tokens/issues"
                        >
                            GitHub
                        </a>
                    </p>
                    <Button variant="primary" onClick={handleSetDefault}>
                        Apply default preset
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
