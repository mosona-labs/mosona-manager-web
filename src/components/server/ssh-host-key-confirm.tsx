import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type SSHHostKeyConfirmProps = {
    fingerprint: string;
    changed: boolean;
    isLoading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function SSHHostKeyConfirm({
    fingerprint,
    changed,
    isLoading,
    onCancel,
    onConfirm,
}: SSHHostKeyConfirmProps) {
    const { t } = useTranslation();

    return (
        <AlertDialog open onOpenChange={(nextOpen) => !nextOpen && !isLoading && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="text-amber-600" size={20} />
                        {t(
                            changed
                                ? 'pages.serverForm.sshHostKeyChangedTitle'
                                : 'pages.serverForm.sshHostKeyTitle'
                        )}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t(
                            changed
                                ? 'pages.serverForm.sshHostKeyChangedDescription'
                                : 'pages.serverForm.sshHostKeyDescription'
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <code className="block break-all rounded-md border bg-muted p-3 text-xs">
                    {fingerprint}
                </code>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading} onClick={onCancel}>
                        {t('common.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isLoading}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                    >
                        {t('pages.serverForm.confirmSSHHostKey')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
