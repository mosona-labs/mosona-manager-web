import type { TeamMemberType } from '@/api/team';

import { Plus, Terminal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import AvatarEditor from '../../components/team/avatar';
import Member from '../../components/team/member';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import FindUser from '@/components/find-user';
import ApiTeam from '@/api/team';
import { useUser } from '@/context/useUser';
import { ToastError } from '@/utils/toast';
import ApiUser from '@/api/user.ts';
import LoadingButton from '@/components/loading-button.tsx';
import { useSiteBranding } from '@/hooks/useSiteBranding';

const CreateTeam = () => {
    const { t } = useTranslation();
    const navigator = useNavigate();
    const { user, refresh } = useUser();
    const { title } = useSiteBranding();

    const avatarColorRef = useRef('#61390b');
    const avatarImageRef = useRef<File | null>(null);

    const [members, setMembers] = useState<Array<TeamMemberType>>([]);

    // Form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (user)
            setMembers([
                {
                    ...user,
                    role: 0,
                },
            ]);
    }, [user]);

    const [isLoading, setIsLoading] = useState(false);
    const handleCreateTeam = () => {
        if (!name) {
            toast.error(t('common.error'), { description: t('auth.required') });
            return;
        }
        setIsLoading(true);
        ApiTeam.create(
            name,
            description,
            avatarColorRef.current,
            avatarImageRef.current,
            JSON.stringify(
                members.map((m) => ({
                    id: m.id,
                    role: m.role,
                }))
            )
        )
            .then((res) => {
                toast.success(t('common.success'), {
                    description: t('pages.createTeam.created'),
                });

                ApiUser.setActiveTeam(res.data).finally(() => {
                    refresh().finally(() => {
                        navigator('/');
                    });
                });
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">{t('pages.createTeam.title')}</h1>
                    <p className="opacity-65">{t('pages.createTeam.description')}</p>
                </div>
            </div>
            <Alert variant="default">
                <Terminal />
                <AlertTitle>{t('pages.createTeam.heyThere')}</AlertTitle>
                <AlertDescription>{t('pages.createTeam.alert', { title })}</AlertDescription>
            </Alert>
            <div className="mt-4 flex flex-row gap-3">
                <div>
                    <div className="grid gap-3">
                        <Label>{t('pages.createTeam.profilePicture')}</Label>
                        <AvatarEditor
                            name={name}
                            colorRef={avatarColorRef}
                            imageFileRef={avatarImageRef}
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">{t('pages.createTeam.name')}</Label>
                            <Input
                                id="name"
                                placeholder={t('pages.createTeam.namePlaceholder')}
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">
                                {t('pages.createTeam.descriptionLabel')}
                            </Label>
                            <Textarea
                                id="description"
                                placeholder={t('pages.createTeam.descriptionPlaceholder')}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Label className="mt-4 text-md">{t('pages.createTeam.members')}</Label>
            <div className="mt-2 flex flex-col gap-3">
                <Card className="gap-0 p-0">
                    {members.map((item, index) => (
                        <Member
                            key={index}
                            item={item}
                            myUID={user?.id!}
                            index={index}
                            isOwner={false}
                            onRemove={() => {
                                if (members[index].id === user?.id) {
                                    toast.warning(t('common.warning'), {
                                        description: t('pages.createTeam.cannotRemoveSelf'),
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
                <LoadingButton isLoading={isLoading} onClick={handleCreateTeam}>
                    {t('pages.createTeam.create')}
                </LoadingButton>
            </div>
        </div>
    );
};

export default CreateTeam;
