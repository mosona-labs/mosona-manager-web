import { Loader, Plus } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Card, CardContent } from '../ui/card';
import { DatePicker } from '../date-picker';
import AddCategory from '../category/add';

import { useUser } from '@/context/useUser';
import ApiServer, { type ServerAddRequest } from '@/api/server';
import { ToastError } from '@/utils/toast';
import IsRequired from '@/components/required.tsx';
import AddKey from '@/page/keychain/components/add.tsx';
import AgentModeDialog from '@/components/server/agent-mode.tsx';
import AgentInstall from '@/components/server/agent-install.tsx';

const AddServer = () => {
    const { categories, keys } = useUser();

    const [authType, setAuthType] = useState<'password' | 'key'>('password');

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Agent Install
    const [isInstallOpen, setIsInstallOpen] = useState(false);
    const [installConfig, setInstallConfig] = useState<{
        // Active
        agent_uid?: string;
        public_key?: string;
        host?: string;
        port?: number;
        // Passive
        hub?: string;
        enroll_token?: string;
    }>({});

    const [category, setCategory] = useState<number>();
    const [mode, setMode] = useState<'ssh' | 'agent'>('ssh');
    const [agentMode, setAgentMode] = useState<'active' | 'passive'>('active');

    // Access Permissions
    const [enableMonitor, setEnableMonitor] = useState(true);
    const [enableTerminal, setEnableTerminal] = useState(true);

    // Billing Information
    const [startTime, setStartTime] = useState<Date>();
    const [endTime, setEndTime] = useState<Date>();
    const [amount, setAmount] = useState<string>();

    useEffect(() => {
        if (categories && categories.length > 0) {
            setCategory(categories[0].id);
        }
    }, [categories]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const name = formData.get('name') as string;
        const category_id = category;
        const allow_monitor = formData.get('monitor') === 'on';
        const allow_terminal = formData.get('terminal') === 'on';
        const weight = parseInt(formData.get('weight') as string) || 0;
        // Information
        const note = formData.get('note') as string;
        const provider = formData.get('provider') as string;
        const cycle = parseInt(formData.get('cycle') as string);
        const bill_start_time = startTime;
        const bill_end_time = endTime;
        const bill_amount = formData.get('amount') as string;
        const auto_renew = formData.get('auto_renew') === 'on';
        const bandwidth = formData.get('bandwidth') as string;
        const traffic = formData.get('traffic') as string;
        const traffic_type = parseInt(formData.get('traffic_type') as string);
        const note_public = formData.get('note_public') as string;

        // SSH
        const host = formData.get('address') as string;
        const port = parseInt(formData.get('port') as string);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const key_id = authType === 'key' ? parseInt(formData.get('key') as string) || 0 : 0;

        let data: ServerAddRequest = {
            name,
            mode: mode === 'ssh' ? 0 : agentMode === 'active' ? 1 : 2,
            category_id: category_id || 0,
            allow_monitor,
            allow_terminal,
            weight,
            note,
            provider,
            cycle,
            start_time: bill_start_time || '',
            end_time: bill_end_time || '',
            amount: bill_amount,
            auto_renew,
            bandwidth,
            traffic,
            traffic_type,
            note_public,
        };
        if (mode === 'ssh') {
            data = {
                ...data,
                address: host,
                port,
                username,
                password,
                key_id,
            };
        } else if (agentMode === 'active') {
            data = {
                ...data,
                address: host,
                port,
            };
        }

        setIsLoading(true);
        ApiServer.add(data)
            .then((res) => {
                toast.success('Server added successfully');
                setOpen(false);
                if (mode === 'agent') {
                    setIsInstallOpen(true);
                    switch (agentMode) {
                        case 'passive':
                            return setInstallConfig({
                                hub: res.data.hub,
                                enroll_token: res.data.enroll_token,
                            });
                        case 'active':
                            return setInstallConfig({
                                agent_uid: res.data.agent_uid,
                                public_key: res.data.public_key,
                                host: res.data.host,
                                port: res.data.port,
                            });
                    }
                }
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus />
                        Add Server
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl px-4">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <DialogHeader className="px-2">
                            <DialogTitle>Add Server</DialogTitle>
                            <DialogDescription>
                                To add a new server for monitoring, please enter its details below.
                                Providing SSH information allows remote terminal access while
                                monitoring, but this is optional.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="md:flex flex-col max-h-[60vh] overflow-y-auto md:max-h-none md:flex-row">
                            <div className="flex-1 md:max-h-[75vh] overflow-y-auto px-2">
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name">Category</Label>
                                        <div className="flex flex-row gap-2">
                                            <Select
                                                name="category"
                                                value={category ? category.toString() : undefined}
                                                onValueChange={(e) => {
                                                    setCategory(parseInt(e));
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories &&
                                                        categories.map((category) => (
                                                            <SelectItem
                                                                key={category.id}
                                                                value={category.id.toString()}
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            <AddCategory>
                                                <Button variant={'outline'}>
                                                    <Plus />
                                                </Button>
                                            </AddCategory>
                                        </div>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="name">
                                            Name
                                            <IsRequired />
                                        </Label>
                                        <Input id="name" name="name" placeholder="LAX1" />
                                    </div>
                                    <Tabs
                                        value={mode}
                                        onValueChange={(e) =>
                                            setMode(e === 'ssh' ? 'ssh' : 'agent')
                                        }
                                    >
                                        <TabsList className="w-full">
                                            <TabsTrigger value="ssh">SSH</TabsTrigger>
                                            <TabsTrigger value="agent">Agent</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="ssh" className={'grid gap-4 mt-1'}>
                                            <div className="flex flex-row gap-2">
                                                <div className="flex-2 grid gap-3">
                                                    <Label htmlFor="host">
                                                        IP / Hostname
                                                        <IsRequired />
                                                    </Label>
                                                    <Input
                                                        id="host"
                                                        name="address"
                                                        placeholder="1.2.3.4"
                                                    />
                                                </div>
                                                <div className="flex-1 grid gap-3">
                                                    <Label htmlFor="port">
                                                        Port
                                                        <IsRequired />
                                                    </Label>
                                                    <Input
                                                        id="port"
                                                        name="port"
                                                        placeholder="22"
                                                        type="number"
                                                        min={1}
                                                        max={65535}
                                                        step={1}
                                                        defaultValue={22}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="username">
                                                    Username
                                                    <IsRequired />
                                                </Label>
                                                <Input
                                                    id="username"
                                                    name="username"
                                                    defaultValue="root"
                                                    placeholder="root"
                                                />
                                            </div>
                                            <Label htmlFor="auth">Authorization</Label>
                                            <Tabs
                                                id="auth"
                                                defaultValue="password"
                                                value={authType}
                                                onValueChange={(e) => {
                                                    setAuthType(
                                                        e === 'password' ? 'password' : 'key'
                                                    );
                                                }}
                                            >
                                                <TabsList className="w-full">
                                                    <TabsTrigger value="password">
                                                        Password
                                                    </TabsTrigger>
                                                    <TabsTrigger value="key">Key</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="password">
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        placeholder="Password"
                                                    />
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        We will use encrypted storage to protect
                                                        your password.
                                                    </p>
                                                </TabsContent>
                                                <TabsContent value="key">
                                                    <div className="flex flex-row gap-1.5">
                                                        <Select name="key" defaultValue={'0'}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select Key" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="0">
                                                                    None
                                                                </SelectItem>
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
                                                            <Button
                                                                variant="outline"
                                                                type={'button'}
                                                            >
                                                                <Plus />
                                                            </Button>
                                                        </AddKey>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </TabsContent>
                                        <TabsContent value="agent" className={'grid gap-3 mt-1'}>
                                            <Label>
                                                Agent Mode <AgentModeDialog />
                                            </Label>
                                            <Tabs
                                                value={agentMode}
                                                onValueChange={(e) => {
                                                    setAgentMode(
                                                        e === 'active' ? 'active' : 'passive'
                                                    );
                                                }}
                                            >
                                                <TabsList className="w-full">
                                                    <TabsTrigger value="active">Active</TabsTrigger>
                                                    <TabsTrigger value="passive">
                                                        Passive
                                                    </TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="active" className="mt-1">
                                                    <div className="flex flex-row gap-2">
                                                        <div className="flex-2 grid gap-3">
                                                            <Label htmlFor="host">
                                                                Listen IP / Hostname
                                                                <IsRequired />
                                                            </Label>
                                                            <Input
                                                                id="host"
                                                                name="address"
                                                                placeholder="1.2.3.4"
                                                            />
                                                        </div>
                                                        <div className="flex-1 grid gap-3">
                                                            <Label htmlFor="port">
                                                                Port
                                                                <IsRequired />
                                                            </Label>
                                                            <Input
                                                                id="port"
                                                                name="port"
                                                                placeholder="22"
                                                                type="number"
                                                                min={1}
                                                                max={65535}
                                                                step={1}
                                                                defaultValue={52819}
                                                            />
                                                        </div>
                                                    </div>
                                                    <p
                                                        className={
                                                            'mt-2 text-xs text-muted-foreground'
                                                        }
                                                    >
                                                        Once the server is added, the installation
                                                        command will be generated.
                                                    </p>
                                                </TabsContent>
                                                <TabsContent value="passive" className="mt-1">
                                                    <p className={'text-xs text-muted-foreground'}>
                                                        Once the server is added, the installation
                                                        command will be generated.
                                                    </p>
                                                </TabsContent>
                                            </Tabs>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="flex flex-row justify-between mt-1 gap-3">
                                        <Label htmlFor="monitor">Monitor Access</Label>
                                        <Switch
                                            id="monitor"
                                            name="monitor"
                                            checked={enableMonitor}
                                            onCheckedChange={(v) => {
                                                setEnableMonitor(v);
                                                if (!v) setEnableTerminal(true);
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-row justify-between gap-3">
                                        <Label htmlFor="terminal">Terminal Access</Label>
                                        <Switch
                                            id="terminal"
                                            name="terminal"
                                            checked={enableTerminal}
                                            onCheckedChange={(v) => {
                                                setEnableTerminal(v);
                                                if (!v) setEnableMonitor(true);
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
                                                <Label htmlFor="weight">Weight (Sort)</Label>
                                                <Input
                                                    id="weight"
                                                    name="weight"
                                                    placeholder="0"
                                                    type="number"
                                                    min={0}
                                                    step={1}
                                                    defaultValue={0}
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="note">Note (Private)</Label>
                                                <Input
                                                    id="note"
                                                    name="note"
                                                    max={255}
                                                    maxLength={255}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Label>Billing Information</Label>
                                    <Card className="py-4">
                                        <CardContent className="grid md:grid-cols-2 gap-3 px-4">
                                            <div className="grid gap-3">
                                                <Label htmlFor="provider">
                                                    Provider / Data Center
                                                </Label>
                                                <Input
                                                    id="provider"
                                                    name="provider"
                                                    placeholder="AWS, DigitalOcean, etc."
                                                    maxLength={255}
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="bill-cycle">Cycle</Label>
                                                <Select defaultValue="-1" name="cycle">
                                                    <SelectTrigger
                                                        id="bill-cycle"
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Select Cycle" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="-1">None</SelectItem>
                                                        <SelectItem value="0">One-Time</SelectItem>
                                                        <SelectItem value="1">Monthly</SelectItem>
                                                        <SelectItem value="2">Quarterly</SelectItem>
                                                        <SelectItem value="3">
                                                            Semi-Annually
                                                        </SelectItem>
                                                        <SelectItem value="4">Annually</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="start-time">
                                                    Start Time{' '}
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
                                                <DatePicker
                                                    id="start-time"
                                                    date={startTime}
                                                    setDate={setStartTime}
                                                />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="end-time">
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
                                                <DatePicker
                                                    id="end-time"
                                                    date={endTime}
                                                    setDate={setEndTime}
                                                />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="bill-note">
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
                                                    id="bill-amount"
                                                    name="amount"
                                                    placeholder="€100"
                                                    maxLength={255}
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="bill-auto-renew">Auto Renew</Label>
                                                <Switch
                                                    id="bill-auto-renew"
                                                    name="auto_renew"
                                                    defaultChecked
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Label>Network Information</Label>
                                    <Card className="py-4">
                                        <CardContent className="grid md:grid-cols-2 gap-3 px-4">
                                            <div className="grid gap-3">
                                                <Label htmlFor="bandwidth">Bandwidth</Label>
                                                <Input
                                                    id="bandwidth"
                                                    name="bandwidth"
                                                    placeholder="1Gbps"
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="traffic">Traffic</Label>
                                                <Input
                                                    id="traffic"
                                                    name="traffic"
                                                    placeholder="1TB/Mo"
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="traffic_type">Traffic Type</Label>
                                                <Select defaultValue="-1" name="traffic_type">
                                                    <SelectTrigger
                                                        id="traffic_type"
                                                        name="traffic_type"
                                                        className="w-full"
                                                    >
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
                                                <Label htmlFor="network-note">Note (Public)</Label>
                                                <Input
                                                    id="network-note"
                                                    name="note_public"
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
                            <Button type="submit" disabled={isLoading}>
                                <Loader
                                    className="animate-spin"
                                    style={{ display: isLoading ? 'inline-block' : 'none' }}
                                />
                                Add Server
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <AgentInstall
                open={isInstallOpen}
                setOpen={setIsInstallOpen}
                mode={agentMode}
                allow_monitor={enableMonitor}
                allow_terminal={enableTerminal}
                agent_uid={installConfig.agent_uid}
                public_key={installConfig.public_key}
                host={installConfig.host}
                port={installConfig.port}
                hub={installConfig.hub}
                enroll_token={installConfig.enroll_token}
            />
        </>
    );
};

export default AddServer;
