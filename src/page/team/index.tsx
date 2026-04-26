import type { TeamMemberType } from '@/api/team';

import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';

import AvatarEditor from '../../components/team/avatar';
import Member from '../../components/team/member';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/useUser';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import FindUser from '@/components/find-user';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ApiTeam from '@/api/team';
import { ToastError } from '@/utils/toast';
import LoadingButton from '@/components/loading-button.tsx';
import LeaveTeam from '@/components/leave-team.tsx';

const Team = () => {
    const { user, team, refresh } = useUser();

    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);

    const [members, setMembers] = useState<Array<TeamMemberType>>([]);

    const [teamName, setTeamName] = useState(team?.name || '');
    const [teamDescription, setTeamDescription] = useState(team?.description || '');
    const [teamAvatarUrl, setTeamAvatarUrl] = useState<string | null>(team?.image || null);
    const [teamColor, setTeamColor] = useState(team?.color || '#61390b');

    const avatarColorRef = useRef(team?.color || '#61390b');
    const avatarImageRef = useRef<File | string | null>(null);

    useEffect(() => {
        if (!team) return;
        setTeamName(team.name);
        setTeamDescription(team.description);
        setTeamColor(team.color || '#61390b');
        setTeamAvatarUrl(team.image || null);
        if (team.image) {
            avatarImageRef.current = '/avatars/' + team.image;
        }
    }, [team]);

    useEffect(() => {
        if (!team) return;
        setIsLoading(true);
        ApiTeam.info()
            .then((data) => {
                setMembers(data.data.members);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    }, [team]);

    useEffect(() => {
        let fadeInTimer: number | undefined;
        let fadeOutTimer: number | undefined;

        if (isLoading) {
            setShowSkeleton(true);
            setMounted(false);
        } else {
            fadeInTimer = window.setTimeout(() => setMounted(true), 60);
            fadeOutTimer = window.setTimeout(() => setShowSkeleton(false), 420);
        }

        return () => {
            if (fadeInTimer) window.clearTimeout(fadeInTimer);
            if (fadeOutTimer) window.clearTimeout(fadeOutTimer);
        };
    }, [isLoading]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const onSubmit = () => {
        setIsSubmitting(true);
        ApiTeam.edit(
            team!.id,
            teamName,
            teamDescription,
            avatarColorRef.current,
            avatarImageRef.current instanceof File ? avatarImageRef.current : null,
            JSON.stringify(
                members.map((m) => ({
                    id: m.id,
                    email: m.email,
                    role: m.role,
                }))
            )
        )
            .then(() => {
                toast.success('Success', { description: 'Team updated successfully.' });
                setIsLoading(true);
                refresh().then();
            })
            .catch(ToastError)
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    if (!team) return null;

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24 relative">
            {showSkeleton ? (
                <div
                    className="absolute inset-5 z-40 pointer-events-none overflow-hidden transition-opacity duration-400"
                    style={{ opacity: isLoading ? 1 : 0 }}
                >
                    <div className="mb-3">
                        <div className="h-8 w-40 rounded bg-muted-foreground/10 animate-pulse" />
                        <div className="mt-2 h-4 w-72 rounded bg-muted-foreground/8 animate-pulse" />
                    </div>
                    <div className="mt-4 flex flex-row gap-3">
                        <div className="w-[220px] h-[220px] rounded-2xl bg-muted-foreground/8 animate-pulse" />
                        <div className="flex-1 grid gap-4">
                            <div className="h-20 rounded bg-muted-foreground/8 animate-pulse" />
                            <div className="h-32 rounded bg-muted-foreground/8 animate-pulse" />
                        </div>
                    </div>
                    <div className="mt-6 h-4 w-24 rounded bg-muted-foreground/8 animate-pulse" />
                    <Card className="gap-3 mt-2 p-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-14 rounded bg-muted-foreground/8 animate-pulse"
                            />
                        ))}
                    </Card>
                </div>
            ) : null}

            <div style={{ transition: 'opacity 400ms ease', opacity: mounted ? 1 : 0 }}>
                <div
                    className="flex flex-row justify-between items-center mb-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(6px)',
                    }}
                >
                    <div>
                        <h1 className="text-2xl font-bold">Current Team</h1>
                        <p className="opacity-65">Manage your team settings and members here</p>
                    </div>
                </div>
                <div
                    className="mt-4 flex flex-row gap-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '80ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <div>
                        <div className="grid gap-3">
                            <Label>Profile picture</Label>
                            <AvatarEditor
                                name={teamName}
                                colorRef={avatarColorRef}
                                imageFileRef={avatarImageRef}
                                defaultColor={teamColor}
                                defaultImageFile={teamAvatarUrl}
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Mosona Team"
                                    value={teamName}
                                    onChange={(e) => {
                                        setTeamName(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Some text..."
                                    value={teamDescription}
                                    onChange={(e) => {
                                        setTeamDescription(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <Label
                    className="mt-4 text-md"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '140ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    Members
                </Label>
                <div
                    className="mt-2 flex flex-col gap-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '180ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <Card className="gap-0 p-0">
                        {members.map((item, index) => (
                            <Member
                                key={index}
                                item={item}
                                index={index}
                                myUID={user?.id!}
                                isOwner={team?.owner_id === item?.id}
                                onRemove={() => {
                                    if (members[index].id === user?.id) {
                                        toast.warning('Warning', {
                                            description: "You can't remove yourself from the team.",
                                        });
                                        return;
                                    }
                                    setMembers((prev) => {
                                        return prev.filter((_, i) => i !== index);
                                    });
                                }}
                                onChangeRole={(role) => {
                                    setMembers((prev) => {
                                        const newMembers = [...prev];
                                        newMembers[index].role = role;
                                        return newMembers;
                                    });
                                }}
                            />
                        ))}
                        <FindUser
                            onAdd={(user) => {
                                setMembers((prev) => {
                                    const exists = prev.some(
                                        (m) =>
                                            ('id' in m &&
                                                'id' in user &&
                                                m.id === (user as any).id) ||
                                            (m.email && user.email && m.email === user.email)
                                    );
                                    if (exists) return prev;
                                    return [
                                        ...prev,
                                        {
                                            ...user,
                                            role: 0,
                                        },
                                    ];
                                });
                            }}
                        >
                            <Button
                                variant={'ghost'}
                                className={cn(
                                    'py-7',
                                    members.length > 0 && 'border-t rounded-t-none'
                                )}
                            >
                                <Plus />
                            </Button>
                        </FindUser>
                    </Card>
                </div>

                <div
                    className="mt-4 flex flex-row justify-end items-center gap-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '220ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    {team && (
                        <LeaveTeam team={team}>
                            <Button variant={'destructive'}>Leave Team</Button>
                        </LeaveTeam>
                    )}
                    <LoadingButton isLoading={isSubmitting} onClick={onSubmit}>
                        Saved Change
                    </LoadingButton>
                </div>
            </div>
        </div>
    );
};

export default Team;
