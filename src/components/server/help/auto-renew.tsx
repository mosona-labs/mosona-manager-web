import { InfoIcon } from 'lucide-react';
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

const HelpAutoRenew = () => {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <InfoIcon size={14} className={'text-muted-foreground cursor-pointer'} />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('pages.serverForm.autoRenewTitle')}</DialogTitle>
                    <DialogDescription>{t('pages.serverForm.autoRenewDesc')}</DialogDescription>
                </DialogHeader>
                <div>
                    <h2 className={'text-lg font-semibold flex flex-row items-center gap-2'}>
                        {t('pages.serverForm.autoRenewEffect')}
                    </h2>
                    <p className={'opacity-80'}>{t('pages.serverForm.autoRenewEffectDesc')}</p>
                    <h2 className={'text-lg font-semibold flex flex-row items-center gap-2 mt-3'}>
                        {t('pages.serverForm.autoRenewCondition')}
                    </h2>
                    <p className={'opacity-80'}>{t('pages.serverForm.autoRenewConditionDesc')}</p>
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

export default HelpAutoRenew;
