import { InfoIcon, MoveDownLeft, MoveUpRight } from 'lucide-react';

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

const AgentModeDialog = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className={'text-muted-foreground flex items-center gap-1 cursor-pointer'}>
                    <InfoIcon size={14} /> Help
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Introduction to Agent Mode</DialogTitle>
                    <DialogDescription>
                        You can choose agent mode when installing the agent on your server.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <h2 className={'text-lg font-semibold flex flex-row items-center gap-2'}>
                        <MoveUpRight size={16} /> Active Mode
                    </h2>
                    <p className={'opacity-80'}>
                        Hub will connects to the agent. This mode is suitable for servers with
                        public IP addresses or those within the same local network as the Mosona
                        Manager Hub.
                    </p>
                    <h2 className={'text-lg font-semibold flex flex-row items-center gap-2 mt-3'}>
                        <MoveDownLeft size={16} />
                        Passive Mode
                    </h2>
                    <p className={'opacity-80'}>
                        Agent will connects to the Hub. This mode is ideal for devices behind NAT or
                        firewalls, as it allows them to connect without requiring inbound ports to
                        be open.
                    </p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AgentModeDialog;
