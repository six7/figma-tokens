import * as React from 'react';
import {useSelector} from 'react-redux';
import JSONEditor from './JSONEditor';
import SyncSettings from './SyncSettings';
import Settings from './Settings';
import Inspector from './Inspector';
import Tokens from './Tokens';
import StartScreen from './StartScreen';
import Navbar from './Navbar';
import LoadingBar from './LoadingBar';
import Footer from './Footer';
import Initiator from './Initiator';
import Changelog from './Changelog';
import ImportedTokensDialog from './ImportedTokensDialog';
import {RootState} from '../store';

const App = () => {
    const activeTab = useSelector((state: RootState) => state.uiState.activeTab);

    return (
        <>
            <Initiator />
            <LoadingBar />
            <div className="h-full flex flex-col">
                <div className="flex-grow flex flex-col">
                    {activeTab !== 'start' && <Navbar />}
                    {activeTab === 'start' && <StartScreen />}
                    <Tokens isActive={activeTab === 'tokens'} />
                    {activeTab === 'json' && <JSONEditor />}
                    {activeTab === 'inspector' && <Inspector />}
                    {activeTab === 'syncsettings' && <SyncSettings />}
                    {activeTab === 'settings' && <Settings />}
                </div>
                <Footer />
                <Changelog />
                <ImportedTokensDialog />
            </div>
        </>
    );
};

export default App;
