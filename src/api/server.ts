import { baseAPI, type ResponseInterface } from './base';

class ApiServerClass extends baseAPI {
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
}

const ApiServer = new ApiServerClass();
export default ApiServer;
