import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';

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
    const script = [
        `curl -o agent https://example.com/agent && ./agent install`,
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
