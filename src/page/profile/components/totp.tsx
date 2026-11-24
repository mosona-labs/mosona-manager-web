import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Switch } from '@/components/ui/switch.tsx';
import { useUser } from '@/context/useUser.tsx';
import { ToastError } from '@/utils/toast.ts';
import EnableTOTP from '@/components/totp/enable.tsx';
import DisableTOTP from '@/components/totp/disable.tsx';

const TOTPCard = () => {
    const { t } = useTranslation();
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

    const [openDisableTOTP, setOpenDisableTOTP] = useState(false);
    const setDisableOpen = (open: boolean) => {
        setOpenDisableTOTP(open);
        if (!open) setLocked(false);
    };

    return (
        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{t('pages.profile.totp')}</p>
                </div>
                <p className="text-xs text-muted-foreground">{t('pages.profile.totpDesc')}</p>
            </div>
            <Switch
                checked={user?.totp_enabled}
                onCheckedChange={(v) => {
                    setLocked(true);
                    if (v) setOpenEnableTOTP(true);
                    else setOpenDisableTOTP(true);
                }}
                disabled={locked}
            />

            {/*Enable*/}
            <EnableTOTP open={openEnableTOTP} setOpen={setOpenEnableTOTP} callback={callback} />
            {openDisableTOTP && <DisableTOTP open setOpen={setDisableOpen} callback={callback} />}
        </div>
    );
};

export default TOTPCard;
