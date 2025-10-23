import { Moon, SidebarIcon, Sun } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import { Button } from './components/ui/button';
import { useTheme } from './components/theme-provider';
import Sidebar from './components/sidebar/sideber';
import NotFound from './page/notfound';
import Dashboard from './page/dashboard/index';

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
                        <Button>Sign In</Button>
                    </div>
                </div>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/monitor" element={<div>Status Monitor</div>} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
