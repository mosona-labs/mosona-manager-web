import { Edit, ExternalLink } from 'lucide-react';
import md5 from 'md5';

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

const GravatarDialog = ({ email, username }: { email?: string; username: string }) => (
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
                <DialogTitle>Use gravatar.com to change your avatar</DialogTitle>
                <DialogDescription className={'space-y-1 mt-2'}>
                    <p>
                        Gravatar is a globally recognized avatar service that allows you to manage
                        your profile pictures across multiple websites.
                    </p>
                    <p>
                        Click the button below to visit Gravatar.com and update your avatar
                        associated with your email address.
                    </p>
                </DialogDescription>
            </DialogHeader>
            <div></div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <a href={'https://gravatar.com'} target={'_blank'}>
                    <Button>
                        <ExternalLink />
                        Go to gravatar.com
                    </Button>
                </a>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default GravatarDialog;
