import { ImportIcon, Loader, Plus } from 'lucide-react';
import { type ChangeEvent, type DragEvent, type ReactNode, useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input.tsx';
import IsRequired from '@/components/required.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Card } from '@/components/ui/card.tsx';
import ApiKey from '@/api/key.ts';
import { ToastError } from '@/utils/toast.ts';
import { useUser } from '@/context/useUser.tsx';

const AddKey = ({ children }: { children?: ReactNode }) => {
    const { t } = useTranslation();
    const { refreshKeys } = useUser();

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [password, setPassword] = useState('');

    const [isDragging, setIsDragging] = useState(false);

    const handleFileRead = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setPrivateKey(content);
            if (!name) {
                setName(file.name.replace(/\.(pem|key|txt)$/, ''));
            }
        };
        reader.readAsText(file);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileRead(file);
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileRead(file);
        }
    };

    const handleSubmit = () => {
        if (!name || !privateKey) {
            return;
        }
        setIsLoading(true);
        ApiKey.add(name, privateKey, password)
            .then(() => {
                refreshKeys().then();
                setOpen(false);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (open) {
            setName('');
            setPrivateKey('');
            setPassword('');
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? (
                    children
                ) : (
                    <Button>
                        <Plus />
                        {t('pages.keychain.add')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('pages.keychain.addTitle')}</DialogTitle>
                    <DialogDescription>{t('pages.keychain.addDescription')}</DialogDescription>
                </DialogHeader>
                <div className={'space-y-4'}>
                    <div className={'grid gap-3'}>
                        <Label>
                            {t('pages.keychain.name')}
                            <IsRequired />
                        </Label>
                        <Input
                            type="text"
                            placeholder={t('pages.keychain.namePlaceholder')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={'grid gap-3'}>
                        <Label>
                            {t('pages.keychain.privateKey')}
                            <IsRequired />
                        </Label>
                        <Textarea
                            placeholder={t('pages.keychain.privateKeyPlaceholder')}
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            rows={6}
                            className={'max-h-64'}
                        />
                    </div>
                    <div className={'grid gap-3'}>
                        <Label>{t('pages.keychain.password')}</Label>
                        <Input
                            type="password"
                            placeholder={t('pages.keychain.passwordPlaceholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className={'grid gap-3'}>
                        <label htmlFor={'import-key'} className={'cursor-pointer'}>
                            <Card
                                className={`px-4 py-6 rounded-md text-center gap-2 bg-background transition-colors ${
                                    isDragging ? 'border-primary bg-primary/10' : ''
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <ImportIcon className={'mx-auto'} size={42} />
                                <p className={'text-xs text-muted-foreground'}>
                                    {t('pages.keychain.importHint')}
                                </p>
                            </Card>
                        </label>
                        <input
                            id={'import-key'}
                            type={'file'}
                            className={'invisible absolute'}
                            accept=".pem,.key,.txt"
                            onChange={handleFileSelect}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        disabled={isLoading || !name || !privateKey}
                        onClick={handleSubmit}
                    >
                        <Loader
                            className="animate-spin"
                            style={{ display: isLoading ? 'inline-block' : 'none' }}
                        />
                        {t('pages.keychain.add')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddKey;
