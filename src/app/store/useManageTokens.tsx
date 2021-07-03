import {useDispatch, useSelector} from 'react-redux';
import {SingleToken, TokenType} from '@types/tokens';
import {StorageProviderType} from '@types/api';
import useRemoteTokens from './remoteTokens';
import {Dispatch, RootState} from '../store';

export default function useManageTokens() {
    const {editToken, createToken, deleteToken} = useDispatch<Dispatch>().tokenState;
    const {storageType} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();

    const {editRemoteToken, createRemoteToken, deleteRemoteToken} = useRemoteTokens();

    async function editSingleToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: {description?: string; type: TokenType};
        oldName?: string;
        shouldUpdateDocument?: boolean;
    }) {
        const {parent, name, value, options, oldName, shouldUpdateDocument = true} = data;
        dispatch.uiState.setLoading(true);
        const isLocal = storageType.provider === StorageProviderType.LOCAL;
        let shouldUpdate = true;
        if (!isLocal) {
            shouldUpdate = await editRemoteToken(data);
        }
        if (shouldUpdate) {
            editToken({
                parent,
                name,
                value,
                options,
                oldName,
                shouldUpdate: shouldUpdateDocument,
            });
        }
        dispatch.uiState.setLoading(false);
    }

    async function createSingleToken(data: {
        parent: string;
        name: string;
        value: SingleToken;
        options?: {description?: string; type: TokenType};
        newGroup?: boolean;
        shouldUpdateDocument?: boolean;
    }) {
        const {parent, name, value, options, newGroup = false, shouldUpdateDocument = true} = data;
        dispatch.uiState.setLoading(true);
        const isLocal = storageType.provider === StorageProviderType.LOCAL;
        let shouldUpdate = true;
        if (!isLocal) {
            shouldUpdate = await createRemoteToken(data);
        }
        if (shouldUpdate) {
            createToken({
                parent,
                name,
                value,
                options,
                newGroup,
                shouldUpdate: shouldUpdateDocument,
            });
        }
        dispatch.uiState.setLoading(false);
    }

    async function deleteSingleToken(data) {
        dispatch.uiState.setLoading(true);
        const isLocal = storageType.provider === StorageProviderType.LOCAL;
        if (!isLocal) {
            const response = await deleteRemoteToken(data);
        }
        deleteToken(data);
        dispatch.uiState.setLoading(false);
    }

    return {editSingleToken, createSingleToken, deleteSingleToken};
}
