/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';
import {styled, keyframes} from '@/stitches.config';
import * as Tooltip from '@radix-ui/react-tooltip';

const scaleIn = keyframes({
    '0%': {opacity: 0, transform: 'scale(0.7)'},
    '100%': {opacity: 1, transform: 'scale(1)'},
});

const StyledContent = styled(Tooltip.Content, {
    borderRadius: '$contextMenu',
    padding: '5px 10px',
    fontSize: 12,
    maxWidth: '70vw',
    width: 'auto',
    backgroundColor: '$contextMenuBackground',
    color: '$contextMenuForeground',
    transformOrigin: 'var(--radix-tooltip-content-transform-origin)',
    animation: `${scaleIn} 0.1s ease-out`,
});

const StyledArrow = styled(Tooltip.Arrow, {
    fill: '$contextMenuBackground',
});
export default ({
    label,
    children,
    side = 'left',
}: {
    label: string | React.ReactElement;
    children: React.ReactElement;
    side?: 'left' | 'bottom';
}) => (
    <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger as="span">{children}</Tooltip.Trigger>
        <StyledContent side={side}>
            <StyledArrow offset={10} />
            {label}
        </StyledContent>
    </Tooltip.Root>
);
