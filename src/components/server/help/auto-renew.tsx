import { InfoIcon } from 'lucide-react';

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

const HelpAutoRenew = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <InfoIcon size={14} className={'text-muted-foreground cursor-pointer'} />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Introduction to Auto Renew</DialogTitle>
                    <DialogDescription>
                        This feature only affects Alerts and End Time.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <h2 className={'text-lg font-semibold flex flex-row items-center gap-2'}>
                        1. Effect
                    </h2>
                    <p className={'opacity-80'}>
                        Once the end time is reached, the Hub will automatically extend it to the
                        end of the next cycle. <br />
                        Expiration alerts configured for this server or globally will continue to
                        function as usual.
                    </p>
                    <h2 className={'text-lg font-semibold flex flex-row items-center gap-2 mt-3'}>
                        2. Condition
                    </h2>
                    <p className={'opacity-80'}>
                        Auto Renew only works when a valid recurring cycle is configured (one-time
                        or None is not supported) and an End Time is set.
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

export default HelpAutoRenew;
