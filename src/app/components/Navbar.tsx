import * as React from 'react';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Icon from './Icon';
import Tooltip from './Tooltip';
import TabButton from './TabButton';

const Navbar = ({active, setActive}) => {
    const {colorMode} = useTokenState();
    const {toggleColorMode, pullStyles} = useTokenDispatch();
    return (
        <div className="sticky top-0 navbar bg-white flex items-center justify-between z-1 border-b border-gray-200">
            <div>
                <TabButton first name="tokens" label="Tokens" active={active === 'tokens'} setActive={setActive} />
                <TabButton name="json" label="JSON" active={active === 'json'} setActive={setActive} />
                <TabButton name="inspector" label="Inspect" active={active === 'inspector'} setActive={setActive} />
            </div>
            <div>
                <Tooltip variant="right" label="Import Styles">
                    <button className="button button-ghost" type="button" onClick={pullStyles}>
                        <Icon name="import" />
                    </button>
                </Tooltip>
                <Tooltip variant="right" label={colorMode ? 'Disable Color UI' : 'Enable Color UI'}>
                    <button className="button button-ghost" type="button" onClick={toggleColorMode}>
                        <Icon name={colorMode ? 'blend' : 'blendempty'} />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};

export default Navbar;
