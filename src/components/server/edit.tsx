import { type Dispatch, type FormEvent, type SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CircleSlash, InfoIcon, Loader, MonitorCheck, Plug, Plus } from 'lucide-react';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { DatePicker } from '../date-picker';
import { Card, CardContent } from '../ui/card';

import { useUser } from '@/context/useUser';
import ApiServer from '@/api/server';
import { ToastError } from '@/utils/toast';
import LoadingButton from '@/components/loading-button.tsx';
import AddKey from '@/page/keychain/components/add.tsx';
import HelpAgentMode from '@/components/server/help/agent-mode.tsx';
import HelpAutoRenew from '@/components/server/help/auto-renew.tsx';
import ReinstallDialog from '@/components/server/reinstall.tsx';
import { notifyServerMutation } from '@/utils/server-events';

const EditServer = ({
    open,
    onOpenChange,
    serverID,
}: {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
    serverID: number;
}) => {
    const { categories, keys } = useUser();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [mode, setMode] = useState<number>();
    const [agentUUID, setAgentUUID] = useState<string>();
    const [agentStatus, setAgentStatus] = useState<number>();
    const [agentVersion, setAgentVersion] = useState<string>();

    // form fields
    const [category, setCategory] = useState<number | undefined>(undefined);
    const [name, setName] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [port, setPort] = useState<number>(22);
    const [username, setUsername] = useState<string>('root');
    const [authType, setAuthType] = useState<'password' | 'key'>('password');
    const [password, setPassword] = useState<string>('');
    const [keyId, setKeyId] = useState<number>(0);
    const [allowMonitor, setAllowMonitor] = useState<boolean>(true);
    const [allowTerminal, setAllowTerminal] = useState<boolean>(true);
    const [weight, setWeight] = useState<number>(0);
    const [note, setNote] = useState<string>('');
    const [provider, setProvider] = useState<string>('');
    const [cycle, setCycle] = useState<number>(-1);
    const [startTime, setStartTime] = useState<Date | undefined>(undefined);
    const [endTime, setEndTime] = useState<Date | undefined>(undefined);
    const [amount, setAmount] = useState<string | undefined>(undefined);
    const [autoRenew, setAutoRenew] = useState<boolean>(false);
    const [bandwidth, setBandwidth] = useState<string>('');
    const [traffic, setTraffic] = useState<string>('');
    const [trafficType, setTrafficType] = useState<number>(-1);
    const [notePublic, setNotePublic] = useState<string>('');

    const [isInfoLoading, setIsInfoLoading] = useState<boolean>(false);
    useEffect(() => {
        if (!serverID || !open) return;
        setIsInfoLoading(true);
        ApiServer.info(serverID)
            .then((data) => {
                setCategory(data.data.category);
                setName(data.data.name || '');
                setAddress(data.data.address || '');
                setPort(data.data.port || 22);
                setUsername(data.data.username || 'root');
                setAllowMonitor(data.data.allow_monitor);
                setAllowTerminal(data.data.allow_terminal);
                setWeight(data.data.weight || 0);
                setNote(data.data.note || '');
                setProvider(data.data.provider || '');
                setCycle(data.data.cycle || -1);
                setStartTime(data.data.start_time ? new Date(data.data.start_time) : undefined);
                setEndTime(data.data.end_time ? new Date(data.data.end_time) : undefined);
                setAmount(data.data.amount || undefined);
                setAutoRenew(data.data.auto_renew || false);
                setBandwidth(data.data.bandwidth || '');
                setTraffic(data.data.traffic || '');
                setTrafficType(data.data.traffic_type || -1);
                setNotePublic(data.data.note_public || '');
                setKeyId(data.data.key_id || 0);
                if (data.data.key_id) {
                    setAuthType('key');
                }
                setMode(data.data.type);
                setAgentUUID(data.data.agent_uuid);
                setAgentStatus(data.data.agent_status);
                setAgentVersion(data.data.agent_version);
            })
            .catch(ToastError)
            .finally(() => {
                setIsInfoLoading(false);
            });
    }, [serverID, open]);

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();
        setIsLoading(true);

        ApiServer.edit(
            serverID,
            name,
            address,
            port,
            username,
            password,
            keyId,
            category || 0,
            allowMonitor,
            allowTerminal,
            weight,
            // Information
            note,
            provider,
            cycle,
            startTime || null,
            endTime || null,
            amount || '',
            autoRenew,
            bandwidth,
            traffic,
            trafficType,
            notePublic
        )
            .then(() => {
                onOpenChange(false);
                notifyServerMutation();
                toast.success('Server updated successfully', {
                    description: 'The changes will take effect shortly.',
                });
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl px-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader className="px-2">
                        <DialogTitle>Edit Server</DialogTitle>
                        <DialogDescription>
                            Edit Detail for server ID {serverID ?? '—'}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="md:flex flex-col max-h-[60vh] overflow-y-auto md:max-h-none md:flex-row relative">
                        {isInfoLoading && (
                            <div className="w-full h-full absolute flex justify-center items-center z-10 bg-background/70">
                                <Loader className="animate-spin text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 md:max-h-[75vh] overflow-y-auto px-2">
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label>Category</Label>
                                    <Select
                                        value={category ? category.toString() : undefined}
                                        onValueChange={(e) => setCategory(parseInt(e))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories &&
                                                categories.map((c) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-3">
                                    <Label>Name</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="LAX1"
                                    />
                                </div>
                                <div className={'bg-muted p-3 rounded-md space-y-2'}>
                                    <div className={'flex flex-row items-center gap-1'}>
                                        <Plug size={18} />
                                        {mode === 0
                                            ? 'SSH'
                                            : mode === 1
                                              ? 'Agent (Active)'
                                              : mode === 2
                                                ? 'Agent (Passive)'
                                                : 'Agent'}{' '}
                                        Mode
                                        <div className={'flex-1'} />
                                        {mode !== 0 && (
                                            <HelpAgentMode>
                                                <InfoIcon
                                                    size={14}
                                                    className={
                                                        'text-muted-foreground cursor-pointer'
                                                    }
                                                />
                                            </HelpAgentMode>
                                        )}
                                    </div>
                                    <p className={'text-xs text-muted-foreground'}>
                                        {mode === 0
                                            ? 'Connect to the server via SSH protocol.'
                                            : mode === 1
                                              ? 'Hub actively connects to the agent.'
                                              : mode === 2
                                                ? 'Agent passively connects to the hub.'
                                                : 'Agent-based server management.'}
                                    </p>
                                </div>
                                {(mode === 0 || mode === 1) && (
                                    <>
                                        <div className="flex flex-row gap-2">
                                            <div className="flex-2 grid gap-3">
                                                <Label>IP / Hostname</Label>
                                                <Input
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="1.2.3.4"
                                                    disabled={mode == 1}
                                                />
                                            </div>
                                            <div className="flex-1 grid gap-3">
                                                <Label>Port</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={65535}
                                                    step={1}
                                                    value={port}
                                                    onChange={(e) =>
                                                        setPort(parseInt(e.target.value || '22'))
                                                    }
                                                    placeholder="22"
                                                    disabled={mode == 1}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {mode === 0 && (
                                    <>
                                        <div className="grid gap-3">
                                            <Label>Username</Label>
                                            <Input
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="root"
                                            />
                                        </div>
                                        <Label>Authorization</Label>
                                        <Tabs
                                            value={authType}
                                            onValueChange={(v) => {
                                                setAuthType(v === 'password' ? 'password' : 'key');
                                                if (v === 'password') {
                                                    setKeyId(0);
                                                } else {
                                                    setPassword('');
                                                }
                                            }}
                                        >
                                            <TabsList className="w-full">
                                                <TabsTrigger value="password">Password</TabsTrigger>
                                                <TabsTrigger value="key">Key</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="password">
                                                <Input
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Password (Keep empty to not change)"
                                                />
                                            </TabsContent>
                                            <TabsContent value="key">
                                                {/*<Input*/}
                                                {/*    value={password}*/}
                                                {/*    onChange={(e) => setPassword(e.target.value)}*/}
                                                {/*    placeholder="Password (Keep empty to not change)"*/}
                                                {/*/>*/}
                                                <div className="flex flex-row gap-1.5">
                                                    <Select
                                                        value={keyId ? keyId.toString() : '0'}
                                                        onValueChange={(v) =>
                                                            setKeyId(parseInt(v || '0'))
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select Key" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="0">None</SelectItem>
                                                            {keys?.map((item) => (
                                                                <SelectItem
                                                                    key={item.id}
                                                                    value={item.id.toString()}
                                                                >
                                                                    {item.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <AddKey>
                                                        <Button variant="outline">
                                                            <Plus />
                                                        </Button>
                                                    </AddKey>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </>
                                )}
                                {mode === 1 && (
                                    <div className="grid gap-3">
                                        <Label>UUID</Label>
                                        <Input
                                            value={agentUUID}
                                            placeholder={'Not Initialized'}
                                            disabled
                                        />
                                    </div>
                                )}
                                {mode !== 0 && (
                                    <div className="grid gap-3">
                                        <Label>Agent</Label>
                                        <div
                                            className={
                                                'border p-4 rounded-md gap-3 flex flex-row items-center'
                                            }
                                        >
                                            {agentStatus === 0 ? (
                                                <>
                                                    <CircleSlash className={'text-orange-400'} />
                                                    <h1 className={'font-semibold'}>
                                                        Not Installed
                                                    </h1>
                                                </>
                                            ) : (
                                                <>
                                                    <MonitorCheck className={'text-green-400'} />
                                                    <div>
                                                        <h1 className={'font-semibold'}>
                                                            Installed
                                                        </h1>
                                                        <p
                                                            className={
                                                                'my-0 text-xs text-muted-foreground'
                                                            }
                                                        >
                                                            v{agentVersion}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            <div className={'flex-1'} />
                                            <ReinstallDialog
                                                id={serverID}
                                                mode={mode == 1 ? 'active' : 'passive'}
                                                allow_monitor={allowMonitor}
                                                allow_terminal={allowTerminal}
                                                address={address}
                                                port={port}
                                            >
                                                <Button
                                                    type={'button'}
                                                    size={'sm'}
                                                    variant={'outline'}
                                                    onClick={() => onOpenChange(false)}
                                                >
                                                    Reinstall
                                                </Button>
                                            </ReinstallDialog>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-row justify-between mt-1 gap-3">
                                    <Label>Monitor Access</Label>
                                    <Switch
                                        checked={allowMonitor}
                                        onCheckedChange={(v) => {
                                            setAllowMonitor(v);
                                            if (!v) setAllowTerminal(true);
                                        }}
                                    />
                                </div>
                                <div className="flex flex-row justify-between gap-3">
                                    <Label>Terminal Access</Label>
                                    <Switch
                                        checked={allowTerminal}
                                        onCheckedChange={(v) => {
                                            setAllowTerminal(v);
                                            if (!v) setAllowMonitor(true);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-s border-b md:mx-1 mb-4 mt-5 md:my-0 mx-2" />

                        <div className="flex-2 md:max-h-[75vh] overflow-y-auto mx-2">
                            <div className="flex flex-col gap-3">
                                <Label>Display</Label>
                                <Card className="py-4">
                                    <CardContent className="grid md:grid-cols-2 gap-3 px-4">
                                        <div className="grid gap-3">
                                            <Label>Weight (Sort)</Label>
                                            <Input
                                                type="number"
                                                value={weight}
                                                onChange={(e) =>
                                                    setWeight(parseInt(e.target.value || '0'))
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label>Note (Private)</Label>
                                            <Input
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Label>Billing Information</Label>
                                <Card className="py-4">
                                    <CardContent className="grid md:grid-cols-2 gap-3 px-4">
                                        <div className="grid gap-3">
                                            <Label>Provider / Data Center</Label>
                                            <Input
                                                value={provider}
                                                onChange={(e) => setProvider(e.target.value)}
                                                placeholder="AWS, DigitalOcean, etc."
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label>Cycle</Label>
                                            <Select
                                                value={cycle.toString()}
                                                onValueChange={(v) => setCycle(parseInt(v))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Cycle" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="-1">None</SelectItem>
                                                    <SelectItem value="0">One-Time</SelectItem>
                                                    <SelectItem value="1">Monthly</SelectItem>
                                                    <SelectItem value="2">Quarterly</SelectItem>
                                                    <SelectItem value="3">Semi-Annually</SelectItem>
                                                    <SelectItem value="4">Annually</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label>
                                                Start Time
                                                <Button
                                                    type="button"
                                                    variant={'outline'}
                                                    className="rounded-2xl text-xs py-0 px-2 h-5"
                                                    size="sm"
                                                    onClick={() => setStartTime(undefined)}
                                                >
                                                    Clear
                                                </Button>
                                            </Label>
                                            <DatePicker date={startTime} setDate={setStartTime} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label>
                                                End Time
                                                <Button
                                                    type="button"
                                                    variant={'outline'}
                                                    className="rounded-2xl text-xs py-0 px-2 h-5"
                                                    size="sm"
                                                    onClick={() => setEndTime(undefined)}
                                                >
                                                    Clear
                                                </Button>
                                            </Label>
                                            <DatePicker date={endTime} setDate={setEndTime} />
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label>
                                                Amount
                                                <Button
                                                    type="button"
                                                    variant={'outline'}
                                                    className="rounded-2xl text-xs py-0 px-2 h-5"
                                                    size="sm"
                                                    onClick={() => setAmount('0')}
                                                >
                                                    Free
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={'outline'}
                                                    className="rounded-2xl text-xs py-0 px-2 h-5"
                                                    size="sm"
                                                    onClick={() => setAmount('-1')}
                                                >
                                                    Pay as you go
                                                </Button>
                                            </Label>
                                            <Input
                                                value={amount ?? ''}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="€100"
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label>
                                                Auto Renew <HelpAutoRenew />
                                            </Label>
                                            <Switch
                                                checked={autoRenew}
                                                onCheckedChange={(v) => setAutoRenew(v)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Label>Network Information</Label>
                                <Card className="py-4">
                                    <CardContent className="grid md:grid-cols-2 gap-3 px-4">
                                        <div className="grid gap-3">
                                            <Label>Bandwidth</Label>
                                            <Input
                                                value={bandwidth}
                                                onChange={(e) => setBandwidth(e.target.value)}
                                                placeholder="1Gbps"
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label>Traffic</Label>
                                            <Input
                                                value={traffic}
                                                onChange={(e) => setTraffic(e.target.value)}
                                                placeholder="1TB/Mo"
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label>Traffic Type</Label>
                                            <Select
                                                value={trafficType.toString()}
                                                onValueChange={(v) => setTrafficType(parseInt(v))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="-1">None</SelectItem>
                                                    <SelectItem value="0">Inbound</SelectItem>
                                                    <SelectItem value="1">Outbound</SelectItem>
                                                    <SelectItem value="2">Both</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-3">
                                            <Label>Note (Public)</Label>
                                            <Input
                                                value={notePublic}
                                                onChange={(e) => setNotePublic(e.target.value)}
                                                placeholder="AS114514"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <LoadingButton type="submit" isLoading={isLoading}>
                            Save changes
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditServer;
