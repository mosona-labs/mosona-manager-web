import { createRoot } from 'react-dom/client';
import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ThemeProvider } from './components/theme-provider.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import { UserProvider } from './context/useUser.tsx';
import { SessionProvider } from './context/useSession.tsx';

import SignIn from '@/page/auth/signin.tsx';

const App = lazy(() => import('@/app/index.tsx'));
const AdminApp = lazy(() => import('@/admin/app/index.tsx'));
const OAuth = lazy(() => import('@/page/oauth.tsx'));
const TwoFA = lazy(() => import('@/page/2fa.tsx'));
const Init = lazy(() => import('@/page/init/index.tsx'));

import './index.css';
import './style.css';
import './i18n';

createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={<SignIn />} />
                <Route path={'/oauth/:provider_id'} element={<OAuth />} />
                <Route path={'/2fa'} element={<TwoFA />} />
                <Route path="/init" element={<Init />} />
                <Route
                    path="/admin/*"
                    element={
                        <UserProvider>
                            <AdminApp />
                        </UserProvider>
                    }
                />
                <Route
                    path="*"
                    element={
                        <UserProvider>
                            <SessionProvider>
                                <App />
                            </SessionProvider>
                        </UserProvider>
                    }
                />
            </Routes>
        </BrowserRouter>
        <Toaster />
    </ThemeProvider>
);
