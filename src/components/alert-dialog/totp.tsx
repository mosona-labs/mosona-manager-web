import { useEffect, useState } from 'react';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useUser } from '@/context/useUser.tsx';
import EnableTOTP from '@/components/totp/enable.tsx';

const TOTPAlert = () => {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const [enableTOTPOpen, setEnableTOTPOpen] = useState(false);

    useEffect(() => {
        if (
            user &&
            !user.totp_enabled &&
            localStorage.getItem('disable_totp_reminder') !== String(user.id)
        ) {
            setTimeout(() => {
                setOpen(true);
            }, 500);
        }
    }, [user?.totp_enabled]);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Safety Recommendations</DialogTitle>
                    </DialogHeader>
                    <div className={'text-foreground/70'}>
                        <p>
                            Enabling Two-Factor Authentication (TOTP) significantly enhances the
                            security of your account by requiring a second form of verification
                            (offline) during login.
                        </p>
                        <p className="mt-2">
                            We strongly recommend enabling TOTP to protect your account from
                            unauthorized access.
                        </p>
                    </div>
                    <DialogFooter>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button tabIndex={2} variant={'secondary'}>
                                    Never show
                                </Button>
                            </DialogTrigger>
                            <DialogContent className={'w-[400px]'}>
                                <DialogHeader>
                                    <DialogTitle>Disable TOTP Reminder</DialogTitle>
                                </DialogHeader>
                                <div className={'text-foreground/70'}>
                                    <p>
                                        Are you sure you want to disable TOTP reminders? You can
                                        enable it again later in your profile settings.
                                    </p>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose>
                                        <Button
                                            onClick={() => {
                                                localStorage.setItem(
                                                    'disable_totp_reminder',
                                                    String(user?.id)
                                                );
                                                setOpen(false);
                                            }}
                                        >
                                            Disable Reminders
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <div className={'flex-1'} />
                        <DialogClose asChild>
                            <Button tabIndex={1} variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            tabIndex={0}
                            onClick={() => {
                                setEnableTOTPOpen(true);
                                setOpen(false);
                            }}
                        >
                            Enable TOTP
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/*Enable TOTP*/}
            <EnableTOTP open={enableTOTPOpen} setOpen={setEnableTOTPOpen} callback={() => {}} />
        </>
    );
};

export default TOTPAlert;
