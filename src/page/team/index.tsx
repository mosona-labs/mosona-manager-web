import type { TeamEncryptedExportFile, TeamImportFile, TeamMemberType } from '@/api/team';

import { AlertTriangle, Download, Plus, Shield, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { notifyServerMutation } from '@/utils/server-events';
import EnableTOTP from '@/components/totp/enable';

const encryptedTeamExportFormat = 'mosona-team-export-v1';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isEncryptedTeamExport = (file: TeamImportFile): file is TeamEncryptedExportFile =>
    file.format === encryptedTeamExportFormat;

const Team = () => {
    const { t } = useTranslation();
    const { user, team, refresh, refreshCategories, refreshKeys } = useUser();

    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);

    const [members, setMembers] = useState<Array<TeamMemberType>>([]);
    const [exportOpen, setExportOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [exportTOTP, setExportTOTP] = useState('');
    const [exportPassword, setExportPassword] = useState('');
    const [importTOTP, setImportTOTP] = useState('');
    const [importPassword, setImportPassword] = useState('');
    const [importFile, setImportFile] = useState<TeamImportFile | null>(null);
    const [importFileName, setImportFileName] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [legacyImportWarningOpen, setLegacyImportWarningOpen] = useState(false);
    const [legacyImportServers, setLegacyImportServers] = useState<string[]>([]);
    const [unreadableExportOpen, setUnreadableExportOpen] = useState(false);
    const [unreadableCredential, setUnreadableCredential] = useState<{
        server_id: number;
        server_name: string;
        credential: string;
    } | null>(null);
    const [enableTOTPOpen, setEnableTOTPOpen] = useState(false);

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
    }, [team?.id]);

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
        try {
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
                    toast.success(t('common.success'), {
                        description: t('pages.team.updated'),
                    });
                    setIsLoading(true);
                    return refresh().catch(ToastError);
                })
                .catch(ToastError)
                .finally(() => {
                    setIsSubmitting(false);
                    setIsLoading(false);
                });
        } catch (error) {
            ToastError(error);
            setIsSubmitting(false);
            setIsLoading(false);
        }
    };

    const downloadEncryptedExport = (file: TeamEncryptedExportFile) => {
        const blob = new Blob([JSON.stringify(file, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${team?.name || 'team'}-export-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const credentialLabel = (credential: string) => {
        switch (credential) {
            case 'ssh_password':
                return t('pages.team.credentialSshPassword');
            case 'active_agent_private_key':
                return t('pages.team.credentialAgentKey');
            default:
                return credential;
        }
    };

    const handleExport = (skipUnreadableServers = false) => {
        if (!user?.totp_enabled) {
            setEnableTOTPOpen(true);
            return;
        }
        if (!exportTOTP.trim()) {
            toast.warning(t('pages.team.totpRequiredToast'));
            return;
        }
        if (exportPassword.length < 8) {
            toast.warning(t('pages.team.passwordMinLength'));
            return;
        }

        setIsExporting(true);
        ApiTeam.exportData(exportTOTP.trim(), exportPassword, skipUnreadableServers)
            .then((res) => {
                downloadEncryptedExport(res.data);
                setExportOpen(false);
                setUnreadableExportOpen(false);
                setUnreadableCredential(null);
                setExportTOTP('');
                setExportPassword('');
                toast.success(t('pages.team.exportSuccess'));
            })
            .catch((error) => {
                if (
                    !skipUnreadableServers &&
                    error?.response?.data?.code === 'unreadable_server_credential'
                ) {
                    const data = error.response.data.data;
                    if (data && typeof data.server_name === 'string') {
                        setUnreadableCredential({
                            server_id: Number(data.server_id),
                            server_name: data.server_name,
                            credential: typeof data.credential === 'string' ? data.credential : '',
                        });
                        setUnreadableExportOpen(true);
                        return;
                    }
                }
                ToastError(error);
            })
            .finally(() => {
                setIsExporting(false);
            });
    };

    const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        file.text()
            .then((text) => {
                const data: unknown = JSON.parse(text);
                if (!isRecord(data)) {
                    throw new Error(t('pages.team.invalidExport'));
                }

                if (data.format === encryptedTeamExportFormat) {
                    if (!data.ciphertext || !data.salt || !data.nonce) {
                        throw new Error(t('pages.team.invalidEncrypted'));
                    }
                } else {
                    setImportPassword('');
                }

                setImportFile(data);
                setImportFileName(file.name);
            })
            .catch((err) => {
                setImportFile(null);
                setImportFileName('');
                toast.error(t('pages.team.invalidFile'), {
                    description: err instanceof Error ? err.message : t('pages.team.parseError'),
                });
            });
    };

    const completeImport = (trustLegacySSHHostKeys: boolean) => {
        if (!importFile) return;

        const encrypted = isEncryptedTeamExport(importFile);
        setIsImporting(true);
        ApiTeam.importData(
            importTOTP.trim(),
            importFile,
            encrypted ? importPassword : undefined,
            trustLegacySSHHostKeys
        )
            .then(() => {
                setLegacyImportWarningOpen(false);
                setLegacyImportServers([]);
                setImportOpen(false);
                setImportTOTP('');
                setImportPassword('');
                setImportFile(null);
                setImportFileName('');
                notifyServerMutation();
                Promise.all([refresh(), refreshCategories(), refreshKeys()]).then(() => {
                    toast.success(t('pages.team.importSuccess'));
                });
            })
            .catch((error) => {
                if (
                    !trustLegacySSHHostKeys &&
                    error?.response?.data?.code === 'legacy_ssh_host_key_confirmation_required'
                ) {
                    const servers = error.response.data.data?.servers;
                    setLegacyImportServers(
                        Array.isArray(servers)
                            ? servers.filter(
                                  (server): server is string => typeof server === 'string'
                              )
                            : []
                    );
                    setLegacyImportWarningOpen(true);
                    return;
                }
                ToastError(error);
            })
            .finally(() => {
                setIsImporting(false);
            });
    };

    const handleImport = () => {
        if (!user?.totp_enabled) {
            setEnableTOTPOpen(true);
            return;
        }
        if (!importFile) {
            toast.warning(t('pages.team.selectFile'));
            return;
        }
        if (!importTOTP.trim()) {
            toast.warning(t('pages.team.totpRequiredToast'));
            return;
        }
        const encrypted = isEncryptedTeamExport(importFile);
        if (encrypted && importPassword.length < 8) {
            toast.warning(t('pages.team.passwordMinLength'));
            return;
        }

        completeImport(false);
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
                        <h1 className="text-2xl font-bold">{t('pages.team.title')}</h1>
                        <p className="opacity-65">{t('pages.team.description')}</p>
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
                            <Label>{t('pages.team.profilePicture')}</Label>
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
                                <Label htmlFor="name">{t('pages.team.name')}</Label>
                                <Input
                                    id="name"
                                    placeholder={t('pages.team.namePlaceholder')}
                                    value={teamName}
                                    onChange={(e) => {
                                        setTeamName(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description">
                                    {t('pages.team.descriptionLabel')}
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder={t('pages.team.descriptionPlaceholder')}
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
                    {t('pages.team.members')}
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
                                        toast.warning(t('common.warning'), {
                                            description: t('pages.team.cannotRemoveSelf'),
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

                {team.owner_id === user?.id && (
                    <Card
                        className="mt-6 p-4"
                        style={{
                            transition: 'opacity 400ms ease, transform 400ms ease',
                            transitionDelay: '260ms',
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'none' : 'translateY(8px)',
                        }}
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="flex-1">
                                <h2 className="text-sm font-semibold">
                                    {t('pages.team.importExport')}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {t('pages.team.importExportHint')}
                                </p>
                            </div>
                            <div className="flex flex-row gap-2">
                                <Button variant="outline" onClick={() => setExportOpen(true)}>
                                    <Upload />
                                    {t('pages.team.export')}
                                </Button>
                                <Button variant="outline" onClick={() => setImportOpen(true)}>
                                    <Download />
                                    {t('pages.team.import')}
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

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
                            <Button variant={'destructive'}>{t('pages.team.leaveTeam')}</Button>
                        </LeaveTeam>
                    )}
                    <LoadingButton isLoading={isSubmitting} onClick={onSubmit}>
                        {t('pages.team.save')}
                    </LoadingButton>
                </div>
            </div>

            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('pages.team.exportTitle')}</DialogTitle>
                        <DialogDescription>{t('pages.team.exportDescription')}</DialogDescription>
                    </DialogHeader>
                    {user?.totp_enabled ? (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="team-export-password">
                                    {t('pages.team.exportPassword')}
                                </Label>
                                <Input
                                    id="team-export-password"
                                    type="password"
                                    value={exportPassword}
                                    autoComplete="new-password"
                                    minLength={8}
                                    onChange={(e) => setExportPassword(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('pages.team.exportPasswordHint')}
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="team-export-totp">{t('pages.team.totpCode')}</Label>
                                <Input
                                    id="team-export-totp"
                                    value={exportTOTP}
                                    inputMode="numeric"
                                    maxLength={6}
                                    onChange={(e) => setExportTOTP(e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 rounded-lg border p-4">
                            <Shield className="mt-0.5 h-5 w-5 text-primary" />
                            <div className="grid gap-1">
                                <p className="text-sm font-medium">
                                    {t('pages.team.totpRequired')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t('pages.team.totpRequiredExport')}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        {user?.totp_enabled ? (
                            <LoadingButton isLoading={isExporting} onClick={() => handleExport()}>
                                {t('pages.team.export')}
                            </LoadingButton>
                        ) : (
                            <Button onClick={() => setEnableTOTPOpen(true)}>
                                {t('pages.team.enableTotp')}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('pages.team.importTitle')}</DialogTitle>
                        <DialogDescription>{t('pages.team.importDescription')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="team-import-file">
                                {t('pages.team.exportJsonFile')}
                            </Label>
                            <Input
                                id="team-import-file"
                                type="file"
                                accept="application/json,.json"
                                onChange={handleImportFile}
                            />
                            {importFileName && (
                                <p className="text-sm text-muted-foreground">
                                    {t('pages.team.selected', { name: importFileName })}
                                </p>
                            )}
                        </div>
                        {user?.totp_enabled ? (
                            <>
                                {(!importFile || isEncryptedTeamExport(importFile)) && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="team-import-password">
                                            {t('pages.team.exportPassword')}
                                        </Label>
                                        <Input
                                            id="team-import-password"
                                            type="password"
                                            value={importPassword}
                                            autoComplete="current-password"
                                            minLength={8}
                                            onChange={(e) => setImportPassword(e.target.value)}
                                        />
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="team-import-totp">
                                        {t('pages.team.totpCode')}
                                    </Label>
                                    <Input
                                        id="team-import-totp"
                                        value={importTOTP}
                                        inputMode="numeric"
                                        maxLength={6}
                                        onChange={(e) => setImportTOTP(e.target.value)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex items-start gap-3 rounded-lg border p-4">
                                <Shield className="mt-0.5 h-5 w-5 text-primary" />
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium">
                                        {t('pages.team.totpRequired')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t('pages.team.totpRequiredImport')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        {user?.totp_enabled ? (
                            <LoadingButton
                                variant="destructive"
                                isLoading={isImporting}
                                onClick={handleImport}
                            >
                                {t('pages.team.importOverwrite')}
                            </LoadingButton>
                        ) : (
                            <Button onClick={() => setEnableTOTPOpen(true)}>
                                {t('pages.team.enableTotp')}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={legacyImportWarningOpen} onOpenChange={setLegacyImportWarningOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            {t('pages.team.legacySSHImportTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('pages.team.legacySSHImportDescription', {
                                count: legacyImportServers.length,
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    {legacyImportServers.length > 0 && (
                        <div className="max-h-40 overflow-y-auto rounded border bg-muted/30 p-3">
                            <ul className="grid gap-1 text-sm">
                                {legacyImportServers.map((server, index) => (
                                    <li key={`${server}-${index}`} className="break-all">
                                        {server}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <p className="text-sm text-destructive">
                        {t('pages.team.legacySSHImportRisk')}
                    </p>
                    <div className="grid gap-2">
                        <Label htmlFor="team-import-risk-totp">{t('pages.team.totpCode')}</Label>
                        <Input
                            id="team-import-risk-totp"
                            value={importTOTP}
                            inputMode="numeric"
                            maxLength={6}
                            onChange={(e) => setImportTOTP(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        <LoadingButton
                            variant="destructive"
                            isLoading={isImporting}
                            onClick={() => completeImport(true)}
                        >
                            {t('pages.team.legacySSHImportAccept')}
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={unreadableExportOpen} onOpenChange={setUnreadableExportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            {t('pages.team.unreadableCredentialTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('pages.team.unreadableCredentialDescription', {
                                credential: credentialLabel(unreadableCredential?.credential || ''),
                                name: unreadableCredential?.server_name || '',
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {t('pages.team.unreadableCredentialHint')}
                    </p>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        <LoadingButton isLoading={isExporting} onClick={() => handleExport(true)}>
                            {t('pages.team.unreadableCredentialSkip')}
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EnableTOTP
                open={enableTOTPOpen}
                setOpen={setEnableTOTPOpen}
                callback={() => {
                    refresh().then();
                }}
            />
        </div>
    );
};

export default Team;
