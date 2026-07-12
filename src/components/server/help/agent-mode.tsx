import type { ReactNode } from 'react';

import { InfoIcon, MoveDownLeft, MoveUpRight } from 'lucide-react';
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

const HelpAgentMode = ({ children }: { children?: ReactNode }) => {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children ? (
                    children
                ) : (
                    <div className={'text-muted-foreground flex items-center gap-1 cursor-pointer'}>
                        <InfoIcon size={14} /> {t('pages.serverForm.help')}
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('pages.serverForm.agentModeTitle')}</DialogTitle>
                    <DialogDescription>{t('pages.serverForm.agentModeDesc')}</DialogDescription>
                </DialogHeader>
                <div>
                    <h2 className={'text-lg font-semibold flex flex-row items-center gap-2'}>
                        <MoveUpRight size={16} /> {t('pages.serverForm.activeModeTitle')}
                    </h2>
                    <p className={'opacity-80'}>{t('pages.serverForm.activeModeDesc')}</p>
                    <h2 className={'text-lg font-semibold flex flex-row items-center gap-2 mt-3'}>
                        <MoveDownLeft size={16} />
                        {t('pages.serverForm.passiveModeTitle')}
                    </h2>
                    <p className={'opacity-80'}>{t('pages.serverForm.passiveModeDesc')}</p>
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

export default HelpAgentMode;
