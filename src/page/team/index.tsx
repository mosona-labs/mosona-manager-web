import type { TeamMemberType } from '@/api/team';

import { Plus, Loader2 } from 'lucide-react';
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

const Team = () => {
    const { user, team, refresh } = useUser();

    const [isLoading, setIsLoading] = useState(false);

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

    const onSubmit = () => {
        setIsLoading(true);
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
                refresh();
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24 relative">
            <div
                className="absolute w-full h-full bg-background/60 -m-5 z-10 flex justify-center transition-opacity"
                style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'all' : 'none' }}
            >
                <Loader2 className="animate-spin mt-[30vh]" size={32} />
            </div>
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">Current Team</h1>
                    <p className="opacity-65">Manage your team settings and members here</p>
                </div>
            </div>
            <div className="mt-4 flex flex-row gap-3">
                <div>
                    <div className="grid gap-3">
                        <Label>Team Avatar</Label>
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
            <Label className="mt-4 text-md">Members</Label>
            <div className="mt-2 flex flex-col gap-3">
                <Card className="gap-0 p-0">
                    {members.map((item, index) => (
                        <Member
                            key={index}
                            item={item}
                            index={index}
                            myUID={user?.id!}
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
                                        ('id' in m && 'id' in user && m.id === (user as any).id) ||
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
                            className={cn('py-7', members.length > 0 && 'border-t rounded-t-none')}
                        >
                            <Plus />
                        </Button>
                    </FindUser>
                </Card>
            </div>

            <div className="mt-4 flex flex-row justify-end items-center gap-3">
                <Button disabled={isLoading} onClick={onSubmit}>
                    Saved Change
                </Button>
            </div>
        </div>
    );
};

export default Team;
