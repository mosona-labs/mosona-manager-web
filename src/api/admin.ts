import { baseAPI, type ResponseInterface } from '@/api/base.ts';

export type SystemUsageStats = {
    cpu_usage: number;
    memory: number;
    time: string;
};

class ApiAdminClass extends baseAPI {
    async getDashboardStats() {
        return this.getData<
            ResponseInterface<{
                users: number;
                teams: number;
                servers: number;
                records: number;
                system: SystemUsageStats[];
            }>
        >('/admin/dashboard');
    }
}

const ApiAdmin = new ApiAdminClass();
export default ApiAdmin;
