import {UpdateMode} from 'Types/state';
import {useDispatch, useSelector} from 'react-redux';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import {styled} from '@/stitches.config';
import {CheckIcon} from '@radix-ui/react-icons';
import {Dispatch, RootState} from '../store';
import IconChevronDown from './icons/IconChevronDown';

const StyledContent = styled(DropdownMenu.Content, {
    minWidth: 130,
    backgroundColor: '$contextMenuBackground',
    color: '$contextMenuForeground',
    borderRadius: '$contextMenu',
    padding: 5,
    boxShadow: '0px 5px 15px -5px hsla(206,22%,7%,.15)',
});

const itemStyles = {
    fontSize: 13,
    padding: '5px 10px 5px 25px',
    borderRadius: '$contextMenuItem',
    cursor: 'default',
    position: 'relative',

    '&:focus': {
        outline: 'none',
        backgroundColor: '$interaction',
        color: '$onInteraction',
    },
};

const StyledCheckboxItem = styled(DropdownMenu.CheckboxItem, itemStyles);

const StyledItemIndicator = styled(DropdownMenu.ItemIndicator, {
    position: 'absolute',
    left: 5,
});

const StyledSeparator = styled(DropdownMenu.Separator, {
    height: 1,
    backgroundColor: '$contextMenuSeperator',
    margin: 5,
});

const StyledRadioGroup = styled(DropdownMenu.RadioGroup, {});

const StyledRadioItem = styled(DropdownMenu.RadioItem, itemStyles);

export default function ApplySelector() {
    const {updateMode, updateOnChange, updateStyles} = useSelector((state: RootState) => state.settings);

    const {setUpdateMode, setUpdateOnChange, setUpdateStyles} = useDispatch<Dispatch>().settings;

    const handleApplySelection = () => {
        setUpdateMode(UpdateMode.SELECTION);
    };
    const handleApplyPage = () => {
        setUpdateMode(UpdateMode.PAGE);
    };
    const handleApplyDocument = () => {
        setUpdateMode(UpdateMode.DOCUMENT);
    };
    const handleUpdateOnChange = () => {
        setUpdateOnChange(!updateOnChange);
    };

    const handleUpdateStyles = () => {
        setUpdateStyles(!updateStyles);
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex p-2 bg-white border text-xs items-center space-x-2">
                <span>Apply to {updateMode}</span>
                <IconChevronDown />
            </DropdownMenu.Trigger>

            <StyledContent side="top">
                <StyledRadioGroup value={updateMode}>
                    <StyledRadioItem value={UpdateMode.PAGE} onSelect={handleApplyPage}>
                        <StyledItemIndicator>
                            <CheckIcon />
                        </StyledItemIndicator>
                        Apply to page
                    </StyledRadioItem>
                    <StyledRadioItem value={UpdateMode.DOCUMENT} onSelect={handleApplyDocument}>
                        <StyledItemIndicator>
                            <CheckIcon />
                        </StyledItemIndicator>
                        Apply to document
                    </StyledRadioItem>
                    <StyledRadioItem value={UpdateMode.SELECTION} onSelect={handleApplySelection}>
                        <StyledItemIndicator>
                            <CheckIcon />
                        </StyledItemIndicator>
                        Apply to selection
                    </StyledRadioItem>
                </StyledRadioGroup>

                <StyledSeparator />

                <StyledCheckboxItem checked={updateOnChange} onCheckedChange={handleUpdateOnChange}>
                    <StyledItemIndicator>
                        <CheckIcon />
                    </StyledItemIndicator>
                    Update on change
                </StyledCheckboxItem>
                <StyledCheckboxItem checked={updateStyles} onCheckedChange={handleUpdateStyles}>
                    <StyledItemIndicator>
                        <CheckIcon />
                    </StyledItemIndicator>
                    Update styles
                </StyledCheckboxItem>
            </StyledContent>
        </DropdownMenu.Root>
    );
}
