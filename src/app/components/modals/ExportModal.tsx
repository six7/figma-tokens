import React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '@/app/store';
import useTokens from '@/app/store/useTokens';
import Heading from '../Heading';
import Textarea from '../Textarea';
import Button from '../Button';
import Modal from '../Modal';

export default function ExportModal({onClose}) {
    const {tokens, activeTokenSet} = useSelector((state: RootState) => state.tokenState);
    const {getFormattedTokens} = useTokens();

    return (
        <Modal large isOpen close={onClose}>
            <div className="flex flex-col space-y-4 w-full">
                <Heading>Export</Heading>
                <p className="text-xs">
                    This is an early version of a tokens export, if you encounter any issues please raise an{' '}
                    <a
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                        href="https://github.com/six7/figma-tokens/issues"
                    >
                        issue
                    </a>
                    .
                </p>
                <Heading size="small">Output example</Heading>
                <Textarea
                    className="flex-grow"
                    rows={10}
                    isDisabled
                    hasErrored={tokens[activeTokenSet]?.hasErrored}
                    value={getFormattedTokens()}
                />
                <div className="space-x-4 flex justify-between">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        href={`data:text/json;charset=utf-8,${encodeURIComponent(getFormattedTokens())}`}
                        download="tokens.json"
                        variant="primary"
                        size="large"
                    >
                        Download
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
