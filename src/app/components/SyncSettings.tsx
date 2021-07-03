/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {track} from '@/utils/analytics';
import {useDispatch, useSelector} from 'react-redux';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import {StorageProviderType} from '../../../types/api';
import Button from './Button';
import Heading from './Heading';
import ConfirmLocalStorageModal from './modals/ConfirmLocalStorageModal';
import StorageItem from './StorageItem';
import ProviderSelector from './StorageProviderSelector';
import EditStorageItemModal from './modals/EditStorageItemModal';
import CreateStorageItemModal from './modals/CreateStorageItemModal';
import useStorage from '../store/useStorage';
import {Dispatch, RootState} from '../store';

const SyncSettings = () => {
    const {api, localApiState, apiProviders, storageType} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();

    const {updateAfterApply} = useTokenState();
    const {toggleUpdateAfterApply} = useTokenDispatch();
    const {setStorageType} = useStorage();

    const [confirmModalVisible, showConfirmModal] = React.useState(false);
    const [editStorageItemModalVisible, setShowEditStorageModalVisible] = React.useState(Boolean(localApiState.new));
    const [createStorageItemModalVisible, setShowCreateStorageModalVisible] = React.useState(false);

    const handleEditClick = (provider) => {
        track('Edit Credentials');
        dispatch.uiState.setLocalApiState({
            id: provider.id,
            name: provider.name,
            provider: provider.provider,
            secret: provider.secret,
        });
        setShowEditStorageModalVisible(true);
    };

    const selectedRemoteProvider = () => {
        return [StorageProviderType.JSONBIN, StorageProviderType.ARCADE].includes(
            localApiState?.provider as StorageProviderType
        );
    };

    const storedApiProviders = () => {
        return apiProviders.filter((item) => item.provider === localApiState?.provider);
    };

    const storageProviderText = () => {
        switch (localApiState?.provider) {
            case StorageProviderType.JSONBIN:
                return (
                    <div>
                        Create an account at{' '}
                        <a href="https://jsonbin.io/" target="_blank" rel="noreferrer" className="underline">
                            JSONbin.io
                        </a>
                        , copy the Secret Key into the field, and click on save. If you or your team already have a
                        version stored, add the secret and the corresponding ID.{' '}
                        <a
                            href="https://docs.tokens.studio/sync"
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                        >
                            Read more on docs.tokens.studio
                        </a>
                    </div>
                );
            case StorageProviderType.ARCADE:
                return (
                    <div>
                        <a href="https://usearcade.com" target="_blank" className="underline" rel="noreferrer">
                            Arcade
                        </a>{' '}
                        is currently in Early Access. If you have an Arcade account, use your project ID and your API
                        key to gain access. For now, just the Read-Only mode is supported.
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col flex-grow">
            {confirmModalVisible && (
                <ConfirmLocalStorageModal
                    isOpen={confirmModalVisible}
                    onClose={showConfirmModal}
                    onSuccess={() => {
                        dispatch.uiState.setLocalApiState({provider: StorageProviderType.LOCAL});
                        setStorageType({
                            provider: {provider: StorageProviderType.LOCAL},
                            bool: true,
                        });
                        showConfirmModal(false);
                    }}
                />
            )}
            {editStorageItemModalVisible && (
                <EditStorageItemModal
                    isOpen={editStorageItemModalVisible}
                    onClose={() => setShowEditStorageModalVisible(false)}
                    initialValue={localApiState}
                    onSuccess={() => {
                        setShowEditStorageModalVisible(false);
                    }}
                />
            )}
            {createStorageItemModalVisible && (
                <CreateStorageItemModal
                    isOpen={createStorageItemModalVisible}
                    onClose={() => setShowCreateStorageModalVisible(false)}
                    onSuccess={() => setShowCreateStorageModalVisible(false)}
                />
            )}
            <div className="p-4 space-y-4 border-b">
                <div className="space-y-4">
                    <Heading>Token Storage</Heading>
                    <div className="flex flex-row gap-2">
                        <ProviderSelector
                            isActive={localApiState?.provider === StorageProviderType.LOCAL}
                            isStored={storageType?.provider === StorageProviderType.LOCAL}
                            onClick={() =>
                                storageType?.provider === StorageProviderType.LOCAL ? null : showConfirmModal(true)
                            }
                            text="Local document"
                            id={StorageProviderType.LOCAL}
                        />
                        <ProviderSelector
                            isActive={localApiState?.provider === StorageProviderType.JSONBIN}
                            isStored={storageType?.provider === StorageProviderType.JSONBIN}
                            onClick={() => {
                                dispatch.uiState.setLocalApiState({
                                    name: '',
                                    secret: '',
                                    id: '',
                                    provider: StorageProviderType.JSONBIN,
                                });
                            }}
                            text="JSONbin"
                            id={StorageProviderType.JSONBIN}
                        />
                    </div>
                </div>
                {selectedRemoteProvider() && (
                    <>
                        <div className="text-gray-600 text-xxs">{storageProviderText()}</div>
                        <Button
                            id="button-add-new-credentials"
                            variant="secondary"
                            onClick={() => {
                                track('Add Credentials', {provider: localApiState.provider});
                                setShowCreateStorageModalVisible(true);
                            }}
                        >
                            Add new credentials
                        </Button>

                        {storedApiProviders().length > 0 && (
                            <div className="space-y-4">
                                {api?.provider === localApiState.provider && (
                                    <StorageItem
                                        provider={api.provider}
                                        id={api.id}
                                        name={api.name}
                                        secret={api.secret}
                                    />
                                )}
                                {storedApiProviders().length > 0 && (
                                    <details>
                                        <summary
                                            data-cy={`summary-${localApiState.provider}`}
                                            className="p-2 rounded bg-gray-100 cursor-pointer text-xs focus:outline-none hover:bg-gray-200 focus:bg-gray-200"
                                        >
                                            {storedApiProviders().length} providers stored on this device
                                        </summary>
                                        <div className="flex flex-row items-center justify-between">
                                            <Heading size="small">
                                                Stored providers for {localApiState.provider}
                                            </Heading>
                                            <div className="flex items-center switch">
                                                <input
                                                    className="switch__toggle"
                                                    type="checkbox"
                                                    id="updatemode"
                                                    checked={updateAfterApply}
                                                    onChange={() => toggleUpdateAfterApply(!updateAfterApply)}
                                                />
                                                <label className="text-xs switch__label" htmlFor="updatemode">
                                                    Update on apply
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {storedApiProviders().map((item) => (
                                                <StorageItem
                                                    key={`${item.provider}-${item.id}-${item.secret}`}
                                                    onEdit={() => handleEditClick(item)}
                                                    provider={item.provider}
                                                    id={item.id}
                                                    name={item.name}
                                                    secret={item.secret}
                                                />
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SyncSettings;
