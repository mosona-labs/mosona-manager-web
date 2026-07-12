import type { ReactNode } from 'react';

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
    const { t } = useTranslation();
    const { config, updateConfig } = useUser();

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('pages.monitor.chartSettings')}</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label>{t('pages.display.aggregation')}</Label>
                        <Select
                            value={config.defaultMonitorMode}
                            onValueChange={(e) => {
                                updateConfig({ defaultMonitorMode: e as 'avg' | 'max' | 'raw' });
                            }}
                        >
                            <SelectTrigger className={'w-full'}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="avg">
                                        {t('pages.display.average')}
                                    </SelectItem>
                                    <SelectItem value="max">
                                        {t('pages.display.maximum')}
                                    </SelectItem>
                                    <SelectItem value="raw">{t('pages.display.raw')}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-3">
                        <Label>{t('pages.display.minMax')}</Label>
                        <Select
                            value={config.defaultMinMaxMode}
                            onValueChange={(e) => {
                                updateConfig({
                                    defaultMinMaxMode: e as 'min-auto' | '0-auto' | '0-max',
                                });
                            }}
                        >
                            <SelectTrigger className={'w-full'}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="min-auto">
                                        {t('pages.display.minAuto')}
                                    </SelectItem>
                                    <SelectItem value="0-auto">0 - Auto</SelectItem>
                                    <SelectItem value="0-max">0 - Max</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SettingsDialog;
