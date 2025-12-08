import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import ApiTeam, { type TeamType } from '@/api/team.ts';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import { ToastError } from '@/utils/toast.ts';
import { useUser } from '@/context/useUser.tsx';

const LeaveTeam = ({ team, children }: { team: TeamType; children: ReactNode }) => {
    const { refresh } = useUser();

    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const leaveTeam = () => {
        if (confirmText !== team.name) {
            toast.warning('Team name does not match', {
                description: 'Please type the team name correctly to confirm.',
            });
        }

        setIsLoading(true);
        ApiTeam.leave(team.id)
            .then(() => {
                toast.success('Successful', {
                    description: `You have left the team "${team.name}".`,
                });

                refresh().finally(() => {
                    setIsLoading(false);
                    setConfirmOpen(false);
                    setOpen(false);
                });
            })
            .catch((err) => {
                ToastError(err);
                setIsLoading(false);
            });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Leave Team "{team.name}"</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to leave this team? You will lose access to any
                        resources associated with it.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <DialogTrigger asChild>
                            <Button variant={'destructive'}>Leave Team</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Confirm Leaving Team "{team.name}"</DialogTitle>
                                <DialogDescription>
                                    If you are the team owner, leaving the team will transfer
                                    ownership to another member and if there are no other members,
                                    the team will be deleted.
                                    <br />
                                    <br />
                                    Please type{' '}
                                    <strong className={'text-red-500'}>{team.name}</strong> to
                                    confirm.
                                    <Input
                                        className={'mt-2'}
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                    />
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <LoadingButton
                                    variant={'destructive'}
                                    onClick={leaveTeam}
                                    isLoading={isLoading}
                                >
                                    Leave Team
                                </LoadingButton>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LeaveTeam;
