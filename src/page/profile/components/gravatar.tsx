import { Edit, ExternalLink } from 'lucide-react';
import md5 from 'md5';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Button } from '@/components/ui/button.tsx';

const GravatarDialog = ({ email, username }: { email?: string; username: string }) => {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className={'w-16 h-16 relative'}>
                    <div
                        className={
                            'absolute cursor-pointer bg-black/60 rounded-full w-full h-full z-20 opacity-0 hover:opacity-100 transition flex justify-center items-center'
                        }
                    >
                        <Edit />
                    </div>
                    <Avatar className="w-16 h-16 transition-opacity">
                        <AvatarImage
                            src={`https://gravatar.webp.se/avatar/${md5(email || '')}?d=mm&s=512`}
                            alt={username.substring(0, 1)}
                        />
                        <AvatarFallback>{username.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{t('pages.profile.gravatarTitle')}</DialogTitle>
                    <DialogDescription className={'space-y-1 mt-2'}>
                        <p>{t('pages.profile.gravatarDesc1')}</p>
                        <p>{t('pages.profile.gravatarDesc2')}</p>
                    </DialogDescription>
                </DialogHeader>
                <div></div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <a href={'https://gravatar.com'} target={'_blank'}>
                        <Button>
                            <ExternalLink />
                            {t('pages.profile.goGravatar')}
                        </Button>
                    </a>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default GravatarDialog;
