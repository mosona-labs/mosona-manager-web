import { type ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

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
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import ApiServer from '@/api/server.ts';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';
import AgentInstall from '@/components/server/agent-install.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import IsRequired from '@/components/required.tsx';

const ReinstallDialog = ({
    id,
    mode,
    address,
    port,
    allow_monitor,
    allow_terminal,
    children,
}: {
    id: number;
    mode: 'active' | 'passive';
    address?: string;
    port?: number;
    allow_monitor: boolean;
    allow_terminal: boolean;
    children?: ReactNode;
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const [listenAddress, setListenAddress] = useState<string>(address || '');
    const [listenPort, setListenPort] = useState<number>(port || 0);
    useEffect(() => {
        setListenAddress(address || '');
        setListenPort(port || 0);
    }, [address, port]);
    const [enableMonitor, setEnableMonitor] = useState(allow_monitor);
    const [enableTerminal, setEnableTerminal] = useState(allow_terminal);
    useEffect(() => {
        setEnableMonitor(allow_monitor);
        setEnableTerminal(allow_terminal);
    }, [allow_monitor, allow_terminal]);

    // Command Dialog
    const [commandOpen, setCommandOpen] = useState(false);
    // Active
    const [host, setHost] = useState(address || '');
    const [portState, setPortState] = useState(port || 0);
    const [agentUid, setAgentUid] = useState('');
    const [publicKey, setPublicKey] = useState('');
    // Passive
    const [hub, setHub] = useState('');
    const [enrollToken, setEnrollToken] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const onSubmit = () => {
        if (mode === 'active' && (!listenAddress || !listenPort)) {
            toast.warning(t('pages.serverForm.reinstallEmpty'), {
                description: t('pages.serverForm.reinstallEmptyDesc'),
            });
            return;
        }

        // Submit logic here
        setIsLoading(true);
        ApiServer.reinstallAgent(id, mode === 'active' ? 1 : 2, listenAddress, listenPort)
            .then((res) => {
                toast.success(t('common.success'), {
                    description: t('pages.serverForm.reinstallSuccess'),
                });
                // Set command dialog data
                if (mode === 'active') {
                    setHost(res.data.host || '');
                    setPortState(res.data.port || 0);
                    setAgentUid(res.data.agent_uid || '');
                    setPublicKey(res.data.public_key || '');
                } else {
                    setHub(res.data.hub || '');
                    setEnrollToken(res.data.enroll_token || '');
                }
                // Open command dialog
                setOpen(false);
                setCommandOpen(true);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent
                    className="sm:max-w-[425px]"
                    onOpenAutoFocus={(event) => {
                        event.preventDefault();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{t('pages.serverForm.reinstallTitle')}</DialogTitle>
                        <DialogDescription>{t('pages.serverForm.reinstallDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className={'grid gap-3'}>
                        {mode === 'active' && (
                            <div className="flex flex-row gap-2">
                                <div className="grid gap-3 flex-3">
                                    <Label>
                                        {t('pages.serverForm.listenAddress')}
                                        <IsRequired />
                                    </Label>
                                    <Input
                                        defaultValue={address}
                                        onChange={(e) => {
                                            setListenAddress(e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="grid gap-3 flex-1">
                                    <Label>
                                        {t('pages.serverForm.port')}
                                        <IsRequired />
                                    </Label>
                                    <Input
                                        defaultValue={port}
                                        type={'number'}
                                        onChange={(e) => {
                                            setListenPort(Number(e.target.value));
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex flex-row justify-between mt-1 gap-3">
                            <Label>{t('pages.serverForm.monitorAccess')}</Label>
                            <Switch
                                checked={enableMonitor}
                                onCheckedChange={(v) => {
                                    setEnableMonitor(v);
                                    if (!v) setEnableTerminal(true);
                                }}
                            />
                        </div>
                        <div className="flex flex-row justify-between mt-1 gap-3">
                            <Label>{t('pages.serverForm.terminalAccess')}</Label>
                            <Switch
                                checked={enableTerminal}
                                onCheckedChange={(v) => {
                                    setEnableTerminal(v);
                                    if (!v) setEnableMonitor(true);
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        <LoadingButton isLoading={isLoading} onClick={onSubmit}>
                            {t('pages.serverForm.reinstallConfirm')}
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AgentInstall
                mode={mode}
                open={commandOpen}
                setOpen={setCommandOpen}
                allow_terminal={enableTerminal}
                allow_monitor={enableMonitor}
                agent_uid={agentUid}
                public_key={publicKey}
                host={host}
                port={portState}
                hub={hub}
                enroll_token={enrollToken}
            />
        </>
    );
};

export default ReinstallDialog;
