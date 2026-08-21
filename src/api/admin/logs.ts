import type { LogListData, LogListParams } from '@/api/logs.ts';

import { baseAPI, type ResponseInterface } from '../base';

class ApiAdminLogsClass extends baseAPI {
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

        return this.getData<ResponseInterface<LogListData>>(`/admin/logs?${query.toString()}`);
    }
}

const ApiAdminLogs = new ApiAdminLogsClass();
export default ApiAdminLogs;
