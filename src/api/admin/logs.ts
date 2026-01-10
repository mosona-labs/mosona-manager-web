import type { LogType } from '@/api/logs.ts';

import { baseAPI, type ResponseInterface } from '../base';

class ApiAdminLogsClass extends baseAPI {
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
            '/admin/logs?page=' +
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

const ApiAdminLogs = new ApiAdminLogsClass();
export default ApiAdminLogs;
