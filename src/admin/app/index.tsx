import { Moon, SidebarIcon, Sun } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import NotFound from '@/page/notfound';
import { useTheme } from '@/components/theme-provider.tsx';
import { Button } from '@/components/ui/button.tsx';
import User from '@/app/user.tsx';
import Sidebar from '@/admin/app/sidebar.tsx';

function AdminApp() {
    // Theme
    const { theme, setTheme } = useTheme();

    // Sidebar
    const [openSidebar, setOpenSidebar] = useState(true);

    return (
        <div className="flex flex-row h-screen overflow-hidden">
            <Sidebar open={openSidebar} setOpen={setOpenSidebar} />
            {/* Content Area */}
            <div className="flex-1 transition-all duration-300 ease-in-out w-full min-w-0">
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
                        <User adminMode={true} />
                    </div>
                </div>
                <Routes>
                    {/* Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </div>
    );
}

export default AdminApp;
