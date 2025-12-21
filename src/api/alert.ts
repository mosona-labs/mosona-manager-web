import { baseAPI, type ResponseInterface } from '@/api/base.ts';

export type AlertType = {
    id: number;
    item: string;
    threshold: number;
    for_duration: number;
};

export type AlertsType = {
    status?: AlertType;
    cpu_usage?: AlertType;
    memory_usage?: AlertType;
    disk_usage?: AlertType;
    read_iops?: AlertType;
    write_iops?: AlertType;
    bandwidth?: AlertType;
};

class ApiAlertClass extends baseAPI {
    async list() {
        return this.getData<
            ResponseInterface<{
                alerts: Record<number, AlertsType>;
                team_alerts: AlertsType;
            }>
        >('/v1/alert');
    }

    async set(server_id: number, item: string, threshold: number, for_duration: number) {
        return this.putData<ResponseInterface<number>>('/v1/alert/' + server_id, {
            item,
            threshold,
            for_duration,
        });
    }

    async del(server_id: number, item: string) {
        return this.deleteData<ResponseInterface>('/v1/alert/' + item + '/' + server_id, true);
    }
}

const ApiAlert = new ApiAlertClass();
export default ApiAlert;
