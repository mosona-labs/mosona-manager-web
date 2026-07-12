import { createRoot } from 'react-dom/client';
import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ThemeProvider } from './components/theme-provider.tsx';
import { DirectionProvider } from './components/ui/direction.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import { UserProvider } from './context/useUser.tsx';
import { SessionProvider } from './context/useSession.tsx';
import { isRTLLanguage } from './i18n';

import SignIn from '@/page/auth/signin.tsx';

const App = lazy(() => import('@/app/index.tsx'));
const AdminApp = lazy(() => import('@/admin/app/index.tsx'));
const OAuth = lazy(() => import('@/page/oauth.tsx'));
const TwoFA = lazy(() => import('@/page/2fa.tsx'));
const Init = lazy(() => import('@/page/init/index.tsx'));

import './index.css';
import './style.css';
import './i18n';

function DirectionalProvider({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation();
    const direction = isRTLLanguage(i18n.resolvedLanguage || i18n.language || 'en') ? 'rtl' : 'ltr';
    return <DirectionProvider dir={direction}>{children}</DirectionProvider>;
}

createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <DirectionalProvider>
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
        </DirectionalProvider>
        <Toaster />
    </ThemeProvider>
);
