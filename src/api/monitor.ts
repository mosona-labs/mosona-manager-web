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

export type MonitorDetailType = MonitorType & {
    hostname: string;
    cpu_name: string;
    core_c: number;
    core_t: number;
    kernel: string;
    ip: string;
    arch: string;
};

export type ServerStatusType = {
    cpu: number;
    mem_total_mb: number;
    mem_used_mb: number;
    swap_total_mb: number;
    swap_used_mb: number;
    disk_total_gb: number;
    disk_used_gb: number;
    disk_read_kib_s: number;
    disk_write_kib_s: number;
    disk_read_iops: number;
    disk_write_iops: number;
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

    async get(id: number) {
        return this.getData<
            ResponseInterface<{
                info: MonitorDetailType;
                now: string;
                stale: boolean;
            }>
        >(`/v1/server/monitor/${id}`);
    }

    async chart(id: number, time_frame: string) {
        return this.getData<ResponseInterface<ServerStatusType[]>>(
            `/v1/server/monitor/${id}/chart?time_frame=` + time_frame
        );
    }

    async realtime(id: number) {
        return this.getData<ResponseInterface<ServerStatusType>>(
            `/v1/server/monitor/${id}/realtime`
        );
    }
}

const ApiMonitor = new ApiMonitorClass();
export default ApiMonitor;
