import { useState } from 'react';
import { toast } from 'sonner';

import { Switch } from '@/components/ui/switch.tsx';
import { useUser } from '@/context/useUser.tsx';
import { ToastError } from '@/utils/toast.ts';
import EnableTOTP from '@/components/totp/enable.tsx';
import ApiUser from '@/api/user.ts';
import TwoFA from '@/components/2fa.tsx';

const TOTPCard = () => {
    const { user, refresh } = useUser();

    // Dialog
    const [openEnableTOTP, setOpenEnableTOTP] = useState(false);

    const [locked, setLocked] = useState<boolean>(false);

    const callback = () =>
        refresh()
            .catch(ToastError)
            .finally(() => {
                setLocked(false);
            });

    const [tfaOpen, setTFAOpen] = useState(false);
    const disableTOTP = (code?: string) => {
        setLocked(true);
        ApiUser.disableTOTP(code)
            .then(() => {
                toast.success('Success', {
                    description: 'Two-Factor Authentication (TOTP) has been disabled successfully.',
                });
                callback().then();
            })
            .catch((err) => {
                if (err.response.data.code === 'verify') {
                    setTFAOpen(true);
                } else ToastError(err);

                setLocked(false);
            });
    };

    return (
        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                        Two-Factor Authentication (TOTP)
                    </p>
                </div>
                <p className="text-xs text-muted-foreground">
                    Add an extra layer of security to your account using an authenticator app.
                </p>
            </div>
            <Switch
                checked={user?.totp_enabled}
                onCheckedChange={(v) => {
                    setLocked(true);
                    if (v) setOpenEnableTOTP(true);
                    else disableTOTP();
                }}
                disabled={locked}
            />

            {/*Enable*/}
            <EnableTOTP open={openEnableTOTP} setOpen={setOpenEnableTOTP} callback={callback} />
            {/*2FA*/}
            <TwoFA
                open={tfaOpen}
                setOpen={setTFAOpen}
                callback={(code) => {
                    disableTOTP(code);
                }}
            />
        </div>
    );
};

export default TOTPCard;
