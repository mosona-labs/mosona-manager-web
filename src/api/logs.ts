import { baseAPI, type ResponseInterface } from './base';

export type LogType = {
    time: string;
    level: string;
    user_id: number;
    username: string;
    email: string;
    category: string;
    message: string;
    ip: string;
    ip_country: string;
    ip_country_code: string;
    user_agent: string;
};

class ApiLogsClass extends baseAPI {
    async list(
        page: number,
        perPage: number,
        category: string,
        level: string,
        email: string,
        message: string
    ) {
        return this.getData<
            ResponseInterface<{
                logs: LogType[];
                total: number;
            }>
        >(
            '/v1/logs?page=' +
                page +
                '&page_size=' +
                perPage +
                '&category=' +
                category +
                '&level=' +
                level +
                '&email=' +
                email +
                '&message=' +
                message
        );
    }
}

const ApiLogs = new ApiLogsClass();
export default ApiLogs;
