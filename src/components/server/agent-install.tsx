import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import { Switch } from '@/components/ui/switch.tsx';

const AgentInstall = ({
    open,
    setOpen,
    mode,
    allow_monitor,
    allow_terminal,
    // Active
    agent_uid,
    public_key,
    host,
    port,
    // Passive
    hub,
    enroll_token,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    mode: 'active' | 'passive';
    allow_monitor: boolean;
    allow_terminal: boolean;
    // Active
    agent_uid?: string;
    public_key?: string;
    host?: string;
    port?: number;
    // Passive
    hub?: string;
    enroll_token?: string;
}) => {
    const [os, setOs] = useState<string>('linux');
    const [arch, setArch] = useState<string>('amd64');
    const [ipPreference, setIpPreference] = useState<'none' | 'ipv4' | 'ipv6'>('none');
    const [sudo, setSudo] = useState<boolean>(true);
    const binaryName = `agent${os === 'windows' ? '.exe' : ''}`;
    const downloadUrl = `https://github.com/mosona-labs/mosona-manager/releases/latest/download/agent_${os}_${arch}${
        os === 'windows' ? '.exe' : ''
    }`;

    const useSudo = sudo ? 'sudo ' : '';
    const script = [
        os === 'windows'
            ? `curl -L -o ${binaryName} ${downloadUrl} && ./${binaryName} install`
            : `curl -L -o ${binaryName} ${downloadUrl} && ${useSudo}chmod +x ./${binaryName} && ${useSudo}./${binaryName} install`,
        mode === 'active' ? 'active' : `passive`,
    ];
    if (!allow_monitor) {
        script.push('--no-monitor');
    }
    if (!allow_terminal) {
        script.push('--no-terminal');
    }
    script.push(
        mode === 'active'
            ? `${agent_uid} ${public_key} ${host} ${port}`
            : `"${hub}" "${enroll_token}"`
    );
    if (mode === 'passive' && ipPreference !== 'none') {
        script.push(`--${ipPreference}`);
    }

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Install Agent with {mode} mode</DialogTitle>
                    <DialogDescription>
                        Copy the following command and run it on your server to install the agent.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className={'flex items-center gap-2'}>
                        <Select
                            onValueChange={(e) => {
                                setOs(e as 'linux' | 'darwin' | 'windows');
                            }}
                            value={os}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="linux">Linux</SelectItem>
                                    <SelectItem value="darwin">Darwin</SelectItem>
                                    <SelectItem value="windows">Windows</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select
                            onValueChange={(e) => {
                                setArch(e as 'amd64' | 'arm64');
                            }}
                            value={arch}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="amd64">amd64</SelectItem>
                                    <SelectItem value="arm64">arm64</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    {mode === 'passive' && (
                        <Select
                            onValueChange={(e) => {
                                setIpPreference(e as 'none' | 'ipv4' | 'ipv6');
                            }}
                            value={ipPreference}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="none">No preference</SelectItem>
                                    <SelectItem value="ipv4">Use IPv4</SelectItem>
                                    <SelectItem value="ipv6">Use IPv6</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                    <p className={'font-mono break-all bg-muted p-3 rounded-md'}>
                        {script.join(' ')}
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant={'outline'}
                        onClick={() => {
                            navigator.clipboard.writeText(script.join(' ')).then(() => {
                                toast.success('Installation command copied to clipboard.');
                            });
                        }}
                    >
                        <Copy />
                    </Button>
                    <Switch
                        className={'data-[state=checked]:bg-amber-700'}
                        checked={sudo}
                        onCheckedChange={setSudo}
                    >
                        Use sudo
                    </Switch>
                    <div className={'flex-1'} />
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={() => setOpen(false)}>
                        Installed
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AgentInstall;
