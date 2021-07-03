import {styled} from '@/stitches.config';
import * as Checkbox from '@radix-ui/react-checkbox';
import {CheckIcon} from '@radix-ui/react-icons';
import React from 'react';
import * as Label from '@radix-ui/react-label';

const StyledCheckbox = styled(Checkbox.Root, {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    boxShadow: 'inset 0 0 0 1px gainsboro',
    width: 15,
    height: 15,
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&:focus': {
        outline: 'none',
        boxShadow: 'inset 0 0 0 1px dodgerblue, 0 0 0 1px dodgerblue',
    },
});

export default ({checked, name = null, onChange, label = null}) => (
    <Label.Root htmlFor={name} className="flex flex-row space-x-2">
        <StyledCheckbox name={name} checked={checked} onCheckedChange={onChange}>
            <Checkbox.Indicator as={CheckIcon} />
        </StyledCheckbox>
        {label && <span className="text-xs font-bold cursor-pointer">{label}</span>}
    </Label.Root>
);
