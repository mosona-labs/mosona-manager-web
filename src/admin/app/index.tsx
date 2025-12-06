import { Moon, SidebarIcon, Sun } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import NotFound from '@/page/notfound';
import { useTheme } from '@/components/theme-provider.tsx';
import { Button } from '@/components/ui/button.tsx';
import User from '@/app/user.tsx';
import Sidebar from '@/admin/app/sidebar.tsx';
import Dashboard from '@/admin/page/dashboard';
import Users from '@/admin/page/users';
import Register from '@/admin/page/settings/register';
import OAuth from '@/admin/page/settings/oauth';
import { SettingsProvider } from '@/admin/page/settings/useSettings.tsx';
import General from '@/admin/page/settings/general';
import Email from '@/admin/page/settings/email';

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
                <SettingsProvider>
                    <Routes>
                        <Route path={'/'} element={<Dashboard />} />
                        <Route path={'/users'} element={<Users />} />
                        {/*Settings*/}
                        <Route path={'/settings/general'} element={<General />} />
                        <Route path={'/settings/email'} element={<Email />} />
                        <Route path={'/settings/register'} element={<Register />} />
                        <Route path={'/settings/oauth'} element={<OAuth />} />
                        {/* Not Found */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </SettingsProvider>
            </div>
        </div>
    );
}

export default AdminApp;
