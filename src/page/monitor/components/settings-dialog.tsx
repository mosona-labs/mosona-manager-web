import type { ReactNode } from 'react';

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
import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectGroup,
    SelectItem,
} from '@/components/ui/select.tsx';
import { useUser } from '@/context/useUser.tsx';

const SettingsDialog = ({ children }: { children: ReactNode }) => {
    const { config, updateConfig } = useUser();

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chart Settings</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label>Aggregation Mode for Graphs</Label>
                        <Select
                            value={config.defaultMonitorMode}
                            onValueChange={(e) => {
                                updateConfig({ defaultMonitorMode: e as 'avg' | 'max' | 'raw' });
                            }}
                        >
                            <SelectTrigger className={'w-full'}>
                                <SelectValue placeholder="Select a mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="avg">Average</SelectItem>
                                    <SelectItem value="max">Maximum</SelectItem>
                                    <SelectItem value="raw">Raw Data</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-3">
                        <Label>Max & Min Lines on Graphs</Label>
                        <Select
                            value={config.defaultMinMaxMode}
                            onValueChange={(e) => {
                                updateConfig({
                                    defaultMinMaxMode: e as 'min-auto' | '0-auto' | '0-max',
                                });
                            }}
                        >
                            <SelectTrigger className={'w-full'}>
                                <SelectValue placeholder="Select a mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="min-auto">Min - Auto</SelectItem>
                                    <SelectItem value="0-auto">0 - Auto</SelectItem>
                                    <SelectItem value="0-max">0 - Max</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
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

export default SettingsDialog;
