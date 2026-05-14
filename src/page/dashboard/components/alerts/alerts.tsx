import { useNavigate } from 'react-router-dom';
import {
    CheckIcon,
    CircleHelp,
    ClockAlert,
    CpuIcon,
    EthernetPort,
    GlobeIcon,
    HardDrive,
    HardDriveDownloadIcon,
    HardDriveUploadIcon,
    MemoryStick,
    ServerIcon,
} from 'lucide-react';
import { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import AlertItem from '@/page/dashboard/components/alerts/item.tsx';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useAlert } from '@/page/dashboard/hook/useAlert.tsx';

const AlertDialog = ({
    open,
    onOpenChange,
    serverID,
    serverName,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    serverID: number;
    serverName: string;
}) => {
    const navigate = useNavigate();
    const { itemConfigs, loading } = useAlert();

    const [tab, setTab] = useState<'server' | 'all'>('server');
    const [overrideTeamAlerts, setOverrideTeamAlerts] = useState<boolean>(false);
    const scope = tab === 'all' ? 'team' : 'server';
    const alertTargetId = scope === 'team' ? 0 : serverID;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Alerts</DialogTitle>
                    <DialogDescription>
                        See{' '}
                        <span
                            className={
                                'font-semibold text-accent-foreground/80 hover:underline cursor-pointer'
                            }
                            onClick={() => {
                                navigate('/settings');
                            }}
                        >
                            notification settings
                        </span>{' '}
                        to configure how you receive alerts.
                    </DialogDescription>
                </DialogHeader>
                <Tabs
                    value={tab}
                    onValueChange={(v) => setTab(v as 'server' | 'all')}
                    className="min-w-0"
                >
                    <TabsList className="max-w-full">
                        <TabsTrigger value="server" className="min-w-0">
                            <ServerIcon />
                            <span className="block max-w-44 truncate sm:max-w-72">
                                {serverName}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="all" className="shrink-0">
                            <GlobeIcon />
                            All Server
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                {tab === 'all' && (
                    <Button
                        variant={'ghost'}
                        className={
                            'border-2 text-destructive border-destructive hover:text-destructive'
                        }
                        onClick={() => setOverrideTeamAlerts(!overrideTeamAlerts)}
                    >
                        {overrideTeamAlerts ? (
                            <div
                                className={
                                    'bg-destructive rounded-sm w-4 h-4 flex justify-center items-center'
                                }
                            >
                                <CheckIcon className={'text-background'} />
                            </div>
                        ) : (
                            <span className={'border-2 border-destructive rounded-sm w-4 h-4'} />
                        )}
                        Override Team Alerts
                    </Button>
                )}
                <div className="grid gap-2">
                    {itemConfigs.map((itemConfig) => (
                        <AlertItem
                            key={itemConfig.item}
                            icon={getAlertIcon(itemConfig.item)}
                            alertTargetId={alertTargetId}
                            scope={scope}
                            config={itemConfig}
                            override={overrideTeamAlerts}
                        />
                    ))}
                    {!loading && itemConfigs.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                            No configurable alerts are available right now.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const getAlertIcon = (item: string) => {
    switch (item) {
        case 'status':
            return <ServerIcon size={16} />;
        case 'cpu_usage':
            return <CpuIcon size={16} />;
        case 'memory_usage':
            return <MemoryStick size={16} />;
        case 'disk_usage':
            return <HardDrive size={16} />;
        case 'read_iops':
            return <HardDriveUploadIcon size={16} />;
        case 'write_iops':
            return <HardDriveDownloadIcon size={16} />;
        case 'bandwidth':
            return <EthernetPort size={16} />;
        case 'expiry_reminder':
            return <ClockAlert size={16} />;
        default:
            return <CircleHelp size={16} />;
    }
};

export default AlertDialog;
