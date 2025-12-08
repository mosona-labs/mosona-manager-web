import { ExternalLink } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';

const DownloadsTOTP = ({
    googlePlayLink,
    appleStoreLink,
    src,
    alt,
}: {
    googlePlayLink: string;
    appleStoreLink: string;
    src: string;
    alt: string;
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'ghost'} className={'h-20 flex-1'}>
                    <img src={src} alt={alt} className="h-12 w-12 my-2" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Downloads</DialogTitle>
                    <DialogDescription>
                        Choose your platform to download the authenticator app
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                    <a
                        target={'_blank'}
                        rel="noopener noreferrer"
                        href={googlePlayLink}
                        className={'flex-1'}
                    >
                        <Button variant={'outline'} className={'w-full'}>
                            <ExternalLink />
                            Google Play
                        </Button>
                    </a>
                    <a
                        target={'_blank'}
                        rel="noopener noreferrer"
                        href={appleStoreLink}
                        className={'flex-1'}
                    >
                        <Button variant={'outline'} className={'w-full'}>
                            <ExternalLink />
                            App Store
                        </Button>
                    </a>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DownloadsTOTP;
