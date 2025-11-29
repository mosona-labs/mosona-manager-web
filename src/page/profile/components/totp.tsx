import { Switch } from '@/components/ui/switch.tsx';
import { useUser } from '@/context/useUser.tsx';

const TOTPCard = () => {
    const { user } = useUser();

    return (
        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                        Two-Factor Authentication (TOTP)
                    </p>
                </div>
                <p className="text-xs text-muted-foreground">
                    Add an extra layer of security to your account using an authenticator app.
                </p>
            </div>
            <Switch checked={user?.totp_enabled} onCheckedChange={() => {}} />
        </div>
    );
};

export default TOTPCard;
