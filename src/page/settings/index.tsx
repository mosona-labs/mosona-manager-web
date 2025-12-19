import DisplaySettings from '@/page/settings/cards/display-settings.tsx';
import NotificationSettings from '@/page/settings/cards/notification-settings.tsx';

const Settings = () => {
    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="opacity-65">Manage your client settings and notifications</p>
                </div>
            </div>
            <div className={'flex flex-col gap-4'}>
                <NotificationSettings />
                <DisplaySettings />
            </div>
        </div>
    );
};

export default Settings;
