import { baseAPI, type ResponseInterface } from './base';

export type ServerMinimalType = {
    id: number;
    name: string;
    weight: number;
    category: number;
};

export type ServerFullType = {
    id: number;
    category: number;
    name: string;
    address: string;
    port: number;
    username: string;
    key_id: number;
    allow_monitor: boolean;
    allow_terminal: boolean;
    weight: number;
    note: string;
    provider: string;
    cycle: number;
    start_time: string; // ISO timestamp from API
    end_time: string; // ISO timestamp from API
    amount: string;
    auto_renew: boolean;
    bandwidth: string;
    traffic: string;
    traffic_type: number;
    note_public: string;
};

class ApiServerClass extends baseAPI {
    async info(serverId: number) {
        return this.getData<ResponseInterface<ServerFullType>>('/v1/server/' + serverId);
    }

    async add(
        name: string,
        address: string,
        port: number,
        username: string,
        password: string,
        key_id: number,
        category_id: number,
        allow_monitor: boolean,
        allow_terminal: boolean,
        weight: number,
        // Information
        note: string,
        provider: string,
        cycle: number,
        startTime: Date | string,
        endTime: Date | string,
        amount: string,
        auto_renew: boolean,
        bandwidth: string,
        traffic: string,
        traffic_type: number,
        note_public: string
    ) {
        return this.postData<ResponseInterface<number>>('/v1/server', {
            name,
            address,
            port,
            username,
            password,
            key_id,
            category_id,
            allow_monitor,
            allow_terminal,
            weight,
            // Information
            note,
            provider,
            cycle,
            start_time: startTime,
            end_time: endTime,
            amount,
            auto_renew,
            bandwidth,
            traffic,
            traffic_type,
            note_public,
        });
    }

    async edit(
        serverId: number,
        name: string,
        address: string,
        port: number,
        username: string,
        password: string,
        key_id: number,
        category: number,
        allow_monitor: boolean,
        allow_terminal: boolean,
        weight: number,
        // Information
        note: string,
        provider: string,
        cycle: number,
        startTime: Date | string | null,
        endTime: Date | string | null,
        amount: string,
        auto_renew: boolean,
        bandwidth: string,
        traffic: string,
        traffic_type: number,
        note_public: string
    ) {
        return this.putData<ResponseInterface>(
            '/v1/server/' + serverId,
            {
                name,
                address,
                port,
                username,
                password,
                key_id,
                category,
                allow_monitor,
                allow_terminal,
                weight,
                // Information
                note,
                provider,
                cycle,
                start_time: startTime,
                end_time: endTime,
                amount,
                auto_renew,
                bandwidth,
                traffic,
                traffic_type,
                note_public,
            },
            false
        );
    }

    async setCategory(serverId: number, categoryId: number) {
        return this.putData<ResponseInterface>('/v1/server/' + serverId + '/category', {
            category_id: categoryId,
        });
    }
}

const ApiServer = new ApiServerClass();
export default ApiServer;
