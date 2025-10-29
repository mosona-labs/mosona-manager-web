import { baseAPI, type ResponseInterface } from './base';

export type MonitorType = {
    id: number;
    name: string;
    weight: number;
    category: number;
    // Information
    os: string;
    county: string;
    area: string;
    open_time: string;
    note: string;
    provider: string;
    cycle: number;
    start_time: string;
    end_time: string;
    amount: string;
    auto_renew: boolean;
    bandwidth: string;
    traffic: string;
    traffic_type: number;
    note_public: string;
};

export type ServerStatusType = {
    cpu: number;
    mem_total_mb: number;
    mem_used_mb: number;
    disk_total_gb: number;
    disk_used_gb: number;
    rx_kib_s: number;
    tx_kib_s: number;
    rx_total_mb: number;
    tx_total_mb: number;
    time: string;
};

class ApiMonitorClass extends baseAPI {
    async list() {
        return this.getData<
            ResponseInterface<{
                servers: MonitorType[];
                status: Record<number, ServerStatusType>;
                now: number;
            }>
        >('/v1/server/monitor');
    }
}

const ApiMonitor = new ApiMonitorClass();
export default ApiMonitor;
