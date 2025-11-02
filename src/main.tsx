import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import './style.css';

import { ThemeProvider } from './components/theme-provider.tsx';
import App from './app/index.tsx';
import SignIn from './page/auth/signin.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import { UserProvider } from './context/useUser.tsx';
import { SessionProvider } from './context/useSession.tsx';
import Init from './page/init/index.tsx';

createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={<SignIn />} />
                <Route path="/admin/" element={<div>empty</div>} />
                <Route path="/init" element={<Init />} />
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
