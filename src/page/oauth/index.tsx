import { BookTextIcon, ChevronLeft, CircleX, LoaderCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import ApiAuth from '@/api/auth.ts';
import { ToastError } from '@/utils/toast.ts';
import { Button } from '@/components/ui/button.tsx';
import ApiUser from '@/api/user.ts';

const OAuth = () => {
    const navigate = useNavigate();

    const { provider_id } = useParams<{ provider_id: string }>();
    const code = new URLSearchParams(window.location.search).get('code');
    const state = window.localStorage.getItem('oauth_state') || '';

    const [error, setError] = useState('');

    useEffect(() => {
        if (!provider_id || isNaN(Number(provider_id)) || !code || !state) return;

        if (window.localStorage.getItem('oauth_link') == 'true') {
            window.localStorage.removeItem('oauth_link');
            ApiUser.linkOAuthIdentity(Number(provider_id), code, state)
                .then(() => {
                    toast.success('Success', {
                        description: 'OAuth identity linked successfully.',
                    });

                    navigate('/profile');
                })
                .catch((err) => {
                    ToastError(err);
                    setError(
                        err?.response?.data?.msg || 'An error occurred during OAuth processing.'
                    );
                });
        } else
            ApiAuth.oauthCallback(Number(provider_id), code, state)
                .then(() => {
                    toast.success('Success', {
                        description: 'Signed in successfully.',
                    });
                    navigate('/');
                })
                .catch((err) => {
                    ToastError(err);
                    setError(
                        err?.response?.data?.msg || 'An error occurred during OAuth processing.'
                    );
                });
    }, [provider_id, code, state]);

    return (
        <div className={'flex flex-col gap-2 h-screen justify-center items-center'}>
            {!provider_id || !code || !state || error ? (
                <CircleX className={'w-12 h-12'} />
            ) : (
                <LoaderCircle className={'w-12 h-12 animate-spin'} />
            )}
            <h1 className={'text-3xl'}>OAUTH</h1>
            <p className={'max-w-[80%] text-center'}>
                {!provider_id && 'Missing provider id.'}
                {!code && 'Missing authorization code.'}
                {!state && 'Missing oauth state.'}
                {error && error}
                {provider_id && code && state && !error ? (
                    'Waiting for processing...'
                ) : (
                    <div className={'justify-center mt-3 flex flex-row gap-2'}>
                        <Button onClick={() => navigate(-1)}>
                            <ChevronLeft />
                            Go Back
                        </Button>
                        <a target={'_blank'} href={'https://manager.mosona.cc'}>
                            <Button variant={'outline'}>
                                <BookTextIcon />
                                Documentation
                            </Button>
                        </a>
                    </div>
                )}
            </p>
        </div>
    );
};

export default OAuth;
