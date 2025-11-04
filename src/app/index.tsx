import { Moon, SidebarIcon, Sun } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import { Button } from '../components/ui/button';
import { useTheme } from '../components/theme-provider';
import Sidebar from '../components/sidebar/sideber';
import NotFound from '../page/notfound';
import Dashboard from '../page/dashboard/index';
import Terminal from '../page/terminal';
import About from '../page/about';
import CreateTeam from '../page/createTeam';

import ConnectChecker from './connect-checker';
import User from './user';

import Monitor from '@/page/monitor';
import Session from '@/page/session';
import Team from '@/page/team';

function App() {
    // Theme
    const { theme, setTheme } = useTheme();

    // Sidebar
    const [openSidebar, setOpenSidebar] = useState(true);

    return (
        <div className="flex flex-row h-screen overflow-hidden">
            <Sidebar open={openSidebar} setOpen={setOpenSidebar} />
            {/* Content Area */}
            <div className="flex-1 transition-all duration-300 ease-in-out">
                <div className="border-b h-18 flex items-center justify-between px-6">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setOpenSidebar(!openSidebar);
                        }}
                    >
                        <SidebarIcon />
                    </Button>
                    <div className="flex flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setTheme(theme === 'light' ? 'dark' : 'light');
                            }}
                        >
                            {theme === 'light' ? <Moon /> : <Sun />}
                        </Button>
                        <ConnectChecker />
                        <User />
                    </div>
                </div>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/:id/monitor" element={<Monitor />} />
                    <Route path="/terminal" element={<Terminal />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/about" element={<About />} />
                    {/* Create Team */}
                    <Route path="/create-team" element={<CreateTeam />} />
                    {/* Session */}
                    <Route path="/session/:id" element={<Session />} />
                    {/* Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
