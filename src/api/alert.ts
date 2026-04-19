import { baseAPI, type ResponseInterface } from '@/api/base.ts';

export type AlertType = {
    id: number;
    item: string;
    threshold: number;
    for_duration: number;
};

export type AlertsType = Record<string, AlertType>;

export type AlertControlConfigType = {
    enabled: boolean;
    min?: number;
    max?: number;
    default?: number;
    unit?: string;
};

export type AlertItemConfigType = {
    item: string;
    label: string;
    description: string;
    threshold: AlertControlConfigType;
    for_duration: AlertControlConfigType;
    notify_once: boolean;
};

class ApiAlertClass extends baseAPI {
    async list() {
        return this.getData<
            ResponseInterface<{
                alerts: Record<number, AlertsType>;
                team_alerts: AlertsType;
                item_configs: AlertItemConfigType[];
            }>
        >('/v1/alert');
    }

    async set(
        server_id: number,
        item: string,
        threshold: number,
        for_duration: number,
        override: boolean = false
    ) {
        return this.putData<ResponseInterface<number>>('/v1/alert/' + server_id, {
            item,
            threshold,
            for_duration,
            override,
        });
    }

    async del(server_id: number, item: string, override: boolean = false) {
        return this.deleteData<ResponseInterface<number>>(
            '/v1/alert/' + item + '/' + server_id + '?override=' + override,
            true
        );
    }
}

const ApiAlert = new ApiAlertClass();
export default ApiAlert;
