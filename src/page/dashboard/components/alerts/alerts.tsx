import { useNavigate } from 'react-router-dom';
import {
    CpuIcon,
    EthernetPort,
    GlobeIcon,
    HardDrive,
    HardDriveDownloadIcon,
    HardDriveUploadIcon,
    MemoryStick,
    ServerIcon,
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import AlertItem from '@/page/dashboard/components/alerts/item.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
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
                <Tabs defaultValue="server">
                    <TabsList>
                        <TabsTrigger value="server">
                            <ServerIcon />
                            {serverName}
                        </TabsTrigger>
                        <TabsTrigger value="all">
                            <GlobeIcon />
                            All Server
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="server">
                        <div className="grid gap-2 mt-1">
                            <AlertItem
                                icon={<ServerIcon size={16} />}
                                server_id={serverID}
                                item={'status'}
                                title={'Server Down'}
                                description={
                                    'You will receive alert when the server down / back online.'
                                }
                                showThreshold={false}
                            />
                            <AlertItem
                                icon={<CpuIcon size={16} />}
                                server_id={serverID}
                                item={'cpu_usage'}
                                title={'CPU Usage'}
                                description={'You will receive alert when CPU usage is high.'}
                            />
                            <AlertItem
                                icon={<MemoryStick size={16} />}
                                server_id={serverID}
                                item={'memory_usage'}
                                title={'Memory Usage'}
                                description={'You will receive alert when Memory usage is high.'}
                            />
                            <AlertItem
                                icon={<HardDrive size={16} />}
                                server_id={serverID}
                                item={'disk_usage'}
                                title={'Disk Usage'}
                                description={'You will receive alert when Disk usage is high.'}
                            />
                            <AlertItem
                                icon={<HardDriveUploadIcon size={16} />}
                                server_id={serverID}
                                item={'read_iops'}
                                title={'Disk Read IOPS'}
                                defaultThreshold={20000}
                                maxThreshold={100000}
                                thresholdStep={1000}
                                description={'You will receive alert when Disk Read IOPS is high.'}
                                thresholdUnit={' ops/s'}
                            />
                            <AlertItem
                                icon={<HardDriveDownloadIcon size={16} />}
                                server_id={serverID}
                                item={'write_iops'}
                                title={'Disk Write IOPS'}
                                defaultThreshold={15000}
                                maxThreshold={100000}
                                thresholdStep={1000}
                                description={'You will receive alert when Disk Write IOPS is high.'}
                                thresholdUnit={' ops/s'}
                            />
                            <AlertItem
                                icon={<EthernetPort size={16} />}
                                server_id={serverID}
                                item={'bandwidth'}
                                title={'Bandwidth'}
                                description={'You will receive alert when Bandwidth usage is high.'}
                                defaultThreshold={800}
                                maxThreshold={5000}
                                thresholdStep={10}
                                thresholdUnit={' Mbps'}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="all"></TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default AlertDialog;
