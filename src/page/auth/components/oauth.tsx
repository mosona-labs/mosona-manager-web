import { useState } from 'react';

import ApiAuth, { type OAuthPublicType } from '@/api/auth.ts';
import OAuthIcon from '@/components/icons/oauth-icon.tsx';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';

const OAuthBtn = ({ info }: { info: OAuthPublicType }) => {
    const [isLoading, setIsLoading] = useState(false);

    const onOAuth = () => {
        setIsLoading(true);
        ApiAuth.oauthLogin(info.id)
            .then((res) => {
                window.localStorage.setItem('oauth_state', res.data.state);
                window.location.href = res.data.url;
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <LoadingButton
            isLoading={isLoading}
            variant={'ghost'}
            size={'lg'}
            className="flex flex-row gap-3 w-full justify-start px-4 rounded-b-none"
            onClick={onOAuth}
        >
            <OAuthIcon icon={info.icon} />
            Continue with {info.name}
        </LoadingButton>
    );
};

export default OAuthBtn;
