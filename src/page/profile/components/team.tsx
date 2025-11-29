import { useState } from 'react';
import { toast } from 'sonner';

import { type TeamType } from '@/api/team.ts';
import TeamAvatar from '@/components/team-avatar.tsx';
import { Button } from '@/components/ui/button.tsx';
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
import { Input } from '@/components/ui/input.tsx';
import LoadingButton from '@/components/loading-button.tsx';

const TeamCard = ({ team }: { team: TeamType }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const leaveTeam = () => {
        if (confirmText !== team.name) {
            toast.warning('Team name does not match', {
                description: 'Please type the team name correctly to confirm.',
            });
        }

        setIsLoading(true);
    };

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
            <TeamAvatar color={team.color} name={team.name} imageUrl={team.image} />
            <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{team.name}</p>
                <p className="text-xs text-muted-foreground">
                    Created on {new Date(team.created_at).toLocaleDateString()}
                </p>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">Leave</Button>
                </DialogTrigger>
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
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant={'destructive'}>Leave Team</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Confirm Leaving Team "{team.name}"</DialogTitle>
                                    <DialogDescription>
                                        If you are the team owner, leaving the team will transfer
                                        ownership to another member and if there are no other
                                        members, the team will be deleted.
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
        </div>
    );
};

export default TeamCard;
