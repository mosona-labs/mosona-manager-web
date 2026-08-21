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

export type LogListParams = {
    cursor?: string;
    pageSize: number;
    category: string;
    level: string;
    email: string;
    message: string;
    start: string;
    end: string;
};

export type LogListData = {
    logs: LogType[];
    next_cursor: string;
    has_more: boolean;
};

class ApiLogsClass extends baseAPI {
    async list(params: LogListParams) {
        const query = new URLSearchParams({
            page_size: params.pageSize.toString(),
            category: params.category,
            level: params.level,
            email: params.email,
            message: params.message,
            start: params.start,
            end: params.end,
        });
        if (params.cursor) query.set('cursor', params.cursor);

        return this.getData<ResponseInterface<LogListData>>(`/v1/logs?${query.toString()}`);
    }
}

const ApiLogs = new ApiLogsClass();
export default ApiLogs;
